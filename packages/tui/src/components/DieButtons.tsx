import React from 'react';
import { Box, Text } from 'ink';

export const DIE_TYPES = ['D4', 'D6', 'D8', 'D10', 'D12', 'D20', 'D100'] as const;

export type DieType = (typeof DIE_TYPES)[number];

interface DieButtonsProps {
  selectedIndex: number;
}

export function DieButtons({ selectedIndex }: DieButtonsProps) {
  return (
    <Box flexDirection="row" gap={1} flexWrap="wrap" width={30}>
      {DIE_TYPES.map((die, index) => {
        const isSelected = index === selectedIndex;
        return (
          <Box
            key={die}
            paddingX={1}
            backgroundColor={isSelected ? 'blue' : 'transparent'}
          >
            <Text bold color={isSelected ? 'white' : 'gray'}>
              {die}
            </Text>
          </Box>
        );
      })}
    </Box>
  );
}
