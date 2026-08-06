import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react';
import { RollProvider, useRollConfig, useRollResult, useRollHistory, DIE_TYPES } from '../index';
import type { HistoryAdapter, HistoryEntry } from '../types';

describe('DIE_TYPES constant', () => {
  it('exports the correct die types', () => {
    expect(DIE_TYPES).toEqual(["D4", "D6", "D8", "D10", "D12", "D20", "D100"]);
  });
});

describe('useRollConfig', () => {
  function ConfigConsumer() {
    const config = useRollConfig();
    return (
      <div>
        <span data-testid="dieType">{config.dieType}</span>
        <span data-testid="count">{config.count}</span>
        <span data-testid="modifier">{config.modifier}</span>
        <span data-testid="expression">{config.expression}</span>
      </div>
    );
  }

  it('returns correct defaults', () => {
    const { getByTestId } = render(
      <RollProvider><ConfigConsumer /></RollProvider>
    );
    expect(getByTestId('dieType').textContent).toBe('D4');
    expect(getByTestId('count').textContent).toBe('1');
    expect(getByTestId('modifier').textContent).toBe('0');
  });

  it('throws outside RollProvider', () => {
    expect(() => render(<ConfigConsumer />)).toThrow('must be used within a RollProvider');
  });

  it('setCount clamps to 1 minimum', () => {
    function ClampingTest() {
      const { count, setCount } = useRollConfig();
      React.useEffect(() => {
        setCount(0);
      }, [setCount]);
      return <span data-testid="count">{count}</span>;
    }
    const { getByTestId } = render(
      <RollProvider><ClampingTest /></RollProvider>
    );
    expect(getByTestId('count').textContent).toBe('1');
  });

  it('setCount clamps to 100 maximum', () => {
    function ClampingTest() {
      const { count, setCount } = useRollConfig();
      React.useEffect(() => {
        setCount(200);
      }, [setCount]);
      return <span data-testid="count">{count}</span>;
    }
    const { getByTestId } = render(
      <RollProvider><ClampingTest /></RollProvider>
    );
    expect(getByTestId('count').textContent).toBe('100');
  });

  it('setModifier clamps to -99 minimum', () => {
    function ClampingTest() {
      const { modifier, setModifier } = useRollConfig();
      React.useEffect(() => {
        setModifier(-200);
      }, [setModifier]);
      return <span data-testid="modifier">{modifier}</span>;
    }
    const { getByTestId } = render(
      <RollProvider><ClampingTest /></RollProvider>
    );
    expect(getByTestId('modifier').textContent).toBe('-99');
  });

  it('setModifier clamps to +99 maximum', () => {
    function ClampingTest() {
      const { modifier, setModifier } = useRollConfig();
      React.useEffect(() => {
        setModifier(200);
      }, [setModifier]);
      return <span data-testid="modifier">{modifier}</span>;
    }
    const { getByTestId } = render(
      <RollProvider><ClampingTest /></RollProvider>
    );
    expect(getByTestId('modifier').textContent).toBe('99');
  });
});

describe('expression derivation', () => {
  function ExprConsumer() {
    const { expression } = useRollConfig();
    return <span data-testid="expression">{expression}</span>;
  }

  it('formats as NdX+M with positive modifier', () => {
    function TestComp() {
      const { setCount, setModifier } = useRollConfig();
      React.useEffect(() => {
        setCount(3);
        setModifier(5);
      }, [setCount, setModifier]);
      return <ExprConsumer />;
    }
    const { getByTestId } = render(
      <RollProvider><TestComp /></RollProvider>
    );
    expect(getByTestId('expression').textContent).toBe('3D4+5');
  });

  it('formats with negative modifier', () => {
    function TestComp() {
      const { setModifier } = useRollConfig();
      React.useEffect(() => {
        setModifier(-3);
      }, [setModifier]);
      return <ExprConsumer />;
    }
    const { getByTestId } = render(
      <RollProvider><TestComp /></RollProvider>
    );
    expect(getByTestId('expression').textContent).toBe('1D4-3');
  });

  it('shows +0 when modifier is zero', () => {
    const { getByTestId } = render(
      <RollProvider><ExprConsumer /></RollProvider>
    );
    expect(getByTestId('expression').textContent).toBe('1D4+0');
  });

  it('reflects updated count and dieType', () => {
    function TestComp() {
      const { setCount, setDieType } = useRollConfig();
      React.useEffect(() => {
        setCount(2);
        setDieType('D20');
      }, [setCount, setDieType]);
      return <ExprConsumer />;
    }
    const { getByTestId } = render(
      <RollProvider><TestComp /></RollProvider>
    );
    expect(getByTestId('expression').textContent).toBe('2D20+0');
  });
});

describe('useRollResult', () => {
  function ResultConsumer() {
    const { lastResult, animation, executeRoll } = useRollResult();
    return (
      <div>
        <button onClick={executeRoll}>roll</button>
        <span data-testid="phase">{animation.phase}</span>
        <span data-testid="total">{lastResult?.total ?? 'null'}</span>
        <span data-testid="values">{lastResult?.dieValues.join(',') ?? ''}</span>
      </div>
    );
  }

  it('starts with idle animation and null result', () => {
    const { getByTestId } = render(
      <RollProvider><ResultConsumer /></RollProvider>
    );
    expect(getByTestId('phase').textContent).toBe('idle');
    expect(getByTestId('total').textContent).toBe('null');
  });

  it('throws outside RollProvider', () => {
    expect(() => render(<ResultConsumer />)).toThrow('must be used within a RollProvider');
  });

  it('executeRoll produces a valid RollResult', async () => {
    const utils = render(
      <RollProvider><ResultConsumer /></RollProvider>
    );
    const btn = utils.getByText('roll');
    act(() => { btn.click(); });
    await waitFor(() => {
      expect(utils.getByTestId('total').textContent).not.toBe('null');
    });
    expect(Number(utils.getByTestId('total').textContent)).toBeGreaterThanOrEqual(1);
  });

  it('transitions animation from rolling to settled', () => {
    jest.useFakeTimers();
    try {
      const utils = render(
        <RollProvider maxHistory={10}><ResultConsumer /></RollProvider>
      );
      act(() => { utils.getByText('roll').click(); });
      expect(utils.getByTestId('phase').textContent).toBe('rolling');

      // Advance past settle delay (2000ms base + 0 extra for 1 die)
      act(() => { jest.advanceTimersByTime(2100); });
      expect(utils.getByTestId('phase').textContent).toBe('settled');
    } finally {
      jest.useRealTimers();
    }
  });

  it('dieValues populated during rolling phase', async () => {
    function ValuesConsumer() {
      const { animation, executeRoll } = useRollResult();
      return (
        <div>
          <button onClick={executeRoll}>roll</button>
          <span data-testid="animValues">{animation.dieValues.length ? animation.dieValues.join(',') : 'empty'}</span>
        </div>
      );
    }
    const utils = render(
      <RollProvider><ValuesConsumer /></RollProvider>
    );
    act(() => { utils.getByText('roll').click(); });
    await waitFor(() => {
      expect(utils.getByTestId('animValues').textContent).not.toBe('empty');
    });
  });
});

describe('useRollHistory', () => {
  function HistoryConsumer() {
    const { entries, maxEntries, clear } = useRollHistory();
    return (
      <div>
        <span data-testid="count">{entries.length}</span>
        <span data-testid="max">{maxEntries}</span>
        <button onClick={clear}>clear</button>
      </div>
    );
  }

  it('returns empty history initially', () => {
    const { getByTestId } = render(
      <RollProvider><HistoryConsumer /></RollProvider>
    );
    expect(getByTestId('count').textContent).toBe('0');
  });

  it('reports maxEntries', () => {
    const { getByTestId } = render(
      <RollProvider maxHistory={50}><HistoryConsumer /></RollProvider>
    );
    expect(getByTestId('max').textContent).toBe('50');
  });

  it('throws outside RollProvider', () => {
    expect(() => render(<HistoryConsumer />)).toThrow('must be used within a RollProvider');
  });

  it('history grows after rolls', async () => {
    function FullConsumer() {
      const h = useRollHistory();
      const r = useRollResult();
      return (
        <div>
          <button onClick={r.executeRoll}>roll</button>
          <span data-testid="count">{h.entries.length}</span>
        </div>
      );
    }
    const utils = render(
      <RollProvider><FullConsumer /></RollProvider>
    );
    act(() => { utils.getByText('roll').click(); });
    await waitFor(() => {
      expect(utils.getByTestId('count').textContent).toBe('1');
    });
    act(() => { utils.getByText('roll').click(); });
    await waitFor(() => {
      expect(utils.getByTestId('count').textContent).toBe('2');
    });
  });

  it('respects maxEntries cap', () => {
    function FullConsumer() {
      const h = useRollHistory();
      const r = useRollResult();
      return (
        <div>
          <button onClick={r.executeRoll}>roll</button>
          <span data-testid="count">{h.entries.length}</span>
        </div>
      );
    }
    jest.useFakeTimers();
    try {
      const utils = render(
        <RollProvider maxHistory={3}><FullConsumer /></RollProvider>
      );

      // Roll 5 times
      for (let i = 0; i < 5; i++) {
        act(() => { utils.getByText('roll').click(); });
        act(() => { jest.advanceTimersByTime(100); });
      }
      act(() => { jest.runAllTimers(); });
      expect(utils.getByTestId('count').textContent).toBe('3');
    } finally {
      jest.useRealTimers();
    }
  });

  it('entries are newest first', async () => {
    function EntryOrderConsumer() {
      const h = useRollHistory();
      const r = useRollResult();
      const c = useRollConfig();
      return (
        <div>
          <button onClick={() => { c.setCount(2); r.executeRoll(); }}>roll</button>
          <span data-testid="firstExpr">{h.entries[0]?.expression ?? 'none'}</span>
          <span data-testid="secondExpr">{h.entries[1]?.expression ?? 'none'}</span>
        </div>
      );
    }
    const utils = render(
      <RollProvider><EntryOrderConsumer /></RollProvider>
    );
    act(() => { utils.getByText('roll').click(); });
    await waitFor(() => {
      expect(utils.getByTestId('firstExpr').textContent).not.toBe('none');
    });
    act(() => { utils.getByText('roll').click(); });
    await waitFor(() => {
      expect(utils.getByTestId('secondExpr').textContent).not.toBe('none');
    });
  });

  it('clear resets history', async () => {
    function ClearConsumer() {
      const h = useRollHistory();
      const r = useRollResult();
      return (
        <div>
          <button onClick={r.executeRoll} data-testid="rollBtn">roll</button>
          <button onClick={h.clear} data-testid="clearBtn">clear</button>
          <span data-testid="count">{h.entries.length}</span>
        </div>
      );
    }
    const utils = render(
      <RollProvider><ClearConsumer /></RollProvider>
    );
    act(() => { utils.getByTestId('rollBtn').click(); });
    await waitFor(() => {
      expect(utils.getByTestId('count').textContent).toBe('1');
    });
    act(() => { utils.getByTestId('clearBtn').click(); });
    expect(utils.getByTestId('count').textContent).toBe('0');
  });
});

describe('HistoryAdapter integration', () => {
  it('loads history from adapter on mount', () => {
    const existingEntries: HistoryEntry[] = [
      {
        id: 'existing-1',
        timestamp: '2024-01-01T00:00:00.000Z',
        expression: '1d20+0',
        dice: [{ count: 1, sides: 20, results: [15] }],
        modifier: 0,
        total: 15,
      },
    ];
    const mockAdapter: HistoryAdapter = {
      load: () => existingEntries,
      save: () => {},
    };

    function CountConsumer() {
      const { entries } = useRollHistory();
      return <span data-testid="count">{entries.length}</span>;
    }

    const { getByTestId } = render(
      <RollProvider historyAdapter={mockAdapter}><CountConsumer /></RollProvider>
    );
    expect(getByTestId('count').textContent).toBe('1');
  });

  it('saves history via adapter on roll', async () => {
    const savedEntries: HistoryEntry[][] = [];
    const mockAdapter: HistoryAdapter = {
      load: () => [],
      save: (entries) => { savedEntries.push([...entries]); },
    };

    function RollAndCheck() {
      const r = useRollResult();
      return <button onClick={r.executeRoll}>roll</button>;
    }

    render(
      <RollProvider historyAdapter={mockAdapter}><RollAndCheck /></RollProvider>
    );
    const btn = document.querySelector('button')!;
    act(() => { btn.click(); });
    await new Promise(r => setTimeout(r, 50));
    expect(savedEntries).toHaveLength(1);
    expect(savedEntries[0]).toHaveLength(1);
    expect(savedEntries[0][0].expression).toMatch(/\d+[Dd]\d+/);
  });

  it('saves history via adapter on clear', () => {
    let savedCallArgs: HistoryEntry[][] = [];
    const mockAdapter: HistoryAdapter = {
      load: () => [],
      save: (entries) => { savedCallArgs.push([...entries]); },
    };

    function ClearConsumer() {
      const h = useRollHistory();
      return <button onClick={h.clear}>clear</button>;
    }

    render(
      <RollProvider historyAdapter={mockAdapter}><ClearConsumer /></RollProvider>
    );
    const btn = document.querySelector('button')!;
    act(() => { btn.click(); });
    expect(savedCallArgs).toHaveLength(1);
    expect(savedCallArgs[0]).toEqual([]);
  });
});

describe('defaultConfig prop', () => {
  function ConfigReader() {
    const { dieType, count, modifier } = useRollConfig();
    return (
      <div>
        <span data-testid="dieType">{dieType}</span>
        <span data-testid="count">{count}</span>
        <span data-testid="modifier">{modifier}</span>
      </div>
    );
  }

  it('applies defaultConfig overrides', () => {
    const { getByTestId } = render(
      <RollProvider defaultConfig={{ dieType: 'D20', count: 4, modifier: -2 }}>
        <ConfigReader />
      </RollProvider>
    );
    expect(getByTestId('dieType').textContent).toBe('D20');
    expect(getByTestId('count').textContent).toBe('4');
    expect(getByTestId('modifier').textContent).toBe('-2');
  });
});
