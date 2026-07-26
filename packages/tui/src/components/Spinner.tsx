import React from 'react';
import { Box, Text } from 'ink';

interface SpinnerProps {
  label: string;
  value: number;
  focused: boolean;
}

export function Spinner({ label, value, focused }: SpinnerProps) {
  const sign = value >= 0 ? '+' : '';
  return (
    <Box paddingX={1} backgroundColor={focused ? 'green' : 'transparent'}>
      <Text color="gray">{label} </Text>
      <Text bold color={focused ? 'white' : 'default'}>
        {sign}{value}
      </Text>
    </Box>
  );
}
