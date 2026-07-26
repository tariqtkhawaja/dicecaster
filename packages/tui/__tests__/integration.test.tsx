import React from 'react';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { render } from 'ink-testing-library';
import { App } from '../src/app.js';

const HISTORY_FILE = path.join(process.env.HOME ?? '.', '.dicecaster', 'history.json');

beforeEach(() => {
  if (fs.existsSync(HISTORY_FILE)) {
    fs.unlinkSync(HISTORY_FILE);
  }
});

afterEach(() => {
  if (fs.existsSync(HISTORY_FILE)) {
    fs.unlinkSync(HISTORY_FILE);
  }
});

describe('Full app integration', () => {
  it('renders both left and right panels in split layout', () => {
    const { lastFrame, unmount } = render(<App />);
    const frame = lastFrame();
    // Left panel elements
    expect(frame).toContain('Dicecaster');
    expect(frame).toContain('D4');
    expect(frame).toContain('Count:');
    expect(frame).toContain('Mod:');
    expect(frame).toContain('Roll');
    // Right panel elements
    expect(frame).toContain('History');
    expect(frame).toContain('No rolls yet');
    unmount();
  });

  it('triggers a roll via Enter key and displays result', async () => {
    const { stdin, lastFrame, unmount } = render(<App />);
    stdin.write('\r'); // Enter to roll
    await new Promise((r) => setTimeout(r, 200));
    const frame = lastFrame();
    expect(frame).toContain('Total:');
    unmount();
  });

  it('triggers a roll via Space key and displays result', async () => {
    const { stdin, lastFrame, unmount } = render(<App />);
    stdin.write(' '); // Space to roll
    await new Promise((r) => setTimeout(r, 200));
    const frame = lastFrame();
    expect(frame).toContain('Total:');
    unmount();
  });

  it('persists roll to history file after execution', async () => {
    const { stdin, lastFrame, unmount } = render(<App />);
    stdin.write('\r'); // Roll
    await new Promise((r) => setTimeout(r, 300));
    unmount();

    expect(fs.existsSync(HISTORY_FILE)).toBe(true);
    const data = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf-8'));
    expect(data.version).toBe(1);
    expect(data.entries).toHaveLength(1);
    expect(data.entries[0].expression).toMatch(/\d+[Dd]\d+/);
  });

  it('shows history entries in the right panel after a roll', async () => {
    const { stdin, lastFrame, unmount } = render(<App />);
    stdin.write('\r'); // Roll
    await new Promise((r) => setTimeout(r, 300));
    const frame = lastFrame();
    expect(frame).not.toContain('No rolls yet');
    expect(frame).toContain('History');
    unmount();
  });

  it('navigates between spinners with arrow keys without crashing', async () => {
    const { stdin, lastFrame, unmount } = render(<App />);
    stdin.write('\u001B[B'); // Down arrow → count spinner
    await Promise.resolve();
    stdin.write('\u001B[D'); // Left arrow → back to die grid
    await Promise.resolve();
    expect(lastFrame()).toBeTruthy();
    unmount();
  });

  it('increases count with up arrow then rolls', async () => {
    const { stdin, lastFrame, unmount } = render(<App />);
    stdin.write('\u001B[B'); // Down → count spinner
    await Promise.resolve();
    stdin.write('\u001B[A'); // Up → increase count
    await Promise.resolve();
    stdin.write('\r'); // Roll
    await new Promise((r) => setTimeout(r, 300));
    const frame = lastFrame();
    expect(frame).toContain('Total:');
    unmount();
  });

  it('handles multiple sequential rolls accumulating in history', async () => {
    const { stdin, lastFrame, unmount } = render(<App />);

    stdin.write('\r');
    await new Promise((r) => setTimeout(r, 200));

    stdin.write('\r');
    await new Promise((r) => setTimeout(r, 200));

    stdin.write('\r');
    await new Promise((r) => setTimeout(r, 200));

    unmount();

    const data = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf-8'));
    expect(data.entries).toHaveLength(3);
  });
});
