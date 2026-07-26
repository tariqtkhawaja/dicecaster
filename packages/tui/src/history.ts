import * as fs from 'node:fs';
import * as path from 'node:path';
import { randomUUID } from 'node:crypto';

const HISTORY_DIR = path.join(process.env.HOME ?? '.', '.dicecaster');
const HISTORY_FILE = path.join(HISTORY_DIR, 'history.json');
const MAX_ENTRIES = 100;

export interface HistoryEntry {
  id: string;
  timestamp: string;
  expression: string;
  dice: { count: number; sides: number; results: number[] }[];
  modifier: number;
  total: number;
}

export interface HistoryFile {
  version: 1;
  entries: HistoryEntry[];
}

function getSidesFromDieType(dieType: string): number {
  const num = parseInt(dieType.replace('D', ''), 10);
  return isNaN(num) ? 6 : num;
}

function emptyHistory(): HistoryFile {
  return { version: 1, entries: [] };
}

export function loadHistory(): HistoryFile {
  try {
    if (!fs.existsSync(HISTORY_FILE)) {
      return emptyHistory();
    }
    const raw = fs.readFileSync(HISTORY_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.version !== 'number' || !Array.isArray(parsed.entries)) {
      return emptyHistory();
    }
    return parsed as HistoryFile;
  } catch {
    return emptyHistory();
  }
}

export function saveHistory(history: HistoryFile): void {
  const tmpFile = HISTORY_FILE + '.tmp';
  try {
    fs.mkdirSync(HISTORY_DIR, { recursive: true });
  } catch {
    // Directory may have been removed concurrently; skip silently
    return;
  }
  const serialized = JSON.stringify(history, null, 2);
  try {
    fs.writeFileSync(tmpFile, serialized, 'utf-8');
    fs.renameSync(tmpFile, HISTORY_FILE);
  } catch {
    // Concurrent cleanup may have removed the target; accept the loss
  }
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

export function rollResultToEntry(
  expression: string,
  dieType: string,
  count: number,
  dieValues: number[],
  modifier: number,
  total: number
): HistoryEntry {
  return {
    id: randomUUID(),
    timestamp: new Date().toISOString(),
    expression,
    dice: [{ count, sides: getSidesFromDieType(dieType), results: dieValues }],
    modifier,
    total,
  };
}
