# Handoff — Dicecaster React Components Feature

**Date:** 2026-08-06
**Branch:** `main` (latest commit `49a9679`)

---

## What's Done

### @dicecaster/react package — COMPLETE
- Three focused hooks: `useRollConfig`, `useRollResult`, `useRollHistory`
- `RollProvider` with `HistoryAdapter` pattern, `defaultConfig`, `maxHistory`
- Animation model: phase enum (`idle` / `rolling` / `settled`) + `startedAt` timestamp anchor
- Auto-settle timing: 2000ms base + 150ms per die beyond first
- Barrel exports all types and hooks from `index.ts`
- **27 tests**, all passing

### TUI migration — COMPLETE
- Rewritten to consume `@dicecaster/react` hooks
- Old `RollContext.tsx` replaced with shared provider
- Filesystem `HistoryAdapter` wrapping existing `history.ts`
- `useTuiAnimation` hook reads `AnimationState` for cascade visuals
- **47 tests**, all passing

### Core + D&D packages — UNTOUCHED, STABLE
- `@dicecaster/core`: **84 tests** pass
- `@dicecaster/dnd`: **23 tests** pass

### Web UI — FUNCTIONAL BUT NEEDS POLISH
- Real components: `DiceRoller`, `ResultDisplay`, `RollHistory` (~250 lines)
- Correctly consumes `@dicecaster/react` hooks
- Vite dev server works, production build fixed (pnpm install creates proper symlinks)
- **Zero test coverage** — needs tests

### Total: **181 passing tests** across 4 packages

---

## Remaining Tickets

| # | Ticket | Status | Blocked by |
|---|--------|--------|------------|
| #57 | Fix web-ui TypeScript build | ✅ DONE (just needed `pnpm install` to create symlinks) | None |
| #58 | Add web-ui component tests | Open | #57 (done) |
| #59 | Build handoff document | ✅ DONE (this file) | None |

**Frontier:** #58 is the only remaining open ticket.

---

## Out of Scope (from original spec)

- Full production readiness of the web UI
- Mobile responsiveness beyond basic functionality
- Game-specific D&D components (attack rolls, ability checks)
- Publishing packages to npm
- Controlled mode (external state via props)
- Click-to-replay from history
- History export/share
- 3D dice animations (R3F/Framer Motion)
- shadcn/ui component integration

---

## Known Issues

- **React dist must be rebuilt** after the stub `RollProvider` was replaced with real implementation. Running `pnpm --filter @dicecaster/react build` fixes this. The old stub was in `dist/` from a previous commit; source was updated but dist wasn't rebuilt before TUI tests ran against it.
- **Web-ui requires `pnpm install`** after cloning or checking out to create workspace symlinks in `node_modules/@dicecaster/`. Without them, `tsc` cannot resolve `@dicecaster/react`.

---

## Commands

```bash
pnpm build          # Build all packages
pnpm test           # Run all tests (181 passing)
pnpm dev            # Start all dev servers in parallel
pnpm --filter @dicecaster/web-ui dev   # Web UI dev server (port 3000)
```
