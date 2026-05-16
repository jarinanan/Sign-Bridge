import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { clone as cloneSkeleton } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { useAvatarPlaybackStore } from './playbackStore';
import { useSignAnimator } from './useSignAnimator';
import { useAvatarModelStore } from './avatarModelStore';

const LOCAL_MODEL = '/remy.lite.glb';

const ANGLE_LIMITS = {
  minPolarAngle:  Math.PI / 2.6,
  maxPolarAngle:  Math.PI / 1.65,
  minAzimuthAngle: -Math.PI / 6,
  maxAzimuthAngle:  Math.PI / 6,
};

// Camera framing works for standard Mixamo/RPM avatars (~1.8 m tall).
// Box3.setFromObject is unreliable for rigged characters (pre-skin bounds
// are in bind-space, not world-space), so we use fixed values instead.
const FRAMING = {
  cameraPosition: [0, 1.45, 2.2],
  orbitTarget:    [0, 1.2, 0],
  minDistance:    1.0,
  maxDistance:    4.0,
};

/* ─── AvatarRig ──────────────────────────────────────────────────────────── */

const AvatarRig = ({ modelUrl, onAnimatorReady }) => {
  const { scene: cachedScene } = useGLTF(modelUrl);

  // useGLTF returns a single shared Object3D. If two Canvases mount it (the
  // embedded panel + the fullscreen modal) or React StrictMode re-mounts in
  // dev, three.js detaches it from the first parent and the first canvas
  // empties. SkeletonUtils.clone gives every consumer an independent rig.
  const scene = useMemo(() => cloneSkeleton(cachedScene), [cachedScene]);

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isSkinnedMesh) {
        // SkinnedMesh AABB is stamped at bind-time; sign poses drift outside
        // it and the avatar would vanish without this flag.
        child.frustumCulled = false;
        if (child.material) {
          child.material.roughness = Math.min(child.material.roughness ?? 0.8, 0.85);
        }
      }
    });
  }, [scene]);

  const animator = useSignAnimator(scene);

  useEffect(() => {
    onAnimatorReady?.(animator);
  }, [animator, onAnimatorReady]);

  return <primitive object={scene} />;
};

/* ─── Avatar ────────────────────────────────────────────────────────────── */

const Avatar = forwardRef((_, ref) => {
  const [webglReady] = useState(() => {
    if (typeof document === 'undefined') return true;
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  });

  const cameraRef = useRef(null);
  const orbitRef  = useRef(null);

  const setApi    = useAvatarPlaybackStore((state) => state.setApi);
  const storedUrl = useAvatarModelStore((s) => s.modelUrl);
  const modelUrl  = storedUrl ?? LOCAL_MODEL;

  useEffect(() => { useGLTF.preload(modelUrl); }, [modelUrl]);

  // Stable callback — must not be re-created per render or the AvatarRig
  // useEffect that depends on it refires and re-publishes the animator,
  // cascading store updates that re-render this component, etc.
  const handleAnimatorReady = useCallback((api) => setApi(api), [setApi]);

  const zoomIn = useCallback(() => {
    if (!cameraRef.current) return;
    cameraRef.current.position.z = Math.max(
      FRAMING.minDistance,
      cameraRef.current.position.z - 0.2,
    );
    cameraRef.current.updateProjectionMatrix();
    orbitRef.current?.update();
  }, []);

  const zoomOut = useCallback(() => {
    if (!cameraRef.current) return;
    cameraRef.current.position.z = Math.min(
      FRAMING.maxDistance,
      cameraRef.current.position.z + 0.2,
    );
    cameraRef.current.updateProjectionMatrix();
    orbitRef.current?.update();
  }, []);

  const resetView = useCallback(() => {
    if (!cameraRef.current) return;
    cameraRef.current.position.set(...FRAMING.cameraPosition);
    cameraRef.current.updateProjectionMatrix();
    if (orbitRef.current) {
      orbitRef.current.target.set(...FRAMING.orbitTarget);
      orbitRef.current.update();
    }
  }, []);

  useImperativeHandle(ref, () => ({ zoomIn, zoomOut, resetView }), [zoomIn, zoomOut, resetView]);

  if (!webglReady) {
    return (
      <div className="w-full h-full min-h-112.5 rounded-xl bg-slate-100 flex items-center justify-center p-6 text-center text-slate-600">
        WebGL is not supported in this browser. Please update your browser or
        use a device with WebGL enabled.
      </div>
    );
  }

  return (
    <div
      className="w-full h-full min-h-112.5 rounded-xl overflow-hidden absolute inset-0"
      style={{ background: 'linear-gradient(170deg, #d8e3ee 0%, #e8eef0 45%, #dde8e0 100%)' }}
    >
      <Canvas
        frameloop="always"
        camera={{ position: FRAMING.cameraPosition, fov: 30, near: 0.1, far: 100 }}
        gl={{ alpha: true, antialias: true }}
        onCreated={({ camera, gl }) => {
          cameraRef.current = camera;
          gl.setClearColor(0x000000, 0);
          gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        }}
      >
        <ambientLight intensity={0.45} />
        <directionalLight position={[2.0, 3.5, 3.0]} intensity={1.15} color="#fff8f0" />
        <directionalLight position={[-1.8, 2.5, 2.5]} intensity={0.55} color="#f0f6ff" />
        <directionalLight position={[0, 3.5, -2.5]} intensity={0.30} color="#ffffff" />

        <AvatarRig
          key={modelUrl}
          modelUrl={modelUrl}
          onAnimatorReady={handleAnimatorReady}
        />

        <OrbitControls
          ref={orbitRef}
          enablePan={false}
          enableZoom
          minDistance={FRAMING.minDistance}
          maxDistance={FRAMING.maxDistance}
          minPolarAngle={ANGLE_LIMITS.minPolarAngle}
          maxPolarAngle={ANGLE_LIMITS.maxPolarAngle}
          minAzimuthAngle={ANGLE_LIMITS.minAzimuthAngle}
          maxAzimuthAngle={ANGLE_LIMITS.maxAzimuthAngle}
          target={FRAMING.orbitTarget}
        />
      </Canvas>
    </div>
  );
});

Avatar.displayName = 'Avatar';
// Preload all bundled local models so switching between them feels instant
useGLTF.preload(LOCAL_MODEL);
useGLTF.preload('/model.glb');
useGLTF.preload('/ready_player_me_harry_potter.glb');

export default Avatar;
