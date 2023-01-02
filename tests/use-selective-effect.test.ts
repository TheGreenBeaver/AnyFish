import { renderHook } from '@testing-library/react';
import { useSelectiveEffect } from '../src/use-selective-effect';
import { useEffect } from 'react';

describe('useSelectiveEffect', () => {
  const plainEffect = jest.fn();
  const selectiveEffect = jest.fn();

  beforeEach(() => {
    plainEffect.mockClear();
    selectiveEffect.mockClear();
  });

  it('Should only trigger the effect when deps deeply change', () => {
    const plain = renderHook(props => useEffect(plainEffect, [props]), {
      initialProps: { foo: 1, bar: 2 },
    });
    const selective = renderHook(props => useSelectiveEffect(selectiveEffect, [props]), {
      initialProps: { foo: 1, bar: 2 },
    });

    plain.rerender({ foo: 1, bar: 2 });
    selective.rerender({ foo: 1, bar: 2 });
    expect(plainEffect).toHaveBeenCalledTimes(2);
    expect(selectiveEffect).toHaveBeenCalledTimes(1);
  });

  it('Should allow customizing comparator', () => {
    class Mod {
      val: number;

      constructor(val: number) {
        this.val = val;
      }

      isSame(other: Mod) {
        return other.val % 3 === this.val % 3;
      }
    }

    const modA = new Mod(5);
    const modB = new Mod(8);

    const plain = renderHook(props => useEffect(plainEffect, [props.mod]), {
      initialProps: { mod: modA },
    });
    const selective = renderHook(props => useSelectiveEffect<[Mod]>(selectiveEffect, [props.mod], {
      compare: (prev, curr) => curr[0].isSame(prev[0]),
    }), {
      initialProps: { mod: modA },
    });

    plain.rerender({ mod: modB });
    selective.rerender({ mod: modB });
    expect(plainEffect).toHaveBeenCalledTimes(2);
    expect(selectiveEffect).toHaveBeenCalledTimes(1);
  });
});