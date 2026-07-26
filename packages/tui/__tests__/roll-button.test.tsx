import React from 'react';
import { render } from 'ink-testing-library';
import { RollButton } from '../src/components/RollButton.js';

describe('RollButton', () => {
  it('renders the Roll label', () => {
    const { lastFrame } = render(<RollButton focused={false} />);
    expect(lastFrame()).toContain('Roll');
  });

  it('applies inverse style when focused', () => {
    const { lastFrame } = render(<RollButton focused={true} />);
    expect(lastFrame()).toContain('Roll');
  });
});
