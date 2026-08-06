import React, { useState, useCallback } from 'react';
import { Box, Text, useInput, type Key } from 'ink';
import { useApp } from 'ink';
import { RollProvider, useRollConfig, useRollResult, useRollHistory } from '@dicecaster/react';
import { DieButtons, DIE_TYPES, Spinner, RollExpression, RollButton } from './components/index.js';
import { ResultDisplay } from './components/ResultDisplay.js';
import { HistoryPanel } from './components/HistoryPanel.js';
import { fsHistoryAdapter } from './fsHistoryAdapter.js';

type FocusArea = 'die-grid' | 'count-spinner' | 'modifier-spinner';

function LeftPanel() {
  const { exit } = useApp();
  const config = useRollConfig();
  const result = useRollResult();
  const [focusArea, setFocusArea] = useState<FocusArea>('die-grid');
  const [selectedDieIndex, setSelectedDieIndex] = useState(0);

  const handleInput = useCallback(
    (_input: string, key: Key) => {
      if (key.escape) {
        exit();
        return;
      }

      if (key.return || _input === ' ') {
        result.executeRoll();
        return;
      }

      if (focusArea === 'die-grid') {
        if (key.leftArrow) {
          setSelectedDieIndex((i) => Math.max(0, i - 1));
        } else if (key.rightArrow) {
          const next = Math.min(config.DIE_TYPES.length - 1, selectedDieIndex + 1);
          setSelectedDieIndex(next);
          const nextDie = config.DIE_TYPES[next];
          if (nextDie) config.setDieType(nextDie);
        } else if (key.downArrow || key.tab) {
          setFocusArea('count-spinner');
        }
      } else if (focusArea === 'count-spinner') {
        if (key.upArrow) {
          config.setCount(config.count + 1);
        } else if (key.downArrow) {
          config.setCount(config.count - 1);
        } else if (key.leftArrow) {
          setFocusArea('die-grid');
        } else if (key.rightArrow || key.tab) {
          setFocusArea('modifier-spinner');
        }
      } else if (focusArea === 'modifier-spinner') {
        if (key.upArrow) {
          config.setModifier(config.modifier + 1);
        } else if (key.downArrow) {
          config.setModifier(config.modifier - 1);
        } else if (key.leftArrow || key.tab) {
          setFocusArea('count-spinner');
        }
      }
    },
    [focusArea, selectedDieIndex, config, result.executeRoll, exit]
  );

  useInput(handleInput);

  return (
    <Box flexDirection="column" width="60%">
      <Box marginBottom={1}>
        <DieButtons selectedIndex={selectedDieIndex} />
      </Box>
      <Box flexDirection="row" gap={2}>
        <Spinner label="Count:" value={config.count} focused={focusArea === 'count-spinner'} />
        <Spinner label="Mod:" value={config.modifier} focused={focusArea === 'modifier-spinner'} />
      </Box>
      <Box marginTop={1}>
        <RollExpression expression={config.expression} />
      </Box>
      <RollButton focused={false} />
      <Box marginTop={1}>
        <ResultDisplay />
      </Box>
    </Box>
  );
}

function RightPanel() {
  const history = useRollHistory();
  return (
    <Box flexDirection="column" width="40%" borderStyle="single" borderColor="gray">
      <HistoryPanel entries={history.entries} />
    </Box>
  );
}

export function App() {
  return (
    <RollProvider historyAdapter={fsHistoryAdapter}>
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
