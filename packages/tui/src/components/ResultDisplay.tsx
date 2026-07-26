import React, { useEffect } from 'react';
import { Box, Text } from 'ink';
import type { RollResult } from '../RollContext.js';
import { useDiceCascade } from '../hooks/useDiceCascade.js';

interface ResultDisplayProps {
  result: RollResult | null;
}

export function ResultDisplay({ result }: ResultDisplayProps) {
  const { displays, isAnimating, startCascade } = useDiceCascade();

  useEffect(() => {
    if (result && !isAnimating) {
      const sides = getSidesFromExpression(result.expression);
      startCascade(result.dieValues, sides);
    }
  }, [result, isAnimating, startCascade]);

  if (!result) {
    return (
      <Box flexDirection="column" minHeight={3}>
        <Text color="gray">Press Enter or Space to roll</Text>
      </Box>
    );
  }

  const valuesText = displays.map((d) => {
    if (d.phase === 'idle') return '?';
    return String(d.value);
  }).join(', ');

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

function getSidesFromExpression(expression: string): number {
  const match = expression.match(/d(\d+)/);
  return match && match[1] ? parseInt(match[1], 10) : 6;
}
