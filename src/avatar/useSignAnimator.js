import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { defaultPose, snapToRestPose, FULL_REST_TARGETS } from '../lib/signLanguage/animations/defaultPose';
import * as alphabets from '../lib/signLanguage/animations/alphabets';
import * as words from '../lib/signLanguage/animations/words';

// Base nudge speed in radians per frame at 60 fps. Multiplied by the user's
// speed slider and scaled by delta time so playback is frame-rate independent.
const BASE_SPEED   = 0.10;
const TARGET_FPS   = 60;
const DEFAULT_PAUSE_MS = 350;

// Bone-name lookup that normalises all common Mixamo naming variants into the
// bare "mixamorigRightArm" form used by the sign animations:
//   mixamorig:RightArm  (colon — standard Mixamo / RPM export)
//   mixamorig_RightArm  (underscore — gltfpack-optimised RPM export)
//   RightArm_51         (no prefix + numeric suffix — some RPM exports)
//   RightArm_03         (numeric suffix only)
const indexBoneNode = (node, byName) => {
  if (!node?.name) return;
  const raw = node.name;
  byName[raw] = node;

  const bare = raw.replace(/_\d+$/, '');
  byName[bare] = byName[bare] || node;

  const noColon = bare.replace(/^mixamorig:/, 'mixamorig');
  byName[noColon] = byName[noColon] || node;

  const noUnderscore = bare.replace(/^mixamorig_/, 'mixamorig');
  byName[noUnderscore] = byName[noUnderscore] || node;

  if (!noColon.startsWith('mixamorig') && !noUnderscore.startsWith('mixamorig')) {
    byName['mixamorig' + bare] = byName['mixamorig' + bare] || node;
  }
};

// Bone-name lookup that normalises all common Mixamo naming variants into the
// bare "mixamorigRightArm" form used by the sign animations:
//   mixamorig:RightArm  (colon — standard Mixamo / RPM export)
//   mixamorig_RightArm  (underscore — gltfpack-optimised RPM export)
//   RightArm_51         (no prefix + numeric suffix — some RPM exports)
//   RightArm_03         (numeric suffix only)
// Two-pass strategy:
//   1. isBone nodes via traverse (works for standard exports where isBone=true)
//   2. SkinnedMesh.skeleton.bones directly (catches exports where isBone is not set)
const buildBoneIndex = (scene) => {
  const byName = {};

  scene?.traverse?.((node) => {
    if (node.isBone) indexBoneNode(node, byName);
  });

  scene?.traverse?.((node) => {
    if (node.isSkinnedMesh && node.skeleton) {
      node.skeleton.bones.forEach((b) => indexBoneNode(b, byName));
    }
  });

  return byName;
};

// Build a cleanup frame containing only bones that have drifted from rest.
// When all bones are clean (the common case) this returns an empty array and
// no extra frame is pushed, so there is no phantom 350 ms pause.
const buildPreSignReset = (ref) => {
  const frame = [];
  for (const [boneName, axis, value] of FULL_REST_TARGETS) {
    const bone = ref.avatar?.getObjectByName?.(boneName) || ref.bones?.[boneName];
    if (!bone) continue;
    if (Math.abs(bone.rotation[axis] - value) > 0.001) {
      frame.push([boneName, 'rotation', axis, value, 'auto']);
    }
  }
  return frame;
};

export function useSignAnimator(scene) {
  // Single mutable controller object — kept in a ref so React renders don't
  // recreate it. The queue-based animation engine mutates this in place.
  const ctrl = useRef({
    pending:        false,
    paused:         false,
    pauseUntil:     0,
    animations:     [],   // FIFO of frames; see _step()
    characters:     [],   // legacy hook expected by some sign functions
    bones:          {},   // name → Three.Bone
    avatar:         null, // scene root (so signs can use getObjectByName)
    speedScale:     1,    // multiplied by BASE_SPEED
    animate:        () => {},
  });

  // ── Bone discovery ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!scene) return;
    ctrl.current.avatar = scene;
    ctrl.current.bones  = buildBoneIndex(scene);

    // Drop any in-flight animation when the model swaps
    ctrl.current.animations.length = 0;
    ctrl.current.pending = false;

    // Snap the arms into A-pose right away so the avatar never appears in
    // the raw T-pose bind.
    snapToRestPose(ctrl.current);
  }, [scene]);

  // ── Bone resolver ──────────────────────────────────────────────────────────
  const _getBone = (name) => {
    const byScene = ctrl.current.avatar?.getObjectByName?.(name);
    return byScene || ctrl.current.bones[name] || null;
  };

  // ── Per-frame engine step ─────────────────────────────────────────────────
  // Each entry in ctrl.animations[0] is a 5-tuple [bone, action, axis, limit,
  // sign]. sign can be '+', '-', or 'auto' (auto-detect from current position).
  // We nudge bone[action][axis] toward limit by `speed * dt`.
  // Tuples that have reached their limit are removed; once the inner array is
  // empty we shift the outer entry off and schedule a short pause.
  const _step = (deltaSeconds) => {
    const c = ctrl.current;
    if (!c.pending) return;

    if (c.paused) {
      if (performance.now() < c.pauseUntil) return;
      c.paused = false;
    }

    if (c.animations.length === 0) {
      c.pending = false;
      return;
    }

    const frame = c.animations[0];

    // ── Control entries ────────────────────────────────────────────────────
    // ['done', cb]  → fire callback, advance immediately
    // ['pause', ms] → block engine for ms
    if (frame[0] === 'done' && typeof frame[1] === 'function') {
      try { frame[1](); } catch { /* swallow — promise consumer is gone */ }
      c.animations.shift();
      return;
    }
    if (frame[0] === 'pause' && typeof frame[1] === 'number') {
      c.paused     = true;
      c.pauseUntil = performance.now() + frame[1];
      c.animations.shift();
      return;
    }

    // ── Tuple list ─────────────────────────────────────────────────────────
    const step = BASE_SPEED * c.speedScale * deltaSeconds * TARGET_FPS;

    for (let i = frame.length - 1; i >= 0; i--) {
      const tuple = frame[i];
      if (!Array.isArray(tuple) || tuple.length < 4) { frame.splice(i, 1); continue; }
      const [boneName, action, axis, limit, dirSpec] = tuple;
      const bone = _getBone(boneName);
      if (!bone || !bone[action]) { frame.splice(i, 1); continue; }

      const target  = bone[action];
      const current = target[axis];

      // 'auto' (or missing) direction: choose dynamically so reset frames
      // work regardless of which direction the bone drifted from rest.
      const dir = (dirSpec === '+' || dirSpec === '-')
        ? dirSpec
        : (current <= limit ? '+' : '-');

      if (dir === '+') {
        if (current < limit) {
          target[axis] = Math.min(current + step, limit);
        } else {
          frame.splice(i, 1);
        }
      } else {
        if (current > limit) {
          target[axis] = Math.max(current - step, limit);
        } else {
          frame.splice(i, 1);
        }
      }

      // Defensive: if a tuple somehow drives the axis to NaN/Infinity,
      // snap back to 0 so the skin matrix doesn't blow up the whole mesh.
      if (!Number.isFinite(target[axis])) {
        // eslint-disable-next-line no-console
        console.warn('[SignAnimator] non-finite rotation on', boneName, axis, '→ reset to 0');
        target[axis] = 0;
        frame.splice(i, 1);
      }
    }

    if (frame.length === 0) {
      c.animations.shift();
      c.paused     = true;
      c.pauseUntil = performance.now() + DEFAULT_PAUSE_MS / Math.max(c.speedScale, 0.1);
    }
  };

  ctrl.current.animate = () => { ctrl.current.pending = true; };

  useFrame((_, delta) => _step(Math.min(delta, 0.05)));

  // ── Public API ─────────────────────────────────────────────────────────────

  const _waitForDrain = () =>
    new Promise((resolve) => {
      ctrl.current.animations.push(['done', () => resolve(true)]);
      if (!ctrl.current.pending) {
        ctrl.current.pending = true;
      }
    });

  const sign = useCallback(async (text) => {
    if (!text || !ctrl.current.avatar) return true;

    const trimmed = String(text).trim();
    if (!trimmed) return true;

    // Before each word, push a cleanup frame for any bones left dirty by the
    // previous sign (e.g. HOME's forearm-y). If all bones are already at rest
    // this is a no-op — an empty frame is never pushed so no extra pause fires.
    const resetFrame = buildPreSignReset(ctrl.current);
    if (resetFrame.length > 0) {
      ctrl.current.animations.push(resetFrame);
      if (!ctrl.current.pending) ctrl.current.pending = true;
    }

    const tokens = trimmed.split(/\s+/);
    for (const token of tokens) {
      const upper = token.toUpperCase().replace(/[^A-Z]/g, '');
      if (!upper) continue;

      const wordFn = words[upper];
      if (typeof wordFn === 'function') {
        wordFn(ctrl.current);
      } else {
        for (const ch of upper) {
          const letterFn = alphabets[ch];
          if (typeof letterFn === 'function') letterFn(ctrl.current);
        }
      }
    }

    return _waitForDrain();
  }, []);

  const stop = useCallback(() => {
    ctrl.current.animations.length = 0;
    ctrl.current.pending    = false;
    ctrl.current.paused     = false;
    ctrl.current.pauseUntil = 0;
  }, []);

  const lowerArm = useCallback(async () => {
    if (!ctrl.current.avatar) return true;
    defaultPose(ctrl.current);
    return _waitForDrain();
  }, []);

  const setSpeed = useCallback((s) => {
    ctrl.current.speedScale = Math.max(0.25, Number(s) || 1);
  }, []);

  return useMemo(
    () => ({ sign, stop, lowerArm, setSpeed }),
    [sign, stop, lowerArm, setSpeed],
  );
}
