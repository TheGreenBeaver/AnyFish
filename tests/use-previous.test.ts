import { renderHook } from '@testing-library/react';
import { usePrevious } from '../src/use-previous';

describe('usePrevious', () => {
  it('Should give access to previous value', () => {
    enum State {
      First,
      Second,
      Third,
    }

    const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
      initialProps: { value: State.First },
    });

    rerender({ value: State.Second });
    expect(result.current).toBe(State.First);

    rerender({ value: State.Third });
    expect(result.current).toBe(State.Second);
  });
});