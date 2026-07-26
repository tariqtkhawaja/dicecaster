import React from 'react';
import { Box, Text, useInput } from 'ink';
import { useApp } from 'ink';

export function App() {
  const { exit } = useApp();

  useInput((_conn, key) => {
    if (key.escape) {
      exit();
    }
  });

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold>Dicecaster</Text>
    </Box>
  );
}
