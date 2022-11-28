import useUpdate from '../src/use-update';
import type { Options } from '../src/use-update';
import { renderHook } from '@testing-library/react';

describe('useUpdate', () => {
  const cleanup = jest.fn();
  const effect = jest.fn((...args: unknown[]) => () => cleanup(...args));

  afterEach(() => {
    cleanup.mockClear();
    effect.mockClear();
  });

  const prepare = (
    options?: Partial<Options>,
  ): [(times?: number) => void, (overrideOptions?: Partial<Options>) => void] => {
    let currentFoo = 1;

    const { rerender, result } = renderHook(({ foo }) => useUpdate(() => effect(foo), [foo], options), {
      initialProps: { foo: currentFoo },
    });

    return [
      times => [...Array(times ?? 1)].forEach(() => rerender({ foo: ++currentFoo })),
      result.current,
    ];
  };

  it('Should only execute the effect once and skip the cleanup', () => {
    const [rerender] = prepare({ once: true, withCleanup: false });
    expect(effect).not.toHaveBeenCalled();

    rerender();
    expect(effect).toHaveBeenCalledTimes(1);

    rerender();
    expect(effect).toHaveBeenCalledTimes(1);
    expect(cleanup).not.toHaveBeenCalled();
  });

  it('Should allow enforcing running cleanup functions', () => {
    const [rerender] = prepare({ once: true });
    expect(cleanup).not.toHaveBeenCalled();

    rerender();
    expect(cleanup).not.toHaveBeenCalled();
    const effectArgs = effect.mock.lastCall;

    rerender();
    expect(cleanup).toHaveBeenLastCalledWith(...effectArgs);

    rerender();
    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  it('Should allow specifying which update is the triggering one', () => {
    const [rerender] = prepare({ nthUpdate: 2, once: true, withCleanup: false });
    expect(effect).not.toHaveBeenCalled();

    rerender();
    expect(effect).not.toHaveBeenCalled();

    rerender();
    expect(effect).toHaveBeenCalledTimes(1);
  });

  it('Should allow resetting and overriding options', () => {
    const [rerender, reset] = prepare({ once: true, withCleanup: false });
    expect(effect).not.toHaveBeenCalled();

    rerender();
    expect(effect).toHaveBeenCalledTimes(1);

    rerender();
    expect(cleanup).not.toHaveBeenCalled();

    reset({ nthUpdate: 2, withCleanup: true });

    rerender(2);
    expect(effect).toHaveBeenCalledTimes(1);

    rerender();
    expect(effect).toHaveBeenCalledTimes(2);
    const effectArgs = effect.mock.lastCall;

    rerender();
    expect(cleanup).toHaveBeenLastCalledWith(...effectArgs);
  });
});