import React from 'react';
import { render } from 'ink-testing-library';
import { RollProvider, useRoll } from '../src/RollContext.js';
import { Spinner } from '../src/components/Spinner.js';
import { RollExpression } from '../src/components/RollExpression.js';

describe('RollContext', () => {
  it('provides default roll state', () => {
    function Consumer() {
      const { dieType, count, modifier, expression } = useRoll();
      return (
        <div>
          <span>{dieType}</span>
          <span>{count}</span>
          <span>{modifier}</span>
          <span>{expression}</span>
        </div>
      );
    }

    const { lastFrame } = render(
      <RollProvider>
        <Consumer />
      </RollProvider>
    );
    expect(lastFrame()).toContain('D4');
    expect(lastFrame()).toContain('1');
  });

  it('shows default count of 1', () => {
    function Consumer() {
      const { count } = useRoll();
      return <span>{count}</span>;
    }

    const { lastFrame } = render(
      <RollProvider>
        <Consumer />
      </RollProvider>
    );
    expect(lastFrame()).toContain('1');
  });
});

describe('Spinner', () => {
  it('renders label and positive value with + sign', () => {
    const { lastFrame } = render(<Spinner label="Count:" value={3} focused={false} />);
    expect(lastFrame()).toContain('Count:');
    expect(lastFrame()).toContain('+3');
  });

  it('renders negative value without extra +', () => {
    const { lastFrame } = render(<Spinner label="Mod:" value={-5} focused={false} />);
    expect(lastFrame()).toContain('-5');
  });

  it('renders zero as +0', () => {
    const { lastFrame } = render(<Spinner label="Mod:" value={0} focused={false} />);
    expect(lastFrame()).toContain('+0');
  });
});

describe('RollExpression', () => {
  it('renders the expression string', () => {
    const { lastFrame } = render(<RollExpression expression="2d6+3" />);
    expect(lastFrame()).toContain('2d6+3');
  });
});
