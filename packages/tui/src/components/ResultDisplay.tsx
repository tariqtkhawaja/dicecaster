import React from 'react';
import { Box, Text } from 'ink';
import { useRollResult } from '@dicecaster/react';
import { useTuiAnimation } from '../hooks/useTuiAnimation.js';

export function ResultDisplay() {
  const { lastResult } = useRollResult();
  const { displays } = useTuiAnimation();

  if (!lastResult) {
    return (
      <Box flexDirection="column" minHeight={3}>
        <Text color="gray">Press Enter or Space to roll</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      <Box>
        <Text color="gray">Dice: </Text>
        {displays.map((die, i) => (
          <React.Fragment key={i}>
            {i > 0 && <Text>, </Text>}
            <Text
              dimColor={die.phase === 'idle'}
              color={die.color}
              inverse={die.inverse}
              bold={die.bold || die.phase === 'flashing'}
            >
              {die.phase === 'idle' ? '?' : String(die.value)}
            </Text>
          </React.Fragment>
        ))}
      </Box>
      {lastResult.modifier !== 0 && (
        <Box>
          <Text color="gray">Modifier: </Text>
          <Text>{lastResult.modifier >= 0 ? '+' : ''}{lastResult.modifier}</Text>
        </Box>
      )}
      <Box>
        <Text bold color="green">Total: {lastResult.total}</Text>
      </Box>
    </Box>
  );
}

// Standalone rendering helper for unit tests (no context dependency)
interface ResultDisplayStandaloneProps {
  result: { expression: string; dieValues: number[]; modifier: number; total: number } | null;
}

export function ResultDisplayStandalone({ result }: ResultDisplayStandaloneProps) {
  if (!result) {
    return (
      <Box flexDirection="column" minHeight={3}>
        <Text color="gray">Press Enter or Space to roll</Text>
      </Box>
    );
  }

  const valuesText = result.dieValues.join(', ');

  return (
    <Box flexDirection="column">
      <Box>
        <Text color="gray">Dice: </Text>
        <Text>{valuesText}</Text>
      </Box>
      {result.modifier !== 0 && (
        <Box>
          <Text color="gray">Modifier: </Text>
          <Text>{result.modifier >= 0 ? '+' : ''}{result.modifier}</Text>
        </Box>
      )}
      <Box>
        <Text bold color="green">Total: {result.total}</Text>
      </Box>
    </Box>
  );
}
