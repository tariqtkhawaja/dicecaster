import * as fs from 'node:fs';
import * as path from 'node:path';
import { randomUUID } from 'node:crypto';
import type { HistoryAdapter, HistoryEntry } from '@dicecaster/react';

const HISTORY_DIR = path.join(process.env.HOME ?? '.', '.dicecaster');
const HISTORY_FILE = path.join(HISTORY_DIR, 'history.json');
const MAX_ENTRIES = 100;

function safeRead(): HistoryEntry[] {
  try {
    if (!fs.existsSync(HISTORY_FILE)) return [];
    const raw = fs.readFileSync(HISTORY_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.version !== 'number' || !Array.isArray(parsed.entries)) {
      return [];
    }
    return parsed.entries;
  } catch {
    return [];
  }
}

function safeWrite(entries: HistoryEntry[]): void {
  const tmpFile = HISTORY_FILE + '.tmp';
  try {
    fs.mkdirSync(HISTORY_DIR, { recursive: true });
  } catch {
    return;
  }
  const data = { version: 1, entries };
  const serialized = JSON.stringify(data, null, 2);
  try {
    fs.writeFileSync(tmpFile, serialized, 'utf-8');
    fs.renameSync(tmpFile, HISTORY_FILE);
  } catch {
    // Silent failure on concurrent access
  }
}

export const fsHistoryAdapter: HistoryAdapter = {
  load: () => safeRead(),
  save: (entries) => safeWrite(entries.slice(0, MAX_ENTRIES)),
};

// Legacy exports for existing tests
export interface HistoryFile {
  version: 1;
  entries: HistoryEntry[];
}

export function loadHistory(): HistoryFile {
  return { version: 1, entries: safeRead() };
}

export function saveHistory(history: HistoryFile): void {
  safeWrite(history.entries);
}

export function appendEntry(
  entry: Omit<HistoryEntry, 'id' | 'timestamp'> & { partial?: boolean }
): HistoryFile {
  const history = loadHistory();
  const newEntry: HistoryEntry = {
    id: randomUUID(),
    timestamp: new Date().toISOString(),
    ...entry,
  };
  history.entries.unshift(newEntry);
  while (history.entries.length > MAX_ENTRIES) {
    history.entries.pop();
  }
  saveHistory(history);
  return history;
}
