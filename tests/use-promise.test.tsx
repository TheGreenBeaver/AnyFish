import { extractFuncFromHook, extractLastResult, spyOnSingle, waitMs } from './test-utils';
import usePromise from '../src/use-promise';
import type { FC } from 'react';
import { render, waitFor } from '@testing-library/react';

describe('usePromise', () => {
  const [usePromiseHook, promiseHookSpy] = spyOnSingle(usePromise);

  afterEach(promiseHookSpy.mockClear);

  it('Should give access to resolved value', async () => {
    const VALUE = 1;
    const promiseCreator = () => Promise.resolve(VALUE);

    const Component: FC = () => {
      usePromiseHook(promiseCreator, []);

      return <div />;
    };

    render(<Component />);
    await waitFor(() => expect(extractLastResult(promiseHookSpy)[0]).toBe(VALUE));
  });

  it('Should give access to rejected value', async () => {
    const MESSAGE = 'Error';
    const promiseCreator = () => Promise.reject(new Error(MESSAGE));

    const Component: FC = () => {
      usePromiseHook(promiseCreator, []);

      return <div />;
    };

    render(<Component />);
    await waitFor(() => {
      const errorData = extractLastResult(promiseHookSpy)[1];
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

    it('Should not update until the first one is resolved with ResolveRace.TakeFirst', async () => {
      const [trigger] = extractFuncFromHook(
        () => usePromiseHook(promiseCreatorFn, { resolveRace: usePromise.ResoleRace.TakeFirst })[3],
      );

      TIMEOUTS.forEach(timeout => trigger(timeout));

      await waitFor(() => expect(extractLastResult(promiseHookSpy)[0]).toBe(TIMEOUTS[0]), {
        timeout: LAST + 50,
      });

      await waitMs(LAST + 50);
      expect(promiseCreatorSpy).toHaveBeenCalledTimes(1);
      expect(promiseCreatorSpy).toHaveBeenLastCalledWith(TIMEOUTS[0]);

      expect(promiseHookSpy.mock.results.map(result => ({
        data: result.value[0],
        status: result.value[4],
      }))).toEqual([
        { data: undefined, status: usePromise.Status.Pending },
        { data: undefined, status: usePromise.Status.Processing },
        { data: TIMEOUTS[0], status: usePromise.Status.Resolved },
      ]);
    });

    it('Should only update when the last one is resolved with ResolveRace.TakeLast', async () => {
      const [trigger] = extractFuncFromHook(
        () => usePromiseHook(promiseCreatorFn, { resolveRace: usePromise.ResoleRace.TakeLast })[3],
      );

      TIMEOUTS.forEach(timeout => trigger(timeout));

      await waitFor(() => expect(extractLastResult(promiseHookSpy)[0]).toBe(TIMEOUTS[2]), {
        timeout: LAST + 50,
      });

      await waitMs(LAST + 50);
      expect(promiseCreatorSpy).toHaveBeenCalledTimes(3);
      expect(promiseCreatorSpy).toHaveBeenLastCalledWith(TIMEOUTS[2]);

      expect(promiseHookSpy.mock.results.map(result => ({
        data: result.value[0],
        status: result.value[4],
      }))).toEqual([
        { data: undefined, status: usePromise.Status.Pending },
        { data: undefined, status: usePromise.Status.Processing },
        { data: TIMEOUTS[2], status: usePromise.Status.Resolved },
      ]);
    });
  });
});