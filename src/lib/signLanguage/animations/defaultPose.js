// Rest-pose targets. Each entry is [boneName, axis, value].
// Used both for snap-on-load and for comprehensive animated reset between signs.
export const FULL_REST_TARGETS = [
  // Neck
  ['mixamorigNeck', 'x', Math.PI / 18],
  // Right arm chain — z stays at A-pose, x/y return to 0
  ['mixamorigRightArm',     'z', Math.PI / 3],  ['mixamorigRightArm',     'x', 0], ['mixamorigRightArm',     'y', 0],
  ['mixamorigRightForeArm', 'x', 0], ['mixamorigRightForeArm', 'y', 0], ['mixamorigRightForeArm', 'z', 0],
  ['mixamorigRightHand',    'x', 0], ['mixamorigRightHand',    'y', 0], ['mixamorigRightHand',    'z', 0],
  // Right fingers
  ['mixamorigRightHandThumb1', 'x', 0], ['mixamorigRightHandThumb1', 'y', 0], ['mixamorigRightHandThumb1', 'z', 0],
  ['mixamorigRightHandThumb2', 'x', 0], ['mixamorigRightHandThumb2', 'y', 0], ['mixamorigRightHandThumb2', 'z', 0],
  ['mixamorigRightHandThumb3', 'x', 0], ['mixamorigRightHandThumb3', 'y', 0], ['mixamorigRightHandThumb3', 'z', 0],
  ['mixamorigRightHandIndex1', 'x', 0], ['mixamorigRightHandIndex1', 'y', 0], ['mixamorigRightHandIndex1', 'z', 0],
  ['mixamorigRightHandIndex2', 'x', 0], ['mixamorigRightHandIndex2', 'y', 0], ['mixamorigRightHandIndex2', 'z', 0],
  ['mixamorigRightHandIndex3', 'x', 0], ['mixamorigRightHandIndex3', 'y', 0], ['mixamorigRightHandIndex3', 'z', 0],
  ['mixamorigRightHandMiddle1', 'x', 0], ['mixamorigRightHandMiddle1', 'y', 0], ['mixamorigRightHandMiddle1', 'z', 0],
  ['mixamorigRightHandMiddle2', 'x', 0], ['mixamorigRightHandMiddle2', 'y', 0], ['mixamorigRightHandMiddle2', 'z', 0],
  ['mixamorigRightHandMiddle3', 'x', 0], ['mixamorigRightHandMiddle3', 'y', 0], ['mixamorigRightHandMiddle3', 'z', 0],
  ['mixamorigRightHandRing1', 'x', 0], ['mixamorigRightHandRing1', 'y', 0], ['mixamorigRightHandRing1', 'z', 0],
  ['mixamorigRightHandRing2', 'x', 0], ['mixamorigRightHandRing2', 'y', 0], ['mixamorigRightHandRing2', 'z', 0],
  ['mixamorigRightHandRing3', 'x', 0], ['mixamorigRightHandRing3', 'y', 0], ['mixamorigRightHandRing3', 'z', 0],
  ['mixamorigRightHandPinky1', 'x', 0], ['mixamorigRightHandPinky1', 'y', 0], ['mixamorigRightHandPinky1', 'z', 0],
  ['mixamorigRightHandPinky2', 'x', 0], ['mixamorigRightHandPinky2', 'y', 0], ['mixamorigRightHandPinky2', 'z', 0],
  ['mixamorigRightHandPinky3', 'x', 0], ['mixamorigRightHandPinky3', 'y', 0], ['mixamorigRightHandPinky3', 'z', 0],
  // Left arm chain — z stays at A-pose, x/y return to 0
  ['mixamorigLeftArm',     'z', -Math.PI / 3], ['mixamorigLeftArm',     'x', 0], ['mixamorigLeftArm',     'y', 0],
  ['mixamorigLeftForeArm', 'x', 0], ['mixamorigLeftForeArm', 'y', 0], ['mixamorigLeftForeArm', 'z', 0],
  ['mixamorigLeftHand',    'x', 0], ['mixamorigLeftHand',    'y', 0], ['mixamorigLeftHand',    'z', 0],
  // Left fingers
  ['mixamorigLeftHandThumb1', 'x', 0], ['mixamorigLeftHandThumb1', 'y', 0], ['mixamorigLeftHandThumb1', 'z', 0],
  ['mixamorigLeftHandThumb2', 'x', 0], ['mixamorigLeftHandThumb2', 'y', 0], ['mixamorigLeftHandThumb2', 'z', 0],
  ['mixamorigLeftHandThumb3', 'x', 0], ['mixamorigLeftHandThumb3', 'y', 0], ['mixamorigLeftHandThumb3', 'z', 0],
  ['mixamorigLeftHandIndex1', 'x', 0], ['mixamorigLeftHandIndex1', 'y', 0], ['mixamorigLeftHandIndex1', 'z', 0],
  ['mixamorigLeftHandIndex2', 'x', 0], ['mixamorigLeftHandIndex2', 'y', 0], ['mixamorigLeftHandIndex2', 'z', 0],
  ['mixamorigLeftHandIndex3', 'x', 0], ['mixamorigLeftHandIndex3', 'y', 0], ['mixamorigLeftHandIndex3', 'z', 0],
  ['mixamorigLeftHandMiddle1', 'x', 0], ['mixamorigLeftHandMiddle1', 'y', 0], ['mixamorigLeftHandMiddle1', 'z', 0],
  ['mixamorigLeftHandMiddle2', 'x', 0], ['mixamorigLeftHandMiddle2', 'y', 0], ['mixamorigLeftHandMiddle2', 'z', 0],
  ['mixamorigLeftHandMiddle3', 'x', 0], ['mixamorigLeftHandMiddle3', 'y', 0], ['mixamorigLeftHandMiddle3', 'z', 0],
  ['mixamorigLeftHandRing1', 'x', 0], ['mixamorigLeftHandRing1', 'y', 0], ['mixamorigLeftHandRing1', 'z', 0],
  ['mixamorigLeftHandRing2', 'x', 0], ['mixamorigLeftHandRing2', 'y', 0], ['mixamorigLeftHandRing2', 'z', 0],
  ['mixamorigLeftHandRing3', 'x', 0], ['mixamorigLeftHandRing3', 'y', 0], ['mixamorigLeftHandRing3', 'z', 0],
  ['mixamorigLeftHandPinky1', 'x', 0], ['mixamorigLeftHandPinky1', 'y', 0], ['mixamorigLeftHandPinky1', 'z', 0],
  ['mixamorigLeftHandPinky2', 'x', 0], ['mixamorigLeftHandPinky2', 'y', 0], ['mixamorigLeftHandPinky2', 'z', 0],
  ['mixamorigLeftHandPinky3', 'x', 0], ['mixamorigLeftHandPinky3', 'y', 0], ['mixamorigLeftHandPinky3', 'z', 0],
];

const resolveBone = (ref, name) =>
  ref.avatar?.getObjectByName?.(name) || ref.bones?.[name] || null;

// Snap pose — applies immediately, no animation. Sets arm z-rotation to A-pose
// and zeroes out x/y for the main arm bones so every model starts from a known
// state regardless of its bind pose.
export const snapToRestPose = (ref) => {
  for (const [name, axis, value] of FULL_REST_TARGETS) {
    const bone = resolveBone(ref, name);
    if (bone) bone.rotation[axis] = value;
  }
};

// Animated return — builds a frame of 'auto'-direction tuples for every bone
// that has drifted from rest. Bones already at rest are skipped so the frame
// drains instantly (no extra pause) when nothing needs fixing.
export const defaultPose = (ref) => {
  const frame = [];
  for (const [name, axis, value] of FULL_REST_TARGETS) {
    const bone = resolveBone(ref, name);
    if (!bone) continue;
    if (Math.abs(bone.rotation[axis] - value) > 0.001) {
      frame.push([name, 'rotation', axis, value, 'auto']);
    }
  }

  if (frame.length === 0) return;

  ref.animations.push(frame);
  if (!ref.pending) {
    ref.pending = true;
    ref.animate();
  }
};

export default defaultPose;
