import React, { useState, useCallback } from 'react';
import { Box, Text, useInput, type Key } from 'ink';
import { useApp } from 'ink';
import { DieButtons, DIE_TYPES, Spinner, RollExpression, ResultDisplay, RollButton, HistoryPanel } from './components/index.js';
import { RollProvider, useRoll } from './RollContext.js';

type FocusArea = 'die-grid' | 'count-spinner' | 'modifier-spinner';

function LeftPanel() {
  const { exit } = useApp();
  const { dieType, count, modifier, setDieType, setCount, setModifier, expression, lastResult, executeRoll } = useRoll();
  const [focusArea, setFocusArea] = useState<FocusArea>('die-grid');
  const [selectedDieIndex, setSelectedDieIndex] = useState(0);

  const handleInput = useCallback(
    (_input: string, key: Key) => {
      if (key.escape) {
        exit();
        return;
      }

      if (key.return || _input === ' ') {
        executeRoll();
        return;
      }

      if (focusArea === 'die-grid') {
        if (key.leftArrow) {
          setSelectedDieIndex((i) => Math.max(0, i - 1));
        } else if (key.rightArrow) {
          const next = Math.min(DIE_TYPES.length - 1, selectedDieIndex + 1);
          setSelectedDieIndex(next);
          const nextDie = DIE_TYPES[next];
          if (nextDie) setDieType(nextDie);
        } else if (key.downArrow || key.tab) {
          setFocusArea('count-spinner');
        }
      } else if (focusArea === 'count-spinner') {
        if (key.upArrow) {
          setCount(count + 1);
        } else if (key.downArrow) {
          setCount(count - 1);
        } else if (key.leftArrow) {
          setFocusArea('die-grid');
        } else if (key.rightArrow || key.tab) {
          setFocusArea('modifier-spinner');
        }
      } else if (focusArea === 'modifier-spinner') {
        if (key.upArrow) {
          setModifier(modifier + 1);
        } else if (key.downArrow) {
          setModifier(modifier - 1);
        } else if (key.leftArrow || key.tab) {
          setFocusArea('count-spinner');
        }
      }
    },
    [focusArea, selectedDieIndex, count, modifier, exit, setDieType, setCount, setModifier, executeRoll]
  );

  useInput(handleInput);

  return (
    <Box flexDirection="column" width="60%">
      <Box marginBottom={1}>
        <DieButtons selectedIndex={selectedDieIndex} />
      </Box>
      <Box flexDirection="row" gap={2}>
        <Spinner label="Count:" value={count} focused={focusArea === 'count-spinner'} />
        <Spinner label="Mod:" value={modifier} focused={focusArea === 'modifier-spinner'} />
      </Box>
      <Box marginTop={1}>
        <RollExpression expression={expression} />
      </Box>
      <RollButton focused={false} />
      <Box marginTop={1}>
        <ResultDisplay result={lastResult} />
      </Box>
    </Box>
  );
}

function RightPanel() {
  const { history } = useRoll();
  return (
    <Box flexDirection="column" width="40%" borderStyle="single" borderColor="gray">
      <HistoryPanel entries={history} />
    </Box>
  );
}

export function App() {
  return (
    <RollProvider>
      <Box flexDirection="column" padding={1}>
        <Text bold>Dicecaster</Text>
        <Box flexDirection="row" marginTop={1}>
          <LeftPanel />
          <RightPanel />
        </Box>
      </Box>
    </RollProvider>
  );
}
