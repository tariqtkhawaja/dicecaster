import React from 'react';
import { Box, Text } from 'ink';

interface RollButtonProps {
  focused: boolean;
}

export function RollButton({ focused }: RollButtonProps) {
  return (
    <Box justifyContent="center" marginTop={1}>
      <Text bold inverse={focused}>
        {' '}Roll{' '}
      </Text>
    </Box>
  );
}
