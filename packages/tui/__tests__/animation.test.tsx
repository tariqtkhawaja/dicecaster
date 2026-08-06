import React from 'react';
import { render } from 'ink-testing-library';
import { ResultDisplayStandalone as ResultDisplay } from '../src/components/ResultDisplay.js';

describe('ResultDisplay animation', () => {
  it('shows placeholder when no result', () => {
    const { lastFrame } = render(<ResultDisplay result={null} />);
    expect(lastFrame()).toContain('Press Enter or Space to roll');
  });

  it('renders dice values when result exists', () => {
    const result = {
      expression: '2d6+3',
      dieValues: [4, 5],
      modifier: 3,
      total: 12,
    };
    const { lastFrame } = render(<ResultDisplay result={result} />);
    const frame = lastFrame();
    expect(frame).toContain('Total: 12');
    expect(frame).toContain('+3');
  });

  it('renders with negative modifier', () => {
    const result = {
      expression: '3d8-2',
      dieValues: [3, 5, 6],
      modifier: -2,
      total: 12,
    };
    const { lastFrame } = render(<ResultDisplay result={result} />);
    const frame = lastFrame();
    expect(frame).toContain('-2');
    expect(frame).toContain('Total: 12');
  });

  it('omits modifier line when modifier is 0', () => {
    const result = {
      expression: '1d20+0',
      dieValues: [17],
      modifier: 0,
      total: 17,
    };
    const { lastFrame } = render(<ResultDisplay result={result} />);
    expect(lastFrame()).not.toContain('Modifier:');
  });

  it('parses sides from various die types in expression', () => {
    const resultD4 = {
      expression: '2d4+0',
      dieValues: [3, 2],
      modifier: 0,
      total: 5,
    };
    const { lastFrame: frame4 } = render(<ResultDisplay result={resultD4} />);
    expect(frame4()).toContain('Total: 5');

    const resultD100 = {
      expression: '1d100+0',
      dieValues: [67],
      modifier: 0,
      total: 67,
    };
    const { lastFrame: frame100 } = render(<ResultDisplay result={resultD100} />);
    expect(frame100()).toContain('Total: 67');
  });
});
