import * as fs from 'node:fs';
import * as path from 'node:path';
import type { HistoryAdapter, HistoryEntry } from '@dicecaster/react';

const HISTORY_DIR = path.join(process.env.HOME ?? '.', '.dicecaster');
const HISTORY_FILE = path.join(HISTORY_DIR, 'history.json');

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
  save: (entries) => safeWrite(entries),
};
