import React, { useState, useCallback } from 'react';
import { Box, Text, useInput, type Key } from 'ink';
import { useApp } from 'ink';
import { DieButtons, DIE_TYPES } from './components/DieButtons.js';

type FocusArea = 'die-grid' | 'spinners';

export function App() {
  const { exit } = useApp();
  const [focusArea, setFocusArea] = useState<FocusArea>('die-grid');
  const [selectedDieIndex, setSelectedDieIndex] = useState(0);

  const handleInput = useCallback(
    (_input: string, key: Key) => {
      if (key.escape) {
        exit();
        return;
      }

      if (focusArea === 'die-grid') {
        if (key.leftArrow) {
          setSelectedDieIndex((i) => Math.max(0, i - 1));
        } else if (key.rightArrow) {
          setSelectedDieIndex((i) =>
            Math.min(DIE_TYPES.length - 1, i + 1)
          );
        } else if (key.downArrow || key.tab) {
          setFocusArea('spinners');
        }
      } else if (focusArea === 'spinners') {
        if (key.upArrow || key.tab) {
          setFocusArea('die-grid');
        }
      }
    },
    [focusArea, exit]
  );

  useInput(handleInput);

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold>Dicecaster</Text>
      <Box marginTop={1}>
        <DieButtons selectedIndex={selectedDieIndex} />
      </Box>
    </Box>
  );
}
