# Deterministic Dice Landing Techniques

**Ticket**: #73 (Wayfinder map #70)
**Date**: 2026-08-08
**Status**: Research complete, recommendation made

---

## Problem Statement

The current dice roller determines roll values via `Math.random()` *before* animation. The physics simulation is purely cosmetic — the visual result doesn't need to match because the value was decided ahead of time. We need dice that visibly land showing a predetermined face value while looking like a natural, realistic roll.

Constraints:
- Must work on mobile devices
- Multiple dice rolling simultaneously with collisions
- Physics engine: Rapier (WASM) via @react-three/rapier v2
- Rendering: @react-three/fiber v9 + Three.js

---

## Technique Evaluation

### 1. Guided Velocities

**Concept**: Calculate initial linear/angular velocities that statistically bias the die toward landing on the target face.

**How it works**: Given the target face normal and the arena floor plane, compute an angular velocity vector and magnitude that would rotate the die ~N full rotations plus the required correction to land with the target face up. Add randomness so each roll looks different.

**Assessment**: ❌ **Not recommended**

- **Visual realism**: Poor. Requires very precise velocity calculations; small errors compound over bouncing. Looks "too perfect" or obviously rigged if tuned aggressively.
- **Implementation complexity**: High. Need inverse kinematics for tumbling — given a target orientation after N bounces off walls/floor, what initial velocity achieves it? This is fundamentally unsolvable analytically for chaotic multi-bounce scenarios.
- **Mobile performance**: No extra cost beyond initial calculation.
- **Multi-die collisions**: Broken by definition. Once two dice collide, the trajectory diverges unpredictably. Cannot account for inter-die collisions in advance.
- **Reliability**: Very low. Chaotic systems are inherently unpredictable. A single wall bounce changes everything.

**Verdict**: Fundamentally unreliable for our use case. Only works in idealized single-object scenarios with no collisions.

---

### 2. Mid-Animation Correction

**Concept**: Let the die tumble naturally for a period, then apply corrective impulses mid-flight to steer it toward the target face.

**How it works**: Monitor the die's state during tumbling. At a chosen intervention point (e.g., when velocity drops below threshold, or after N seconds), calculate the delta rotation needed from current orientation to target orientation. Apply a torque impulse to achieve this rotation over the remaining flight time.

**Assessment**: ⚠️ **Possible but risky**

- **Visual realism**: Medium. If timed well (during a high-speed tumble where corrections are masked by motion blur), can look plausible. Risk: sudden directional changes are visible.
- **Implementation complexity**: Medium-high. Need to detect "intervention window," calculate appropriate torque impulse accounting for remaining momentum, and handle edge cases where the die is already close to sleeping.
- **Mobile performance**: Minimal overhead — just periodic velocity/orientation checks.
- **Multi-die collisions**: Problematic. A collision right before the correction window invalidates the calculated impulse. Would need continuous monitoring and re-correction.
- **Reliability**: Medium. Works most of the time but edge cases (die lands on edge, gets stuck against wall) require fallback logic.

**Rapier-specific considerations**:
- Can use `rigidBody.applyTorqueImpulse()` for rotational correction
- Can use `rigidBody.setAngvel()` to directly set angular velocity
- Both wake the body automatically with the `true` flag
- Angular damping (`setAngularDamping()`) could be increased temporarily to help settle into target pose

**Verdict**: Viable as part of a hybrid approach, but not reliable enough as a standalone solution.

---

### 3. Final-Pose Interpolation (Recommended Hybrid Component)

**Concept**: Let physics run naturally until the die settles, then smoothly interpolate the mesh rotation to show the correct face.

**How it works**: 
1. Run the full physics simulation normally
2. When the die sleeps (or after a timeout), read its current quaternion
3. Compute the target quaternion for the desired face-up orientation
4. Use `Quaternion.slerp()` to smoothly animate from current → target over ~300-500ms
5. During interpolation, keep the Rapier body asleep (so physics doesn't fight us)

**Assessment**: ✅ **Strong candidate — best balance of realism and reliability**

- **Visual realism**: Good. If timed correctly (triggering when the die has nearly stopped), the final rotation looks like a natural "settle" or "nudge." Key insight: real dice often do a small final wobble before settling. We're simulating that wobble.
- **Implementation complexity**: Low-medium. Quaternion math is straightforward with Three.js built-ins. The main challenge is computing the correct target quaternion for each die type/face combination.
- **Mobile performance**: Negligible. One slerp animation per die at end of roll.
- **Multi-die collisions**: No interference. Each die interpolates independently after settling. Other dice may still be moving, which actually helps mask the interpolation.
- **Reliability**: Near-perfect. The interpolation guarantees the correct face regardless of how the physics played out.

**Rapier-specific implementation**:
```typescript
// In DieMesh.tsx, triggered on sleep:
const currentQuat = quat(rigidBody.current.rotation());
const targetQuat = getTargetQuaternion(dieType, faceValue); // see Face Orientation section below

// Decouple mesh from physics for the interpolation
rigidBody.current.sleep(); 

// Animate in useFrame:
const t = Math.min(elapsed / DURATION, 1);
const eased = easeOutCubic(t);
currentQuat.slerp(targetQuat, eased);
rigidBody.current.setRotation(currentQuat, false); // false = don't wake
```

**Critical detail**: Must NOT set the Rapier body rotation directly during interpolation, because R3F/Rapier syncs the mesh from the body each frame. Instead, either:
- Option A: Temporarily detach the mesh transform from the physics body during interpolation
- Option B: Set the body rotation each frame (with `wakeUp=false`) and let R3F sync naturally
- Option C: After interpolation completes, set the body's final rotation once

Option B is simplest — Rapier bodies that are asleep won't resist position/rotation changes.

**Verdict**: Most practical approach. Small amount of post-physics manipulation that's visually convincing when done right.

---

### 4. Kinematic Override

**Concept**: Switch the die from dynamic to kinematic body type at settle time, then control its position/orientation programmatically to the target face.

**How it works**:
1. Physics runs normally with dynamic bodies
2. On sleep/settle, change body type to kinematic
3. Set the kinematic body's target rotation to show the correct face
4. Optionally animate the transition with slerp

**Assessment**: ⚠️ **Viable but unnecessary complexity**

- **Visual realism**: Same as #3 (depends on how you animate the transition).
- **Implementation complexity**: Higher than #3. Changing body types in Rapier requires removing and recreating the body (Rapier doesn't support changing body type mid-simulation). In @react-three/rapier, this means unmounting/remounting the `<RigidBody>`, which causes React reconciliation issues.
- **Mobile performance**: Same as #3.
- **Multi-die collisions**: Body recreation moment could cause brief collision artifacts with neighboring dice.
- **Reliability**: Perfect (same guarantee as #3).

**Rapier limitation**: Rapier's `RigidBodyDesc` sets the type at creation. There's no `setType()` method. To switch from dynamic to kinematic, you must destroy and recreate the rigid body, losing all handles and refs.

**Verdict**: Technically possible but the body recreation requirement makes it more fragile than simple interpolation (#3).

---

### 5. Constraint-Based (Joints/Motors)

**Concept**: Attach a joint between the die and a fixed anchor point, using motor forces to pull the die toward the target orientation.

**How it works**: Create a spherical joint or custom constraint that applies restoring torque proportional to the angular distance from the target orientation. Like a spring pulling the die into place.

**Assessment**: ❌ **Not recommended**

- **Visual realism**: Poor. Motor-driven rotation looks mechanical, not natural. The die will spiral toward the target face rather than settling organically.
- **Implementation complexity**: Highest. Need to create joints dynamically, tune spring/damping parameters per die type, manage joint lifecycle.
- **Mobile performance**: Additional solver iterations per joint. With 6+ dice, this adds significant CPU load.
- **Multi-die collisions**: Joints interfere with collision response. A die being pulled by a motor while colliding with another die produces unrealistic behavior.
- **Reliability**: Medium. Springs oscillate; need careful critical damping tuning. May overshoot or never quite reach exact target.

**Rapier-specific**: Could use `useSphericalJoint` with motor configuration, but the motor API is designed for continuous rotation (like wheels), not positional targeting.

**Verdict**: Wrong tool for the job. Joints excel at continuous constrained motion, not one-time pose correction.

---

### 6. Texture Swap (What @3d-dice Actually Does)

**Concept**: Let physics run naturally, then swap the texture/material indices on the geometry faces so the displayed number matches the target value.

**How it works** (from `@3d-dice/dice-box-threejs` source):
1. Simulate the throw completely
2. Read the landed face value from the die's orientation
3. If it doesn't match the target, clone the geometry and swap material indices between the landed face and target face
4. Replace the mesh's geometry with the swapped version

**Assessment**: ⚠️ **Works but hacky**

- **Visual realism**: Deceptive. The die physically lands on one face, but the texture shows a different number. Under scrutiny (close camera angles, reflections), the mismatch between physical orientation and displayed value could be noticeable. However, for typical viewing distances, it's invisible.
- **Implementation complexity**: Medium. Requires per-face material indices and geometry cloning. Our current setup uses canvas textures per die, not per-face materials.
- **Mobile performance**: Geometry cloning and material recreation at end of each roll. Acceptable but wasteful.
- **Multi-die collisions**: No interference.
- **Reliability**: Perfect. Always shows the right number.

**Our compatibility issue**: Our `DieMesh` uses a single canvas texture mapped onto the entire die geometry. The `@3d-dice` approach requires each face to have its own material index (multi-material geometry). Our geometry doesn't currently support this.

**Verdict**: Clever workaround but incompatible with our current texture system without significant refactoring. Also ethically questionable — you're literally lying about which face is up.

---

## Recommended Approach: Two-Phase Hybrid

**Primary technique**: Final-pose interpolation (#3)
**Fallback/enhancement**: Mid-animation correction (#2) for early-settle cases

### Architecture

```
Roll Flow:
1. Determine target values (already done via Math.random())
2. Spawn dice with random initial velocities (existing code)
3. Physics runs normally — dice tumble, bounce, collide
4. Each die monitors its own kinetic energy
5. When die's velocity drops below threshold OR die sleeps:
   a. Check current face vs. target face
   b. If they differ, trigger settlement sequence:
      - Compute delta quaternion (current → target)
      - Over 300-500ms, slerp the body rotation toward target
      - Apply slight angular damping increase to prevent re-waking
      - Keep body asleep throughout interpolation
6. When all dice settled, fire onSettled callback
```

### Why This Wins

1. **Natural-looking**: The die tumbles realistically for the majority of the animation. Only the final 300-500ms involves manipulation, which reads as a natural "settle wobble."
2. **Simple**: Uses existing Rapier sleep detection + Three.js quaternion math. No new physics concepts needed.
3. **Robust**: Works regardless of collisions, bounces, or chaos. The correction happens after physics resolves.
4. **Mobile-friendly**: Zero runtime overhead during the tumble. One lightweight slerp animation per die at the end.
5. **Composable**: Each die operates independently. Adding/removing dice doesn't change the algorithm.

### Technical Details

#### Face Orientation Mapping

Each die type needs a mapping from face value → face normal (in local space). For a D6:
```
1: [0, 1, 0]    // top
2: [1, 0, 0]    // right
3: [0, 0, 1]    // front
4: [-1, 0, 0]   // left
5: [0, 0, -1]   // back
6: [0, -1, 0]   // bottom
```

For platonic solids (D4, D8, D12, D20), compute face normals from the geometry's vertex data. The face normal pointing closest to `[0, 1, 0]` (world up) is the "top" face.

#### Target Quaternion Computation

```typescript
function getTargetQuaternion(
  dieType: DieType,
  faceValue: number,
): THREE.Quaternion {
  const faceNormal = getFaceNormal(dieType, faceValue); // local space
  const up = new THREE.Vector3(0, 1, 0); // world up
  
  // Rotation that aligns faceNormal → up
  const q = new THREE.Quaternion();
  q.setFromUnitVectors(faceNormal, up);
  
  // Add random yaw around Y axis for natural variation
  const yaw = new THREE.Quaternion().setFromAxisAngle(up, Math.random() * Math.PI * 2);
  q.premultiply(yaw);
  
  return q;
}
```

#### Settlement Animation Hook

Add to `DieMesh.tsx`:

```typescript
function useSettlement(
  rigidBodyRef: RefObject<RapierRigidBody>,
  dieType: DieType,
  faceValue: number,
  isSleeping: boolean,
) {
  const phase = useRef<'tumbling' | 'settling' | 'done'>('tumbling');
  const startTime = useRef(0);
  const startQuat = useRef(new THREE.Quaternion());
  const targetQuat = useRef(new THREE.Quaternion());

  useEffect(() => {
    if (!isSleeping || phase.current !== 'tumbling') return;
    
    const body = rigidBodyRef.current;
    if (!body) return;

    const current = quat(body.rotation());
    const target = getTargetQuaternion(dieType, faceValue);
    
    // Skip if already showing correct face (within tolerance)
    if (current.angleTo(target) < 0.1) {
      phase.current = 'done';
      return;
    }

    startQuat.current.copy(current);
    targetQuat.current.copy(target);
    startTime.current = performance.now();
    phase.current = 'settling';
  }, [isSleeping, dieType, faceValue, rigidBodyRef]);

  useFrame(() => {
    if (phase.current !== 'settling' || !rigidBodyRef.current) return;

    const elapsed = (performance.now() - startTime.current) / 1000;
    const duration = 0.4; // 400ms settlement
    const t = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic

    const interpolated = startQuat.current.clone().slerp(targetQuat.current, eased);
    rigidBodyRef.current.setRotation(interpolated, false);

    if (t >= 1) {
      phase.current = 'done';
    }
  });
}
```

#### Detecting Current Face

To check if the die is already showing the correct face (and skip interpolation):

```typescript
function getCurrentFace(rigidBody: RapierRigidBody, dieType: DieType): number {
  const rot = quat(rigidBody.rotation());
  const up = new THREE.Vector3(0, 1, 0);
  
  let maxDot = -Infinity;
  let topFace = 1;
  
  for (let face = 1; face <= getSides(dieType); face++) {
    const normal = getFaceNormal(dieType, face);
    const worldNormal = normal.clone().applyQuaternion(rot);
    const dot = worldNormal.dot(up);
    if (dot > maxDot) {
      maxDot = dot;
      topFace = face;
    }
  }
  
  return topFace;
}
```

### Changes Required

| File | Change |
|------|--------|
| `DieMesh.tsx` | Add `useSettlement` hook; track sleep state; add `useFrame` for interpolation |
| New file: `faceOrientations.ts` | Face normal lookup tables for each die type |
| `DiceScene.tsx` | No changes needed — `onSleep` callback already wired |

### Edge Cases

1. **Die falls on edge**: Unlikely with convex hull colliders, but if it happens, the interpolation will rotate it to the nearest valid face orientation. The ease-out curve masks the snap.

2. **Multiple dice touching**: Since each die interpolates independently after sleeping, adjacent dice don't interfere. If die A finishes settling and die B's interpolation bumps into it, die B's Rapier body is asleep so no collision response occurs.

3. **Early sleep**: If a die stops very quickly (rare but possible with unlucky initial velocity), the settlement animation still plays — it just starts sooner. The short tumble followed by a deliberate "wobble into place" still reads as natural.

4. **D100 dual die**: Each D10 component settles independently. No special handling needed.

### Performance Budget

- Per-die settlement: One `Quaternion.slerp()` call per frame for ~24 frames (400ms at 60fps)
- Total for 6 dice: ~144 slerp operations across the entire scene
- Memory: Two temporary Quaternions per die (allocated once, reused)
- Net impact: Negligible on any device
