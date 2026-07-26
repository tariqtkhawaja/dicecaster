import React from 'react';
import { Box, Text } from 'ink';
import type { RollResult } from '../RollContext.js';

interface ResultDisplayProps {
  result: RollResult | null;
}

export function ResultDisplay({ result }: ResultDisplayProps) {
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
