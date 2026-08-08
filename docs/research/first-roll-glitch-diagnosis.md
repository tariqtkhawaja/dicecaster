# First Roll Glitch Diagnosis

**Ticket:** #72 (from wayfinder map #70)  
**Date:** 2026-08-08  
**Status:** Root cause identified

---

## Summary

The first-roll glitch is a **confirmed race condition** between the settle timer in `RollProvider.executeRoll()` and the lazy-loading of the `DiceScene` component. The settle timer starts immediately when the user clicks "Roll" and fires unconditionally after ~2 seconds, regardless of whether the Three.js/Rapier WASM bundle has finished downloading and mounting. On the first roll, the bundle hasn't loaded yet when the timer expires, so the animation phase transitions to `"settled"` while the UI is still showing the Suspense fallback ("Rolling..."). When the bundle finally loads, the DiceScene mounts with `animation.phase === "settled"`, bypassing the rolling animation entirely.

---

## Exact Event Timeline on First Roll

Assuming a single D20 roll (settleDelay = 2000ms) and a slow connection where the WASM bundle takes ~3 seconds to download:

| Time | Component | Event | User Sees |
|------|-----------|-------|-----------|
| **T+0ms** | `DiceRoller.tsx:70` | User clicks "Roll" button, calling `executeRoll()` | Button disables (`phase === 'rolling'`) |
| **T+0ms** | `RollProvider.tsx:128-133` | `setAnimation({ phase: "rolling", ... })` — state updates immediately | Re-render triggered |
| **T+0ms** | `ResultDisplay.tsx:31` | `isRolling` becomes `true` (`animation.phase === 'rolling'`) | Enters the `<Suspense>` branch at line 50-61 |
| **T+0ms** | `ResultDisplay.tsx:4` | React encounters `lazy(() => import('./DiceScene'))` — module has never been loaded, so it returns a promise | Suspense boundary catches the suspension |
| **T+0ms** | Browser | Begins downloading the DiceScene chunk (Three.js + Rapier WASM, ~350-700KB gzipped) | **"Rolling..."** pulsing text (Suspense fallback, line 52) |
| **T+0ms** | `RollProvider.tsx:136-143` | Settle timer scheduled: `setTimeout(..., 2000)` — **no guard for scene readiness** | Still "Rolling..." |
| **T+~500ms** | Browser | Chunk partially downloaded, Rapier WASM instantiating | Still "Rolling..." |
| **T+2000ms** | `RollProvider.tsx:137-142` | **Settle timer fires.** `startedAt` matches, so `setAnimation` sets `phase: "settled"` | State now `"settled"`, but bundle still loading |
| **T+2000ms** | `ResultDisplay.tsx:31` | `isRolling` re-evaluates: `animation.phase === 'rolling'` → **false** | Exits the `<Suspense>` branch (line 50 condition fails) |
| **T+2000ms** | `ResultDisplay.tsx:63-90` | Renders the reduced-motion/text fallback path because `isRolling` is false | Shows die values as text (`"..."` or partial result), **no 3D scene** |
| **T+2000ms–3000ms** | Browser | Continues downloading bundle in background (the Suspense boundary was unmounted, but the import promise may still resolve) | Text display only |
| **T+~3000ms** | Browser | Bundle finally downloads. If React retries the Suspense render (it won't — `isRolling` is now false), DiceScene would mount. But since `isRolling === false`, the Suspense branch is not rendered. | **Glitch complete**: user saw "Rolling..." → text results, no 3D animation |

### What if the bundle loads *just before* the timer? (~1.8s):

| Time | Event |
|------|-------|
| T+1800ms | Bundle finishes, Suspense resolves, `DiceScene` mounts |
| T+1800ms | `DiceScene` receives `animation.phase === "rolling"` — good, animation plays |
| T+1800ms | `useSettleDetection` hook initializes with 5s fallback timer |
| T+2000ms | Provider's settle timer fires, sets `phase: "settled"` |
| T+2000ms | `ResultDisplay` exits Suspense branch, shows text results |
| **Result** | User sees ~200ms of 3D animation, then it cuts to text. Jarring but less broken. |

### Subsequent rolls (bundle cached):

| Time | Event |
|------|-------|
| T+0ms | Click "Roll", `executeRoll()` fires |
| T+0ms | `phase: "rolling"`, Suspense renders instantly (module cached) |
| T+0ms | `DiceScene` mounts synchronously, physics start |
| T+2000ms | Settle timer fires, `phase: "settled"` |
| T+2000ms | Text results shown |
| **Result** | Works correctly. Animation plays full duration. |

---

## Root Cause Analysis

### Primary Race Condition: Unconditional Settle Timer

**Location:** `RollProvider.tsx:136-143`

```typescript
const settleDelay = 2000 + (count - 1) * 150;
settleTimerRef.current = setTimeout(() => {
  setAnimation(prev => prev.startedAt === startedAt
    ? { ...prev, phase: "settled" }
    : prev
  );
}, settleDelay);
```

The timer starts at T+0 alongside the animation state. It has **no awareness** of whether the DiceScene has mounted. The only guard is `prev.startedAt === startedAt`, which prevents a *subsequent* roll from settling this one — but does nothing to prevent the timer from firing before the scene is ready.

### Secondary Issue: Suspense Fallback Masks the Problem

**Location:** `ResultDisplay.tsx:52`

The Suspense fallback shows "Rolling..." which looks like the animation is playing. In reality, the 3D scene doesn't exist yet. The user perceives progress that isn't happening. When the settle timer fires during the fallback, the transition from "Rolling..." text → result text happens without any 3D animation ever appearing.

### Tertiary Issue: Two Independent Settle Mechanisms

There are two parallel settle detection systems that don't coordinate:

1. **RollProvider timer** (`RollProvider.tsx:136-143`): Fixed delay, fires unconditionally, controls `animation.phase`
2. **Physics-based detection** (`DiceScene.tsx:60-89`): `useSettleDetection` counts sleeping dice, has its own 5s fallback, calls `onSettled`

The `onSettled` callback in `ResultDisplay.tsx:33-38` is explicitly a **no-op**:

```typescript
const handleSettled = useCallback(() => {
  // Phase transition is handled by the RollProvider's timer.
  // This callback is a no-op here because the physics settle detection
  // runs in parallel with the existing auto-settle; when all dice sleep
  // before the timer fires, the phase is already "settled" from the timer.
}, []);
```

So the physics-based detection can't override or delay the provider's timer. Even if all dice sleep at T+1500ms, the provider timer still fires at T+2000ms. And critically, if the scene never mounts (because the timer fired first), the physics detection never runs at all.

---

## Why This Only Happens on First Roll

The `React.lazy` + dynamic `import()` creates a code split. The DiceScene chunk (with Three.js ~600KB + Rapier WASM ~200KB) is fetched on first render. After the first successful load, the browser caches the chunk in HTTP cache + service worker (if present). Subsequent rolls resolve the lazy import nearly instantly (<10ms), so the scene mounts before the 2-second timer.

---

## Recommended Fixes (Ranked)

### Fix 1: Guard the settle timer behind a "scene ready" signal ⭐ BEST

**Approach:** Add a `sceneReady` ref/state to `RollProvider`. The DiceScene signals readiness via a new prop callback. The settle timer only starts once the scene confirms it's mounted.

**Changes:**
- `RollProvider`: Add `sceneReadyRef` and `onSceneReady` callback exposed via context
- `RollProvider.executeRoll`: Reset `sceneReadyRef.current = false` at start of roll; move `setTimeout` into a function that only runs when `sceneReadyRef.current` becomes true
- `ResultDisplay`: Pass `onSceneReady` through to `DiceScene`
- `DiceScene`: Call `onSceneReady()` in a `useEffect` on mount

**Pros:** Minimal changes, preserves lazy loading, works for both first and subsequent rolls, no extra network requests
**Cons:** Need to handle edge case where scene never mounts (add a max-delay fallback, e.g., 10s)

**Estimated effort:** Small (3 files, ~20 lines added)

### Fix 2: Preload the DiceScene chunk on app startup

**Approach:** Use `webpackPrefetch` or manual `import()` in the app shell to fetch the chunk during idle time before the user rolls.

**Changes:**
- In the app entry point or a top-level component, add: `if ('requestIdleCallback' in window) requestIdleCallback(() => import('./components/DiceScene'));` or use webpack magic comment: `lazy(() => import(/* webpackPrefetch: true */ './DiceScene'))`

**Pros:** Simple one-line change if using webpack magic comments; reduces but doesn't eliminate the race (still depends on network speed)
**Cons:** Doesn't guarantee the bundle loads before first roll on slow connections; still races on very slow networks; bundler-specific

**Estimated effort:** Trivial (1 file, 1 line)

### Fix 3: Delay the animation start until scene confirms mount

**Approach:** Introduce an intermediate `"pending"` phase. `executeRoll` sets `phase: "pending"` initially. When DiceScene mounts, it transitions to `"rolling"` and starts the timer.

**Changes:**
- Add `"pending"` to `AnimationPhase` type
- `executeRoll`: Set `phase: "pending"` instead of `"rolling"`
- `ResultDisplay`: Render Suspense for both `"pending"` and `"rolling"` phases
- `DiceScene`: On mount, call back to transition `"pending"` → `"rolling"` and start the settle timer

**Pros:** Cleanest state machine; accurate representation of what's happening
**Cons:** More invasive type change; timer logic moves from provider to component; more moving parts

**Estimated effort:** Medium (4 files, ~30 lines changed)

### Fix 4: Eager-load Three.js/Rapier (remove lazy loading)

**Approach:** Remove `React.lazy` and import `DiceScene` statically.

**Changes:**
- `ResultDisplay.tsx`: Replace `lazy(() => import(...))` with `import { DiceScene } from './DiceScene'`
- Remove `<Suspense>` wrapper

**Pros:** Eliminates the race entirely; simplest mental model
**Cons:** Significantly increases initial bundle size (~800KB+ added to main chunk); hurts initial page load time; defeats the purpose of code splitting

**Estimated effort:** Trivial (1 file, 3 lines changed)

---

## Recommendation

**Combine Fix 1 + Fix 2:** 

1. **Primary:** Implement Fix 1 (guard the settle timer). This is the correct architectural fix — the timer should never fire before the scene exists.

2. **Secondary:** Add webpack prefetch (Fix 2). This is a cheap optimization that makes the first-roll experience better on typical connections while Fix 1 handles the slow-connection edge case.

Together, these give you:
- Correct behavior on all connection speeds (Fix 1)
- Faster perceived performance on typical connections (Fix 2)
- Preserved code splitting for initial page load
- No new types or major architecture changes

---

## Files Involved

| File | Role | Lines of concern |
|------|------|------------------|
| `packages/react/src/RollProvider.tsx` | Settle timer, state transitions | 106-143 (executeRoll), 87 (timer ref) |
| `packages/web-ui/src/components/ResultDisplay.tsx` | Lazy loading, Suspense, rendering branches | 4 (lazy), 31 (isRolling), 33-38 (no-op onSettled), 50-61 (Suspense branch) |
| `packages/web-ui/src/components/DiceScene.tsx` | Scene mount, physics settle detection | 60-89 (useSettleDetection), 116-127 (component mount) |
| `packages/react/src/types.ts` | AnimationPhase type | 35 (`"idle" \| "rolling" \| "settled"`) |
| `packages/web-ui/src/components/DiceRoller.tsx` | Roll button trigger | 70-72 (onClick, disabled state) |
