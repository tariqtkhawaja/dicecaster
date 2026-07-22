#!/usr/bin/env tsx
/**
 * PROTOTYPE — Throwaway TUI layout variants for dicecaster
 *
 * Question: What does the split-layout TUI actually look like in a terminal?
 * Ticket: https://github.com/tariqtkhawaja/dicecaster/issues/21
 *
 * Three structurally different layout variants, switchable with keys [!] [@] [#].
 * Press q to quit.
 *
 * Variant A — Split panel (controls left, history right)
 * Variant B — Tabbed layout (roll / history tabs at top)
 * Variant C — Compact overlay (history toggled with H key)
 */

import React, { useState, useCallback } from 'react';
import { render, useInput, Box, Text } from 'ink';

// ─── Constants & Types ──────────────────────────────────────────────────

const DIE_TYPES = ['D4', 'D6', 'D8', 'D10', 'D12', 'D20', 'D100'] as const;
const SIDES_MAP: Record<string, number> = {
  D4: 4, D6: 6, D8: 8, D10: 10, D12: 12, D20: 20, D100: 100,
};

interface HistoryEntry {
  expression: string;
  results: number[];
  modifier: number;
  total: number;
}

function mockRoll(count: number, sides: number): number[] {
  const results: number[] = [];
  for (let i = 0; i < count; i++) {
    results.push(Math.floor(Math.random() * sides) + 1);
  }
  return results;
}

// ─── Shared Components ──────────────────────────────────────────────────

function DieButtons({ selected }: { selected: string }) {
  return (
    <Box flexDirection="row" gap={2} flexWrap="wrap">
      {DIE_TYPES.map((die) => {
        const sel = die === selected;
        return (
          <Box
            key={die}
            paddingX={2}
            backgroundColor={sel ? 'blue' : 'transparent'}
          >
            <Text bold color={sel ? 'white' : 'gray'}>{die}</Text>
          </Box>
        );
      })}
    </Box>
  );
}

function NumberSpinner({ label, value }: { label: string; value: number }) {
  const display = value >= 0 ? `+${value}` : String(value);
  return (
    <Box flexDirection="column" alignItems="center">
      <Text dimColor>{label}</Text>
      <Text bold color="cyan">{display.padStart(4)}</Text>
    </Box>
  );
}

function RollButton({ disabled }: { disabled: boolean }) {
  return (
    <Box
      paddingX={3}
      backgroundColor={disabled ? 'gray' : 'green'}
    >
      <Text bold color={disabled ? 'black' : 'white'}>{disabled ? 'Rolling...' : ' ROLL '}</Text>
    </Box>
  );
}

function DiceDisplay({
  results,
  sides,
  isAnimating,
  large = false,
}: {
  results: number[];
  sides: number;
  isAnimating: boolean;
  large?: boolean;
}) {
  if (results.length === 0) {
    return (
      <Box justifyContent="center" minHeight={large ? 6 : 3}>
        <Text dimColor>Press ROLL to begin...</Text>
      </Box>
    );
  }

  const padWidth = Math.max(String(sides).length, 2);

  return (
    <Box flexDirection="row" gap={large ? 3 : 2} justifyContent="center" flexWrap="wrap">
      {results.map((val, i) => {
        let color: string = 'white';
        let borderColor: string = 'gray';
        let bold = false;

        if (isAnimating) {
          const phase = (Math.floor(Date.now() / 80) + i * 2) % 4;
          const colors = ['yellow', 'cyan', 'magenta', 'red'];
          color = colors[phase];
          borderColor = color;
        } else if (val === sides) {
          color = 'yellow';
          borderColor = 'yellow';
          bold = true;
        }

        return (
          <Box
            key={`die-${i}`}
            width={padWidth + 2}
            textAlign="center"
            borderColor={borderColor}
            borderStyle="round"
          >
            <Text color={color} bold={bold}>{String(val).padStart(padWidth)}{' '.repeat(padWidth - String(val).length)}</Text>
          </Box>
        );
      })}
    </Box>
  );
}

function HistoryPanel({ entries }: { entries: HistoryEntry[] }) {
  if (entries.length === 0) {
    return (
      <Box flexGrow={1}>
        <Text dimColor>No rolls yet.</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" flexGrow={1}>
      {entries.slice(0, 25).map((entry, idx) => (
        <Box key={`hist-${idx}`} flexDirection="row" justifyContent="spaceBetween">
          <Text color="cyan">{entry.expression}</Text>
          <Text dimColor>[{entry.results.join(',')}]</Text>
          <Text bold color="green">{entry.total}</Text>
        </Box>
      ))}
    </Box>
  );
}

function VariantBar({ current, names }: { current: number; names: string[] }) {
  return (
    <Box
      flexDirection="row"
      justifyContent="center"
      paddingTop={1}
      borderTopColor="gray"
      borderTopStyle="single"
    >
      <Text dimColor>
        [{ '!'}] {names[1]} | [{ '@'}] {names[2]} | [{ '#'}] {names[3]} | [q] quit
      </Text>
    </Box>
  );
}

// ─── Hook: roll state machine ────────────────────────────────────────────

function useRollState() {
  const [dieType, setDieType] = useState('D6');
  const [count, setCount] = useState(2);
  const [modifier, setModifier] = useState(0);
  const [results, setResults] = useState<number[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  const doRoll = useCallback(() => {
    if (isAnimating) return;
    const sides = SIDES_MAP[dieType];
    const r = mockRoll(count, sides);
    const total = r.reduce((a, b) => a + b, 0) + modifier;
    setResults(r);
    setIsAnimating(true);
    setTimeout(() => {
      setIsAnimating(false);
      const expr = `${count}${dieType}${modifier >= 0 ? '+' : ''}${modifier}`;
      setHistory((prev) => [{ expression: expr, results: r, modifier, total }, ...prev].slice(0, 50));
    }, 1500);
  }, [dieType, count, modifier, isAnimating]);

  return {
    dieType, setDieType,
    count, setCount,
    modifier, setModifier,
    results, history, isAnimating,
    doRoll,
  };
}

// ─── Variant A: Split Panel ─────────────────────────────────────────────

function VariantASplitPanel(state: ReturnType<typeof useRollState>) {
  return (
    <Box flexDirection="row" width="100%" flexGrow={1}>
      <Box flexDirection="column" width="60%" paddingX={1} paddingRight={2}>
        <Text bold color="white">{'▌ Roll'}</Text>

        <Box flexDirection="column" marginTop={1}>
          <Text dimColor>Select die:</Text>
          <DieButtons selected={state.dieType} />
        </Box>

        <Box flexDirection="column" flexGrow={1} marginTop={1} marginBottom={1} justifyContent="center">
          <DiceDisplay results={state.results} sides={SIDES_MAP[state.dieType]} isAnimating={state.isAnimating} />
        </Box>

        <Box flexDirection="row" gap={3} alignItems="flex-end">
          <NumberSpinner label="Count" value={state.count} />
          <NumberSpinner label="Mod" value={state.modifier} />
          <RollButton disabled={state.isAnimating} />
        </Box>
        <Text dimColor>[Enter/Space] roll  [↑↓] count  [+/-] mod</Text>
      </Box>

      <Box flexDirection="column" width="40%" paddingX={1} paddingLeft={2} borderLeftColor="gray" borderLeftStyle="single">
        <Text bold color="white">{'History ▐'}</Text>
        <Box flexDirection="column" flexGrow={1} marginTop={1}>
          <HistoryPanel entries={state.history} />
        </Box>
      </Box>
    </Box>
  );
}

// ─── Variant B: Tabbed Layout ────────────────────────────────────────────

function VariantBTabbed(state: ReturnType<typeof useRollState>, tab: 'roll' | 'history') {
  return (
    <Box flexDirection="column" width="100%" flexGrow={1}>
      <Box flexDirection="row">
        <Box paddingX={2} paddingY={1} backgroundColor={tab === 'roll' ? 'white' : 'transparent'}>
          <Text color={tab === 'roll' ? 'black' : 'white'} bold>
            {tab === 'roll' ? '◉ Roll' : '○ Roll'}
          </Text>
        </Box>
        <Box paddingX={2} paddingY={1} backgroundColor={tab === 'history' ? 'white' : 'transparent'}>
          <Text color={tab === 'history' ? 'black' : 'white'} bold>
            {tab === 'history' ? '◉ History' : '○ History'}
          </Text>
        </Box>
        <Text dimColor> [Tab] switch</Text>
      </Box>

      <Box flexDirection="column" flexGrow={1} paddingX={1} paddingTop={1}>
        {tab === 'roll' ? (
          <Box flexDirection="column" alignItems="center" flexGrow={1}>
            <Box flexDirection="column" marginBottom={2}>
              <Text dimColor>Select die:</Text>
              <DieButtons selected={state.dieType} />
            </Box>

            <Box flexDirection="row" gap={3} marginBottom={2}>
              <NumberSpinner label="Count" value={state.count} />
              <NumberSpinner label="Mod" value={state.modifier} />
              <RollButton disabled={state.isAnimating} />
            </Box>

            <Box flexGrow={1} justifyContent="center" minHeight={6}>
              <DiceDisplay results={state.results} sides={SIDES_MAP[state.dieType]} isAnimating={state.isAnimating} large />
            </Box>
            {!state.isAnimating && state.results.length > 0 && (
              <Text bold color="green">
                Total: {state.results.reduce((a, b) => a + b, 0) + state.modifier}
              </Text>
            )}
          </Box>
        ) : (
          <HistoryPanel entries={state.history} />
        )}
      </Box>
    </Box>
  );
}

// ─── Variant C: Compact Overlay ──────────────────────────────────────────

function VariantCOverlay(state: ReturnType<typeof useRollState>, showHistory: boolean) {
  return (
    <Box flexDirection="row" width="100%" flexGrow={1}>
      <Box flexDirection="column" width={showHistory ? '62%' : '100%'} paddingX={1}>
        <Text bold color="cyan">{'◇ Dicecaster'}</Text>

        <Box flexDirection="row" gap={1} marginTop={1}>
          {DIE_TYPES.map((die) => {
            const sel = die === state.dieType;
            return (
              <Box key={`c-die-${die}`} paddingX={1} backgroundColor={sel ? 'blue' : 'transparent'}>
                <Text bold color={sel ? 'white' : 'gray'}>{die}</Text>
              </Box>
            );
          })}
        </Box>

        <Box flexDirection="row" gap={2} marginTop={1} alignItems="flex-end">
          <NumberSpinner label="#" value={state.count} />
          <NumberSpinner label="+/-" value={state.modifier} />
          <RollButton disabled={state.isAnimating} />
          <Text dimColor>[H]istory</Text>
        </Box>

        <Box flexGrow={1} marginTop={2} justifyContent="center" minHeight={5}>
          <DiceDisplay results={state.results} sides={SIDES_MAP[state.dieType]} isAnimating={state.isAnimating} />
        </Box>
        {!state.isAnimating && state.results.length > 0 && (
          <Text bold color="green">
            {'═'.repeat(30)}  Total: {state.results.reduce((a, b) => a + b, 0) + state.modifier}
          </Text>
        )}
      </Box>

      {showHistory && (
        <Box flexDirection="column" width="38%" paddingX={1} borderLeftColor="cyan" borderLeftStyle="single">
          <Text bold color="cyan">{' ◇ History'}</Text>
          <Box flexDirection="column" flexGrow={1} marginTop={1}>
            <HistoryPanel entries={state.history} />
          </Box>
        </Box>
      )}
    </Box>
  );
}

// ─── App Root — single useInput at top level ─────────────────────────────

function App() {
  const [variant, setVariant] = useState(1);
  const names = ['', 'A — Split Panel', 'B — Tabbed', 'C — Overlay'];

  // Per-variant state
  const stateA = useRollState();
  const stateB = useRollState();
  const stateC = useRollState();

  const [tabB, setTabB] = useState<'roll' | 'history'>('roll');
  const [showHistoryC, setShowHistoryC] = useState(false);

  // Single input handler at the root
  useInput((input) => {
    if (input === 'q') process.exit(0);
    if (input === '!') setVariant(1);
    if (input === '@') setVariant(2);
    if (input === '#') setVariant(3);

    const active = variant === 1 ? stateA : variant === 2 ? stateB : stateC;

    if (input === 'enter' || input === ' ') active.doRoll();
    if (input === 'up') active.setCount((c) => Math.min(20, c + 1));
    if (input === 'down') active.setCount((c) => Math.max(1, c - 1));
    if (input === '+') active.setModifier((m) => Math.min(10, m + 1));
    if (input === '-') active.setModifier((m) => Math.max(-10, m - 1));

    if (variant === 2 && input === 'tab') setTabB((t) => (t === 'roll' ? 'history' : 'roll'));
    if (variant === 3 && (input === 'h' || input === 'H')) setShowHistoryC((v) => !v);
  });

  return (
    <Box flexDirection="column" width="100%" height="100%">
      {variant === 1 && <VariantASplitPanel {...stateA} />}
      {variant === 2 && <VariantBTabbed {...stateB} tab={tabB} />}
      {variant === 3 && <VariantCOverlay {...stateC} showHistory={showHistoryC} />}
      <VariantBar current={variant} names={names} />
    </Box>
  );
}

render(<App />);
