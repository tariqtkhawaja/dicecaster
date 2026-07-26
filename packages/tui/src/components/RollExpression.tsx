import React from 'react';
import { Text } from 'ink';

interface RollExpressionProps {
  expression: string;
}

export function RollExpression({ expression }: RollExpressionProps) {
  return (
    <Text bold color="cyan">
      {expression}
    </Text>
  );
}
