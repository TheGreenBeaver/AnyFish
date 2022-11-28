import { getUniqueReturnedValues, spyOnSingle, waitMs } from './test-utils';
import usePromise from '../src/use-promise';
import { waitFor, renderHook } from '@testing-library/react';

describe('usePromise', () => {
  const [usePromiseHook, promiseHookSpy] = spyOnSingle(usePromise);

  afterEach(promiseHookSpy.mockClear);

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

  it('Should give access to promise status (in both shorthand and detailed form)', () => {

  });

  it('Should allow both manual and automatic trigger', () => {

  });

  describe('usePromise.ResolveRace', () => {
    const TIMEOUTS = [500, 1000, 250] as const;
    const LAST = Math.max(...TIMEOUTS);

    const promiseCreator = (timeout: number) => new Promise(resolve => setTimeout(() => resolve(timeout), timeout));
    const [promiseCreatorFn, promiseCreatorSpy] = spyOnSingle(promiseCreator);

    afterEach(promiseCreatorSpy.mockClear);

    const performRaceTest = async (
      resolveRace: usePromise.ResolveRace,
      tIndex: 0 | 1 | 2,
      calledTimes: number,
    ) => {
      const { result } = renderHook(() => usePromiseHook(
        promiseCreatorFn, { resolveRace },
      ));
      const trigger = (newTimeout: number) => result.current[3].trigger(newTimeout);

      TIMEOUTS.forEach(timeout => trigger(timeout));

      await waitFor(() => expect(result.current[0]).toBe(TIMEOUTS[tIndex]), {
        timeout: LAST + 50,
      });

      await waitMs(LAST + 50);
      expect(promiseCreatorSpy).toHaveBeenCalledTimes(calledTimes);
      expect(promiseCreatorSpy).toHaveBeenLastCalledWith(TIMEOUTS[tIndex]);

      const uniqueReturnedValues = getUniqueReturnedValues(promiseHookSpy, value => ({
        data: value[0],
        status: value[3].status,
      }));
      expect(uniqueReturnedValues).toEqual([
        { data: undefined, status: usePromise.Status.Pending },
        { data: undefined, status: usePromise.Status.Processing },
        { data: TIMEOUTS[tIndex], status: usePromise.Status.Resolved },
      ]);
    };

    it(
      'Should not update until the first one is resolved with ResolveRace.TakeFirst',
      () => performRaceTest(usePromise.ResolveRace.TakeFirst, 0, 1),
    );

    it(
      'Should only update when the last one is resolved with ResolveRace.TakeLast',
      () => performRaceTest(usePromise.ResolveRace.TakeLast, 2, 3),
    );
  });
});