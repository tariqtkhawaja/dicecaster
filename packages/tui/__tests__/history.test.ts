import * as fs from 'node:fs';
import * as path from 'node:path';
import { loadHistory, saveHistory, appendEntry, type HistoryFile } from '../src/history.js';

const HISTORY_DIR = path.join(process.env.HOME ?? '.', '.dicecaster');
const HISTORY_FILE = path.join(HISTORY_DIR, 'history.json');

beforeEach(() => {
  if (fs.existsSync(HISTORY_FILE)) {
    fs.unlinkSync(HISTORY_FILE);
  }
  const tmp = HISTORY_FILE + '.tmp';
  if (fs.existsSync(tmp)) {
    fs.unlinkSync(tmp);
  }
});

afterEach(() => {
  if (fs.existsSync(HISTORY_FILE)) {
    fs.unlinkSync(HISTORY_FILE);
  }
  const tmp = HISTORY_FILE + '.tmp';
  if (fs.existsSync(tmp)) {
    fs.unlinkSync(tmp);
  }
});

describe('loadHistory', () => {
  it('returns empty history when file does not exist', () => {
    const history = loadHistory();
    expect(history.version).toBe(1);
    expect(history.entries).toEqual([]);
  });

  it('loads valid history file', () => {
    fs.mkdirSync(HISTORY_DIR, { recursive: true });
    const data: HistoryFile = {
      version: 1,
      entries: [
        {
          id: 'test-1',
          timestamp: '2024-01-01T00:00:00.000Z',
          expression: '2d6+3',
          dice: [{ count: 2, sides: 6, results: [3, 4] }],
          modifier: 3,
          total: 10,
        },
      ],
    };
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(data));
    const history = loadHistory();
    expect(history.version).toBe(1);
    expect(history.entries).toHaveLength(1);
    expect(history.entries[0].expression).toBe('2d6+3');
  });

  it('returns empty history for corrupt JSON', () => {
    fs.mkdirSync(HISTORY_DIR, { recursive: true });
    fs.writeFileSync(HISTORY_FILE, '{not valid json');
    const history = loadHistory();
    expect(history.version).toBe(1);
    expect(history.entries).toEqual([]);
  });

  it('returns empty history for malformed structure', () => {
    fs.mkdirSync(HISTORY_DIR, { recursive: true });
    fs.writeFileSync(HISTORY_FILE, JSON.stringify({ version: 'bad', entries: 'also bad' }));
    const history = loadHistory();
    expect(history.version).toBe(1);
    expect(history.entries).toEqual([]);
  });
});

describe('saveHistory', () => {
  it('writes history atomically via temp+rename', () => {
    const data: HistoryFile = {
      version: 1,
      entries: [
        {
          id: 'test-1',
          timestamp: '2024-01-01T00:00:00.000Z',
          expression: '1d20',
          dice: [{ count: 1, sides: 20, results: [15] }],
          modifier: 0,
          total: 15,
        },
      ],
    };
    saveHistory(data);
    expect(fs.existsSync(HISTORY_FILE)).toBe(true);
    const loaded = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf-8'));
    expect(loaded.version).toBe(1);
    expect(loaded.entries).toHaveLength(1);
  });

  it('creates directory if it does not exist', () => {
    const data: HistoryFile = { version: 1, entries: [] };
    saveHistory(data);
    expect(fs.existsSync(HISTORY_DIR)).toBe(true);
    expect(fs.existsSync(HISTORY_FILE)).toBe(true);
  });
});

describe('appendEntry', () => {
  it('appends a new entry and persists it', () => {
    const history = appendEntry({
      expression: '3d6',
      dice: [{ count: 3, sides: 6, results: [1, 2, 3] }],
      modifier: 0,
      total: 6,
    });
    expect(history.entries).toHaveLength(1);
    expect(history.entries[0].expression).toBe('3d6');
    expect(history.entries[0].id).toBeDefined();
    expect(history.entries[0].timestamp).toBeDefined();
  });

  it('adds new entry at the front (most recent first)', () => {
    appendEntry({
      expression: '1d20',
      dice: [{ count: 1, sides: 20, results: [10] }],
      modifier: 0,
      total: 10,
    });
    const history2 = appendEntry({
      expression: '2d6',
      dice: [{ count: 2, sides: 6, results: [3, 4] }],
      modifier: 0,
      total: 7,
    });
    expect(history2.entries[0].expression).toBe('2d6');
    expect(history2.entries[1].expression).toBe('1d20');
  });

  it('evicts oldest entries beyond 100 cap', () => {
    for (let i = 0; i < 101; i++) {
      appendEntry({
        expression: `${i}d6`,
        dice: [{ count: i, sides: 6, results: [1] }],
        modifier: 0,
        total: i,
      });
    }
    const history = loadHistory();
    expect(history.entries).toHaveLength(100);
    expect(history.entries[0].expression).toBe('100d6');
    expect(history.entries[99].expression).toBe('1d6');
  });
});
