import { jest } from '@jest/globals';
import { fireEvent, screen } from '@testing-library/react';
import { DiceRoller } from '../components/DiceRoller.js';
import { renderWithProvider } from './test-utils.js';

describe('DiceRoller', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders all die type buttons', () => {
    renderWithProvider(<DiceRoller />);
    for (const die of ['D4', 'D6', 'D8', 'D10', 'D12', 'D20', 'D100']) {
      expect(screen.getByText(die)).toBeInTheDocument();
    }
  });

  it('renders count +/- controls', () => {
    renderWithProvider(<DiceRoller />);
    expect(screen.getByText('Count:')).toBeInTheDocument();
  });

  it('renders modifier +/- controls', () => {
    renderWithProvider(<DiceRoller />);
    expect(screen.getByText('Mod:')).toBeInTheDocument();
  });

  it('renders expression display', () => {
    renderWithProvider(<DiceRoller />);
    expect(screen.getByText(/1D4/)).toBeInTheDocument();
  });

  it('renders Roll button', () => {
    renderWithProvider(<DiceRoller />);
    const rollBtn = screen.getByRole('button', { name: /roll/i });
    expect(rollBtn).toBeInTheDocument();
  });

  it('updates die type on button click', () => {
    renderWithProvider(<DiceRoller />);
    fireEvent.click(screen.getByText('D20'));
    expect(screen.getByText('1D20+0')).toBeInTheDocument();
  });

  it('increments count on + button click', () => {
    renderWithProvider(<DiceRoller />);
    const countButtons = screen.getAllByText('+');
    const countPlus = countButtons[0];
    fireEvent.click(countPlus);
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('executes roll and settles after animation', () => {
    renderWithProvider(<DiceRoller />);
    const rollBtn = screen.getByRole('button', { name: /roll/i });
    fireEvent.click(rollBtn);
    expect(rollBtn).toBeDisabled();
    jest.runAllTimers();
    expect(screen.queryByText('Rolling...')).not.toBeInTheDocument();
  });

  it('disables Roll button during rolling animation', () => {
    renderWithProvider(<DiceRoller />);
    const rollBtn = screen.getByRole('button', { name: /roll/i });
    fireEvent.click(rollBtn);
    expect(rollBtn).toBeDisabled();
  });
});
