import { getUniqueReturnedValues, spyOnSingle, waitMs } from './test-utils';
import type { HookResult} from '../src/use-promise';
import { usePromise } from '../src/use-promise';
import type { RenderHookResult } from '@testing-library/react';
import { waitFor, renderHook } from '@testing-library/react';
import isError from 'lodash/isError';

describe('usePromise', () => {
  const ERROR_MESSAGE = 'Error';
  const [usePromiseHook, promiseHookSpy] = spyOnSingle(usePromise);

  const timedPromiseCreator = (
    timeout: number,
  ) => new Promise(resolve => setTimeout(() => resolve(timeout), timeout));
  const [timedPromiseCreatorFn, timedPromiseCreatorSpy] = spyOnSingle(timedPromiseCreator);

  const extractTrigger = <Arg>(
    result: RenderHookResult<HookResult<unknown, [Arg]>, unknown>['result'],
  ) => (arg: Arg) => result.current[3].trigger(arg);

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
    const promiseCreator = () => Promise.reject(new Error(ERROR_MESSAGE));

    const { result } = renderHook(() => usePromise(promiseCreator, []));

    await waitFor(() => {
      const errorData = result.current[1];
      expect(errorData).toBeInstanceOf(Error);
      expect(errorData).toMatchObject({ message: ERROR_MESSAGE });
    });
  });

  it('Should give access to promise status (in both shorthand and detailed form)', async () => {
    const { result } = renderHook(() => usePromise(timedPromiseCreator));
    const trigger = extractTrigger(result);
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

  it('Should cleanup the results of previous triggers', async () => {
    const ADMIN = 'admin';
    const SECRET_KEY = 'secret key';

    const promiseCreator = async (username: string): Promise<string> => {
      await waitMs(50);

      if (username === ADMIN) {
        return SECRET_KEY;
      }

      throw new Error(ERROR_MESSAGE);
    };

    const { result } = renderHook(() => usePromiseHook(promiseCreator));
    const trigger = extractTrigger(result);

    trigger('common user');
    await waitFor(() => {
      expect(result.current[0]).toBe(undefined);
      expect(result.current[1]).toBeInstanceOf(Error);
      expect(result.current[1]).toMatchObject({ message: ERROR_MESSAGE });
    });

    trigger(ADMIN);
    await waitFor(() => {
      expect(result.current[0]).toBe(SECRET_KEY);
      expect(result.current[1]).toBe(undefined);
    });

    expect(getUniqueReturnedValues(promiseHookSpy, value => ({
      data: value[0],
      error: isError(value[1]) ? value[1].message : undefined,
      isProcessing: value[2],
      status: value[3].status,
    }))).toEqual([
      { data: undefined, error: undefined, isProcessing: false, status: usePromise.Status.Pending },
      { data: undefined, error: undefined, isProcessing: true, status: usePromise.Status.Processing },
      { data: undefined, error: ERROR_MESSAGE, isProcessing: false, status: usePromise.Status.Rejected },
      { data: undefined, error: undefined, isProcessing: true, status: usePromise.Status.Processing },
      { data: SECRET_KEY, error: undefined, isProcessing: false, status: usePromise.Status.Resolved },
    ]);
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
      const trigger = extractTrigger(result);

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