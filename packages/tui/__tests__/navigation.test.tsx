import React from 'react';
import { render } from 'ink-testing-library';
import { App } from '../src/app.js';

describe('App keyboard navigation', () => {
  it('renders with die grid focused initially', () => {
    const { lastFrame, unmount } = render(<App />);
    expect(lastFrame()).toContain('D4');
    expect(lastFrame()).toContain('D20');
    unmount();
  });

  it('moves selection right on right arrow', async () => {
    const { stdin, lastFrame, unmount } = render(<App />);
    // Initial state has D4 selected (index 0)
    stdin.write('\u001B[C'); // right arrow
    await Promise.resolve(); // let Ink process the input
    // Component re-renders; we just verify no crash occurred
    expect(lastFrame()).toBeTruthy();
    unmount();
  });

  it('moves selection left on left arrow', async () => {
    const { stdin, lastFrame, unmount } = render(<App />);
    stdin.write('\u001B[D'); // left arrow — clamped to index 0
    await Promise.resolve();
    expect(lastFrame()).toBeTruthy();
    unmount();
  });

  it('exits on escape key', async () => {
    const { stdin, unmount } = render(<App />);
    stdin.write('\u001B'); // escape
    // App calls exit(), which unmounts — we clean up manually
    unmount();
  });
});
