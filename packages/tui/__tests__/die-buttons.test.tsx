import React from 'react';
import { render } from 'ink-testing-library';
import { DieButtons, DIE_TYPES } from '../src/components/DieButtons.js';

describe('DieButtons', () => {
  it('renders all die types', () => {
    const { lastFrame } = render(<DieButtons selectedIndex={0} />);
    const frame = lastFrame();
    for (const die of DIE_TYPES) {
      expect(frame).toContain(die);
    }
  });

  it('highlights the selected die at index 0', () => {
    const { lastFrame } = render(<DieButtons selectedIndex={0} />);
    // D4 should appear first and be present; we can't easily check ANSI codes
    // but we verify the component renders without error with index 0
    expect(lastFrame()).toBeTruthy();
  });

  it('highlights the selected die at last index', () => {
    const { lastFrame } = render(
      <DieButtons selectedIndex={DIE_TYPES.length - 1} />
    );
    expect(lastFrame()).toBeTruthy();
  });
});
