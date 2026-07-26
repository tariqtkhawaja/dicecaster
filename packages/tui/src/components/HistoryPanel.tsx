import React from 'react';
import { Box, Text } from 'ink';
import { ScrollView } from 'ink-scroll-view';
import type { HistoryEntry } from '../history.js';

interface HistoryPanelProps {
  entries: HistoryEntry[];
}

export function HistoryPanel({ entries }: HistoryPanelProps) {
  if (entries.length === 0) {
    return (
      <Box flexDirection="column" width="100%" paddingX={1}>
        <Text bold color="gray">History</Text>
        <Box marginTop={1}>
          <Text color="gray">No rolls yet</Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" width="100%">
      <Box paddingX={1}>
        <Text bold color="gray">History</Text>
      </Box>
      <ScrollView height={Math.max(5, entries.length + 1)}>
        {entries.map((entry) => (
          <HistoryEntryItem key={entry.id} entry={entry} />
        ))}
      </ScrollView>
    </Box>
  );
}

interface HistoryEntryItemProps {
  entry: HistoryEntry;
}

function HistoryEntryItem({ entry }: HistoryEntryItemProps) {
  const diceSummary = entry.dice
    .map((group) => `${group.count}d${group.sides}=[${group.results.join(',')}]`)
    .join(' ');

  const modText = entry.modifier !== 0 ? ` ${entry.modifier >= 0 ? '+' : ''}${entry.modifier}` : '';

  return (
    <Box flexDirection="column" paddingLeft={1}>
      <Box>
        <Text dimColor>{entry.expression}</Text>
        <Text bold color="green"> = {entry.total}</Text>
      </Box>
      <Box paddingLeft={2}>
        <Text color="gray">{diceSummary}{modText}</Text>
      </Box>
    </Box>
  );
}
