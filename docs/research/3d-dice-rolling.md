# 3D Dice Rolling Research

## 1. Three.js + Cannon.js / Rapier

### Three.js + cannon-es (the maintained fork of Cannon.js)
- **Compatibility**: Excellent. Three.js and cannon-es integrate cleanly — both use the same coordinate conventions, and the pmndrs ecosystem treats them as a pair.
- **Setup complexity**: Moderate. You need to manually sync Three.js mesh transforms with Cannon body positions each frame. No built-in bridge; you write the loop yourself (`body.position.copy()`, `body.quaternion.copy()`).
- **cannon-es specifics**: Maintained fork by pmndrs at [github.com/pmndrs/cannon-es](https://github.com/pmndrs/cannon-es) (2k stars, actively maintained). Key improvements over original: tree-shakable ESM/CJS, TypeScript types, Y-axis cylinder orientation, sleeping body wake-on-force, `World.hasActiveBodies` flag for performance optimization.
- **Known limitations**: Pure JavaScript engine (~60fps on main thread unless wrapped in a Web Worker). Convex polyhedron collision is less precise than Rapier's. No native trimesh support that performs well.
- **Dice-specific demos**: Several exist:
  - [aqandrew/react-3d-dice](https://github.com/aqandrew/react-3d-dice) — DnD dice roller using R3F + cannon.js, explicitly cites D&D Beyond as inspiration (10 stars)
  - [Fmd0/DiceRollerSimulator-ThreeJS](https://github.com/Fmd0/DiceRollerSimulator-ThreeJS) — Three.js + Cannon.js dice simulator
  - [virtual-table/virtual-dice](https://github.com/virtual-table/virtual-dice) — Three.js + Cannon.js (older, 2019)
  - Original public-domain reference: [Anton Natarov's three.js/cannon.js dice roller](http://a.teall.info/dice) — the basis for most implementations

### Three.js + Rapier
- **Compatibility**: Good, but requires bridging. Rapier returns its own vector/quaternion types that are incompatible with Three.js — you need manual conversion helpers.
- **Setup complexity**: Higher than Cannon. Rapier is WASM-based, requiring lazy initialization behind `<Suspense>`. The WASM binary adds ~500KB gzipped to initial load.
- **Performance advantage**: Significantly faster than Cannon. Written in Rust, compiled to WASM. Handles many more bodies at higher fidelity without dropping frames. Supports convex hull colliders natively with good precision.
- **No direct dice demos** found using bare Rapier + Three.js (most dice projects use the R3F wrapper instead).

---

## 2. React Three Fiber + @react-three/cannon vs @react-three/rapier

### @react-three/cannon
- **Package**: v6.6.0, last published **3 years ago**. Still functional but stagnant.
- **Stars**: Monorepo has 3k GitHub stars.
- **Architecture**: Runs physics in a **Web Worker** via `@pmndrs/cannon-worker-api` — this is a key advantage, keeping the main thread free. Communicates via message passing.
- **API style**: Hook-based (`useBox`, `useSphere`, `usePlane`, etc.). Returns `[ref, api]` tuples where `api` lets you set position/velocity/forces imperatively. Subscription model for reactive property updates.
- **React 19 compatibility**: ⚠️ **Unknown risk**. Last publish was 3 years ago (React 18 era). No mention of React 19 in changelog or issues. The worker-message-passing architecture may have compatibility issues with React 19's concurrent features.
- **Maintenance signal**: Low. 28 open issues, 3 PRs. No recent releases. Community has largely migrated to Rapier.
- **Feature gaps**: No automatic collider generation from mesh geometry (you pick shape type per hook). No compound colliders out of the box. Limited joint support compared to Rapier.

### @react-three/rapier
- **Package**: v2.2.0, published **9 months ago**. Actively developed.
- **Stars**: 1.4k GitHub stars, 105k weekly downloads (vs 18k for cannon).
- **React 19 compatibility**: ✅ **Explicitly supported**. v2 release notes state: "adds support for @react-three/fiber v9 and react v19." For React 18, use v1 with fiber v8.
- **API style**: Declarative component-based (`<Physics>`, `<RigidBody>`, `<CuboidCollider>`). Wraps meshes declaratively rather than using hooks. More intuitive for React developers.
- **Key advantages over cannon**:
  - Automatic collider generation from mesh geometry (`colliders="hull"`, `"trimesh"`, `"cuboid"`, `"ball"`)
  - Built-in debug visualization (`<Physics debug>`)
  - Contact force events (`onContactForce`) — useful for impact sound triggers
  - Sleep/wake events (`onSleep`, `onWake`) — critical for knowing when dice have settled
  - Independent update loop option (`updateLoop="independent"`) for decoupling physics from render
  - World snapshots for replay/debugging
  - Collision filtering hooks for advanced behaviors
  - Instanced rigid body support (1000+ instances tested)
- **WASM caveat**: Requires `<Suspense>` boundary around `<Physics>` while WASM loads. Adds initial loading delay (~200-500ms depending on connection).
- **Known issues**: 36 open issues on GitHub. Some around quaternion/vector type mismatches with Three.js (partially mitigated by built-in `vec3`, `quat`, `euler` helpers). Cannot access rigid body properties during physics step (Rust aliasing) — must cache state in `useBeforePhysicsStep`.

### Recommendation
**@react-three/rapier is the clear winner** for this project. Active maintenance, React 19 support, better API ergonomics, superior physics quality, and sleep detection (essential for knowing when dice stopped rolling).

---

## 3. Existing Open-Source Dice Roller Components

### npm packages (Three.js-based 3D dice):

| Package | Tech Stack | Status | Notes |
|---------|-----------|--------|-------|
| **`aether-dice`** (v0.3.0) | Three.js + cannon-es | Fresh (published 1 month ago) | Framework-agnostic ESM. All polyhedral dice (d4-d100). **Predetermined outcomes** — you pass the result, it animates to that face. HDR edge bloom theming. Very polished. MIT license. Only 3 weekly downloads though — very new. |
| **`@3d-dice/dice-box-threejs`** (v0.0.12) | Three.js + cannon-es | Stale (last publish 4 years ago) | Based on Major's 3DDiceRoller / Teall dice. Predeterministic rolling (`6d6@4,4,4,4,4,4`). Themeable surfaces/colors/materials. 3.8k weekly downloads. Assets require manual copying. Version stuck at 0.0.12. |
| **`@3d-dice/dice-box`** (v1.1.4) | Non-Three.js | Stale (2 years ago) | Different implementation, not Three.js-based. 35k weekly downloads. |
| **`virtual-dice`** (v0.0.0) | Three.js + Cannon.js | Dead (7 years old) | Never properly versioned. |

### GitHub repos (not packaged as npm):

| Repo | Tech | Stars | Notes |
|------|------|-------|-------|
| [aqandrew/react-3d-dice](https://github.com/aqandrew/react-3d-dice) | React + R3F + cannon.js | 10 | WIP. Explicitly targets D&D Beyond style. Includes d10 creation guide. |
| [BenDMyers/DiceRoller](https://github.com/BenDMyers/DiceRoller) | React + Redux + Three.js | 7 | Recently updated. Uses animated transitions, unclear if physics-based. |
| [yulcat/dice-tower](https://github.com/yulcat/dice-tower) | Three.js + cannon-es | 0 | TRPG-focused, recently updated. |

### Assessment
- **No production-ready, well-maintained R3F dice roller exists** as an npm package.
- `aether-dice` is the closest to what we need but is framework-agnostic (vanilla DOM mounting), not R3F-native, and very new/unproven.
- `@3d-dice/dice-box-threejs` has the feature set but is frozen at 0.0.12 from 4 years ago.
- **Conclusion**: Building from scratch with R3F + Rapier is the right call. The existing options are either stale, wrong tech stack, or too immature.

---

## 4. Performance Considerations

### Bundle sizes (estimated, minified + gzipped):

| Package | Gzipped Size | Notes |
|---------|-------------|-------|
| `three` | ~250-350 KB | Full build. With Vite tree-shaking, actual used portion is typically 100-200 KB for a simple scene. Three.js exports are modular (`from 'three'` works well with Vite). |
| `@react-three/fiber` | ~25 KB | Thin wrapper, minimal overhead. |
| `@react-three/rapier` (JS) | ~30 KB | Just the wrapper code. |
| `rapier` WASM binary | ~500 KB gzipped | Loaded asynchronously. This is the big one. |
| `@react-three/drei` (optional helpers) | ~50-150 KB | Depends on which utilities you import (tree-shakes well). |
| **Total estimated** | **~350-700 KB** | Heavily dependent on tree-shaking and which drei helpers are used. |

### Load time implications:
- **Initial page load**: Three.js + R3F alone add ~150-200 KB gzipped. Acceptable for most apps.
- **Rapier WASM**: Loads asynchronously after first paint. On a typical broadband connection (5 Mbps), the 500 KB WASM takes ~1 second. On mobile 4G, ~2-3 seconds. Should be loaded behind a route-level code split or triggered only when the dice component mounts.
- **Code splitting strategy**: Lazy-load the entire dice canvas component with `React.lazy()`. The Three.js/Rapier bundle should NOT be in the initial critical bundle. This keeps the main app fast and only pays the cost when the user navigates to/opens the dice roller.

### Runtime performance:
- **Rapier**: Handles dozens of dice easily at 60fps. Even hundreds of instanced bodies perform well thanks to WASM.
- **Memory**: Each die needs a mesh (~50-100 triangles for low-poly dice) + a rigid body + colliders. 6-10 dice simultaneously = negligible memory impact.
- **GPU**: Standard WebGL rendering. Modern devices handle this trivially. Older Android phones may struggle with bloom post-processing — make it optional.
- **Vite compatibility**: All packages work well with Vite. Three.js has official Vite examples. Rapier's WASM loads fine with Vite's asset handling.

### Recommendations:
- Code-split the dice component at the route level
- Preload Rapier WASM only when the component mounts (not eagerly)
- Use `updateLoop="independent"` on `<Physics>` to avoid stepping when tab is inactive
- Enable body sleeping (`allowSleep`) so idle dice don't consume CPU
- Target low-poly dice geometries (box for d6, custom low-poly for others) — aim for <200 triangles per die
