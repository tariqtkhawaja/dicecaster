import React from 'react';
import { render } from 'ink-testing-library';
import { App } from '../src/app.js';

describe('App', () => {
  it('renders Dicecaster title', () => {
    const { lastFrame } = render(<App />);
    expect(lastFrame()).toContain('Dicecaster');
  });
});
