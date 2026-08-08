# Handoff — 3D Physics Dice Roll Animation

**Date:** 2026-08-08
**Branch:** `feature/3d-dice-animation`
**Map:** [#60 — 3D physics-based dice roll animation for web-ui](https://github.com/tariqtkhawaja/dicecaster/issues/60)

---

## What to Build

A working prototype of a 3D physics-based dice roll animation in `@dicecaster/web-ui`. Dice tumble across the screen with realistic physics, bounce on a surface, and settle — similar to DnDBeyond's roller mechanic.

## Decisions Made (4 tickets resolved)

### 1. [Canvas integration strategy](https://github.com/tariqtkhawaja/dicecaster/issues/61)
- Overlay replacing ResultDisplay during rolling phase
- React.lazy + Suspense code-splitting (loads on first roll only, ~700KB gzipped)
- Responsive 16:9 canvas filling ResultDisplay container width
- Transparent background over app's gray-900
- PerspectiveCamera at `[0, 8, 6]` looking at origin (angle-down table view)
- Ambient (0x404040) + directional key light upper-right + fill lower-left
- Invisible Rapier floor collider at y=0

### 2. [Die geometry & colliders](https://github.com/tariqtkhawaja/dicecaster/issues/62)
- Procedural Three.js geometries (zero bundle cost):
  - D4 = TetrahedronGeometry
  - D6 = RoundedBox from @react-three/drei
  - D8 = OctahedronGeometry
  - D10 = PolyhedronGeometry (pentagonal trapezohedron vertices, custom)
  - D12 = DodecahedronGeometry
  - D20 = IcosahedronGeometry
- Face numbering: canvas textures (512×512 per die type), applied as material.map
- Colliders: RoundConvexHull from mesh vertices, border radius 0.01
- D100: two separate color-coded D10 meshes (tens vs units)

### 3. [Animation lifecycle](https://github.com/tariqtkhawaja/dicecaster/issues/63)
- Physics is **cosmetic only** — core `rollDice()` is source of truth
- Settle detection: Rapier body `onSleep` events + 5s fallback timeout
- Mid-roll interrupt: dispose all bodies, restart fresh
- Physics drives timing when 3D active; TUI cascade unaffected

### 4. [Result reading](https://github.com/tariqtkhawaja/dicecaster/issues/64)
- Skipped — dice land randomly, text result appears after settle

## Dependencies to Install

```bash
pnpm --filter @dicecaster/web-ui add three @react-three/fiber @react-three/rapier @react-three/drei
pnpm --filter @dicecaster/web-ui add -D @types/three
```

Versions: `@react-three/fiber` v9 (React 19), `@react-three/rapier` v2.

## Files to Create

```
packages/web-ui/src/components/
  DiceScene.tsx        # Main lazy-loaded component: <Canvas>, <Physics>, lighting, camera, floor
  DieMesh.tsx          # Per-die component: geometry selection, canvas texture, RigidBody wrapper
  dieTextures.ts       # Canvas texture generator factory (one per die type)
  d10Geometry.ts       # Custom pentagonal trapezohedron vertex/face data for PolyhedronGeometry
```

## Integration Points

In `ResultDisplay.tsx`, conditionally render the 3D overlay when `animation.phase === 'rolling'`:

```tsx
// When rolling, show lazy DiceScene instead of text
{animation.phase === 'rolling' ? (
  <Suspense fallback={<div className="text-yellow-400 animate-pulse">Rolling...</div>}>
    <DiceScene
      dieType={dieType}
      count={count}
      startedAt={animation.startedAt}
      onSettled={() => /* physics already flipped phase via sleep events */}
    />
  </Suspense>
) : (
  // existing text display
)}
```

DiceScene receives `dieType` and `count` from context (or props). On mount, spawns N rigid bodies with random initial impulses. Watches `startedAt` for mid-roll restart. Tracks sleep count → calls no-op onSettled (phase already managed by Rapier sleep triggering a ref callback that flips the local state, which propagates because DiceScene reads from the same `useRollResult()` context).

## Remaining Fog (decide during build)

- Multi-die rolling: simultaneous launch, staggered, or single combined?
- Table/boundary: invisible plane or bounded arena walls?
- Modifier visualization: floating text near dice or stays in ResultDisplay?
- Accessibility: reduced-motion preference support?

## Test State

- **198 tests passing** across 4 packages (core: 84, dnd: 23, react: 27, tui: 47, web-ui: 17)
- Web-ui tests cover DiceRoller, ResultDisplay, RollHistory behavioral interactions
- New 3D components will need their own tests (mock Three.js, test scene composition)

## Commands

```bash
pnpm build          # Build all packages
pnpm test           # Run all tests
pnpm --filter @dicecaster/web-ui dev   # Web UI dev server (port 3000)
```
