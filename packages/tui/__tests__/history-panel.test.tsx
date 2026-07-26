import React from 'react';
import { render } from 'ink-testing-library';
import { HistoryPanel } from '../src/components/HistoryPanel.js';
import type { HistoryEntry } from '../src/history.js';

describe('HistoryPanel', () => {
  it('shows empty state when no entries', () => {
    const { lastFrame } = render(<HistoryPanel entries={[]} />);
    expect(lastFrame()).toContain('History');
    expect(lastFrame()).toContain('No rolls yet');
  });

  it('renders a single history entry', () => {
    const entries: HistoryEntry[] = [
      {
        id: 'test-1',
        timestamp: '2024-01-01T00:00:00.000Z',
        expression: '2d6+3',
        dice: [{ count: 2, sides: 6, results: [3, 4] }],
        modifier: 3,
        total: 10,
      },
    ];
    const { lastFrame } = render(<HistoryPanel entries={entries} />);
    const frame = lastFrame();
    expect(frame).toContain('2d6+3');
    expect(frame).toContain('= 10');
    expect(frame).toContain('[3,4]');
    expect(frame).toContain('+3');
  });

  it('renders multiple entries in order (most recent first)', () => {
    const entries: HistoryEntry[] = [
      {
        id: 'latest',
        timestamp: '2024-01-01T00:00:02.000Z',
        expression: '1d20',
        dice: [{ count: 1, sides: 20, results: [18] }],
        modifier: 0,
        total: 18,
      },
      {
        id: 'older',
        timestamp: '2024-01-01T00:00:01.000Z',
        expression: '3d8-1',
        dice: [{ count: 3, sides: 8, results: [5, 7, 2] }],
        modifier: -1,
        total: 13,
      },
    ];
    const { lastFrame } = render(<HistoryPanel entries={entries} />);
    const frame = lastFrame();
    expect(frame).toContain('1d20');
    expect(frame).toContain('= 18');
    expect(frame).toContain('3d8-1');
    expect(frame).toContain('= 13');
    expect(frame).toContain('-1');
  });

  it('omits modifier text when modifier is 0', () => {
    const entries: HistoryEntry[] = [
      {
        id: 'test-no-mod',
        timestamp: '2024-01-01T00:00:00.000Z',
        expression: '1d6+0',
        dice: [{ count: 1, sides: 6, results: [4] }],
        modifier: 0,
        total: 4,
      },
    ];
    const { lastFrame } = render(<HistoryPanel entries={entries} />);
    const frame = lastFrame();
    expect(frame).toContain('= 4');
    // The detail line shows "1d6=[4]" with no trailing modifier — only the expression header has "+0"
    expect(frame).toContain('1d6=[4]');
  });
});
