# D6 White-Screen Crash: Root Cause Diagnosis

**Ticket:** #71 (from Wayfinder map #70)  
**Date:** 2026-08-08  
**Status:** Root cause identified, fix approach determined

---

## Executive Summary

The D6 white-screen crash is caused by **incorrectly wrapping `<RoundedBox>` inside a `<mesh>` element**. `RoundedBox` from `@react-three/drei` is a self-contained mesh component that renders its own internal `<mesh>` + `<extrudeGeometry>`. Wrapping it in another `<mesh>` creates a double-mesh nesting where the outer mesh has no geometry. When `@react-three/rapier`'s `colliders="hull"` traverses children to auto-generate convex hull colliders, it encounters this geometry-less outer mesh and crashes trying to access `undefined.clone().attributes.position.array`.

No error boundary exists anywhere in the app, so the unhandled React exception propagates up and kills the entire component tree — producing the white screen.

---

## Exact Root Cause

### The Problematic Code

`packages/web-ui/src/components/DieMesh.tsx:100-103`:

```tsx
{dieType === 'D6' && (
  <mesh material={mat}>
    <RoundedBox args={[scale * 1.4, scale * 1.4, scale * 1.4]} radius={0.08} smoothness={4} />
  </mesh>
)}
```

### What `RoundedBox` Actually Renders

From `@react-three/drei` source (`core/RoundedBox.js:26-36`):

```jsx
React.createElement("mesh", { ref, ...rest },
  React.createElement(RoundedBoxGeometry, { args, radius, smoothness, bevelSegments, creaseAngle }),
  children
)
```

`RoundedBox` **is itself a complete `<mesh>`** containing an `<extrudeGeometry>`. It accepts material props via `{...rest}` spread.

### The Resulting Scene Graph

```
RigidBody (colliders="hull")
└── group (position offset)
    └── mesh ← OUTER (from DieMesh, has material={mat}, NO geometry)
        └── mesh ← INNER (from RoundedBox, has extrudeGeometry)
            └── extrudeGeometry
```

### How Rapier Crashes

In `@react-three/rapier` source (`react-three-rapier.esm.js:369-392`), when `colliders="hull"`, rapier traverses all child objects looking for meshes:

```js
const colliderFromChild = child => {
  if ("isMesh" in child) {              // ✓ outer mesh passes this check
    const { geometry } = child;          // ✗ geometry = undefined (no direct geometry child)
    const { args } = getColliderArgsFromGeometry(geometry, "hull");
    // ...
  }
};
object.traverse(colliderFromChild);
```

Then in `getColliderArgsFromGeometry` (line 436-443):

```js
case "hull": {
  const g = geometry.clone();           // ✗ undefined.clone() → TypeError!
  return { args: [g.attributes.position.array] };
}
```

**Result:** `TypeError: Cannot read properties of undefined (reading 'clone')` — an unhandled exception during React rendering.

---

## Why Only D6?

Every other die type uses the correct R3F pattern — a geometry primitive directly inside `<mesh>`:

| Die Type | Pattern | Works? |
|----------|---------|--------|
| D4 | `<mesh><tetrahedronGeometry /></mesh>` | ✅ Geometry injected into parent mesh |
| **D6** | `<mesh><RoundedBox /></mesh>` | ❌ Double-mesh nesting |
| D8 | `<mesh><octahedronGeometry /></mesh>` | ✅ |
| D10 | `<mesh geometry={d10Geo} />` | ✅ Direct geometry prop |
| D12 | `<mesh><dodecahedronGeometry /></mesh>` | ✅ |
| D20 | `<mesh><icosahedronGeometry /></mesh>` | ✅ |
| D100 | `<mesh geometry={d10Geo.clone()} />` × 2 | ✅ |

Standard Three.js geometry primitives (`tetrahedronGeometry`, etc.) are designed to be children of `<mesh>` — R3F injects them as the mesh's `geometry` property. `RoundedBox` is NOT a geometry primitive; it's a full mesh component.

---

## Why No Graceful Error Handling?

There is **no error boundary** anywhere in the application:

- `App.tsx`: No `ErrorBoundary` wrapping the app tree
- `ResultDisplay.tsx`: Has `<Suspense>` for lazy loading `DiceScene`, but no error boundary
- `DiceScene.tsx`: No error boundary around `<Canvas>` or `<Physics>`

The `<Suspense>` boundary only catches promise rejections during lazy loading, not runtime rendering errors. When the `TypeError` throws inside the Canvas renderer, it bubbles up through the entire React tree uncaught, killing the app.

---

## Recommended Fix

### Primary Fix: Use `RoundedBox` Correctly

Replace the double-wrapped pattern with one of two approaches:

**Option A — Use `RoundedBox` standalone (recommended):**

```tsx
{dieType === 'D6' && (
  <RoundedBox
    args={[scale * 1.4, scale * 1.4, scale * 1.4]}
    radius={0.08}
    smoothness={4}
    material={mat}
  />
)}
```

This passes the material directly to `RoundedBox` via its `{...meshProps}` spread. `RoundedBox` renders as a single `<mesh>` with the extrude geometry, which rapier can correctly traverse.

**Option B — Use `RoundedBoxGeometry` as a geometry primitive:**

```tsx
{dieType === 'D6' && (
  <mesh material={mat}>
    <RoundedBoxGeometry
      args={[scale * 1.4, scale * 1.4, scale * 1.4]}
      radius={0.08}
      smoothness={4}
    />
  </mesh>
)}
```

This imports `RoundedBoxGeometry` instead of `RoundedBox` and uses it like the other geometry primitives. This matches the existing code pattern but requires an additional import.

**Recommendation:** Option A is cleaner — it eliminates the redundant wrapper and follows drei's documented usage pattern.

### Secondary Fix: Add an Error Boundary

Add an error boundary around the Canvas/Suspense region in `ResultDisplay.tsx` to prevent future white screens:

```tsx
class CanvasErrorBoundary extends React.Component<..., { error: Error | null }> {
  // standard error boundary implementation
  render() {
    if (this.state.error) {
      return <div className="text-red-400">3D scene failed to load</div>;
    }
    return this.props.children;
  }
}
```

Wrap the Suspense content:
```tsx
<Suspense fallback={...}>
  <CanvasErrorBoundary>
    <DiceScene {...props} />
  </CanvasErrorBoundary>
</Suspense>
```

---

## Additional Considerations

### Convex Hull Complexity

Even after fixing the nesting issue, the `colliders="hull"` approach on the extruded geometry will generate a convex hull from ~hundreds of vertices (the extrude geometry with `smoothness=4` and doubled `bevelSegments=8` produces a moderately complex mesh). For a cube-shaped die, this is overkill. A simple `colliders="cuboid"` would be more performant and physically accurate for a D6:

```tsx
<RigidBody
  colliders="cuboid"   // simpler, faster, accurate for a box
  restitution={0.5}
  friction={0.6}
  density={50}
  canSleep
  onSleep={onSleep}
>
```

However, keeping `colliders="hull"` works fine for correctness — the hull of a rounded box is still approximately box-shaped.

### Scale Factor

The `scale * 1.4` multiplier (0.6 × 1.4 = 0.84) makes the D6 larger than other dice. Combined with `radius={0.08}`, the rounding is subtle (~9.5% of half-width), which is visually appropriate for a physical D6 die.

---

## Files Involved

| File | Role |
|------|------|
| `packages/web-ui/src/components/DieMesh.tsx:100-103` | Bug location — incorrect RoundedBox usage |
| `packages/web-ui/src/components/DieMesh.tsx:86-88` | `colliders="hull"` trigger |
| `node_modules/@react-three/drei/core/RoundedBox.js` | Drei source — RoundedBox is a full mesh |
| `node_modules/@react-three/rapier/dist/react-three-rapier.esm.js:436-443` | Rapier crash site — `geometry.clone()` on undefined |
| `packages/web-ui/src/components/ResultDisplay.tsx` | Missing error boundary |
| `packages/web-ui/src/App.tsx` | Missing top-level error boundary |
