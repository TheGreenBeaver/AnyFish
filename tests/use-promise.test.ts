import { getUniqueReturnedValues, spyOnSingle, waitMs } from './test-utils';
import usePromise from '../src/use-promise';
import { waitFor, renderHook } from '@testing-library/react';

describe('usePromise', () => {
  const [usePromiseHook, promiseHookSpy] = spyOnSingle(usePromise);

  const timedPromiseCreator = (
    timeout: number,
  ) => new Promise(resolve => setTimeout(() => resolve(timeout), timeout));
  const [timedPromiseCreatorFn, timedPromiseCreatorSpy] = spyOnSingle(timedPromiseCreator);

  beforeEach(() => {
    promiseHookSpy.mockClear();
    timedPromiseCreatorSpy.mockClear();
  });

  it('Should give access to resolved value', async () => {
    const VALUE = 1;
    const promiseCreator = () => Promise.resolve(VALUE);

    const { result } = renderHook(() => usePromise(promiseCreator, []));

    await waitFor(() => expect(result.current[0]).toBe(VALUE));
  });

  it('Should give access to rejected value', async () => {
    const MESSAGE = 'Error';
    const promiseCreator = () => Promise.reject(new Error(MESSAGE));

    const { result } = renderHook(() => usePromise(promiseCreator, []));

    await waitFor(() => {
      const errorData = result.current[1];
      expect(errorData).toBeInstanceOf(Error);
      expect(errorData).toMatchObject({ message: MESSAGE });
    });
  });

  it('Should give access to promise status (in both shorthand and detailed form)', async () => {
    const { result } = renderHook(() => usePromise(timedPromiseCreator));
    const trigger = (newTimeout: number) => result.current[3].trigger(newTimeout);
    const TIMEOUT = 400;

    expect(result.current[2]).toBeFalsy();
    expect(result.current[3].status).toBe(usePromise.Status.Pending);

    trigger(TIMEOUT);
    await waitFor(() => expect(result.current[3].status).toBe(usePromise.Status.Processing));
    expect(result.current[2]).toBeTruthy();

    await waitMs(TIMEOUT);
    expect(result.current[2]).toBeFalsy();
    expect(result.current[3].status).toBe(usePromise.Status.Resolved);
  });

  it('Should allow both manual and automatic trigger', async () => {
    const TIMEOUTS = {
      first: 200,
      second: 300,
      third: 250,
    };
    const { result, rerender } = renderHook(
      ({ timeout }) => usePromise(timedPromiseCreator, [timeout]),
      { initialProps: { timeout: TIMEOUTS.first } },
    );
    await waitFor(() => expect(result.current[0]).toBe(TIMEOUTS.first));

    rerender({ timeout: TIMEOUTS.second });
    await waitFor(() => expect(result.current[0]).toBe(TIMEOUTS.second));

    result.current[3].trigger(TIMEOUTS.third);
    await waitFor(() => expect(result.current[0]).toBe(TIMEOUTS.third));
  });

  describe('usePromise.ResolveRace', () => {
    const TIMEOUTS = [500, 1000, 250] as const;
    const LAST = Math.max(...TIMEOUTS);

    const performRaceTest = async (
      resolveRace: usePromise.ResolveRace,
      tIndex: 0 | 1 | 2,
      calledTimes: number,
    ) => {
      const { result } = renderHook(() => usePromiseHook(
        timedPromiseCreatorFn, { resolveRace },
      ));
      const trigger = (newTimeout: number) => result.current[3].trigger(newTimeout);

      TIMEOUTS.forEach(trigger);

      await waitFor(() => expect(result.current[0]).toBe(TIMEOUTS[tIndex]), {
        timeout: LAST + 50,
      });

      await waitMs(LAST);
      expect(timedPromiseCreatorSpy).toHaveBeenCalledTimes(calledTimes);
      expect(timedPromiseCreatorSpy).toHaveBeenLastCalledWith(TIMEOUTS[tIndex]);

      const uniqueReturnedValues = getUniqueReturnedValues(promiseHookSpy, value => ({
        data: value[0],
        isProcessing: value[2],
        status: value[3].status,
      }));
      expect(uniqueReturnedValues).toEqual([
        { data: undefined, isProcessing: false, status: usePromise.Status.Pending },
        { data: undefined, isProcessing: true, status: usePromise.Status.Processing },
        { data: TIMEOUTS[tIndex], isProcessing: false, status: usePromise.Status.Resolved },
      ]);
    };

    it(
      'Should not update until the first one is finished with ResolveRace.TakeFirst',
      () => performRaceTest(usePromise.ResolveRace.TakeFirst, 0, 1),
    );

    it(
      'Should only update when the last one is finished with ResolveRace.TakeLast',
      () => performRaceTest(usePromise.ResolveRace.TakeLast, 2, 3),
    );
  });
});