import type { Optional, Usable } from '../utils/types';
import { useMountedState } from './use-mounted-state';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { createGetOptions, use } from '../utils/misc';
import isArray from 'lodash/isArray';
import isNil from 'lodash/isNil';
import isEqual from 'lodash/isEqual';

export type Options<Data, Deps extends unknown[]> = Partial<{
  resolveRace: usePromise.ResolveRace,
  onStart: () => void,
  onSuccess: (result: Data) => void,
  onError: (e: unknown) => void,
  onAny: () => void,
  skip: Usable<boolean, Deps>,
  triggerOnSameDeps: boolean,
}>;

type More<Deps extends unknown[]> = {
  status: usePromise.Status,
  trigger: (...args: Deps) => Promise<void>,
};

export type HookResult<Data, Deps extends unknown[]> = [
  Optional<Data>,
  unknown,
  boolean,
  More<Deps>,
];

const defaultSkip = <Deps extends unknown[]>(...deps: Deps): boolean => deps.some(isNil);

const getOptions = createGetOptions({
  resolveRace: 'takeLast',
  skip: defaultSkip,
}) as <Data, Deps extends unknown[]>(providedOptions?: Options<Data, Deps>) => Options<Data, Deps>;

/**
 * Tracks the lifecycle of a Promise, handles data storing and error catching.
 *
 * @version 1.2.0
 * @see https://github.com/TheGreenBeaver/AnyFish#usepromise
 */
export function usePromise <Data, Deps extends unknown[]>(
  promiseCreator: (...args: Deps) => Promise<Data>, options?: Options<Data, Deps>,
): HookResult<Data, Deps>;
/**
 * Tracks the lifecycle of a Promise, handles data storing and error catching and automatically triggers on `deps`
 * change.
 *
 * @version 1.2.0
 * @see https://github.com/TheGreenBeaver/AnyFish#usepromise
 */
export function usePromise <Data, Deps extends unknown[]>(
  promiseCreator: (...args: Deps) => Promise<Data>, deps?: Deps, options?: Options<Data, Deps>,
): HookResult<Data, Deps>;
export function usePromise <Data, Deps extends unknown[]>(
  promiseCreator: (...args: Deps) => Promise<Data>,
  secondArg?: Deps | Options<Data, Deps>,
  thirdArg?: Options<Data, Deps>,
): HookResult<Data, Deps> {
  const secondIsArray = isArray(secondArg);
  const deps = secondIsArray ? secondArg : undefined;
  const options = thirdArg || (!secondIsArray ? secondArg : undefined);

  const {
    onStart,
    onSuccess,
    onError,
    onAny,
    skip,
    resolveRace,
    triggerOnSameDeps,
  } = useMemo(() => getOptions(options), [options]);

  const [data, setData] = useMountedState<Optional<Data>>(undefined);
  const [error, setError] = useMountedState(undefined);
  const [status, setStatus] = useMountedState<usePromise.Status>(usePromise.Status.Pending);

  const lastPromiseRef = useRef<Optional<Promise<Data>>>(undefined);
  const prevDepsRef = useRef<Optional<Deps>>(undefined);

  const trigger = useCallback(async (...args: Deps) => {
    if (resolveRace === usePromise.ResolveRace.TakeFirst && lastPromiseRef.current) {
      return;
    }

    const promise = promiseCreator(...args);
    lastPromiseRef.current = promise;

    const doIfWonRace = (action: () => void) => {
      if (resolveRace !== usePromise.ResolveRace.TakeLast || lastPromiseRef.current === promise) {
        action();
      }
    };

    onStart?.();
    setStatus(usePromise.Status.Processing);
    setData(undefined);
    setError(undefined);

    try {
      const result = await promise;

      doIfWonRace(() => {
        setData(result);
        onSuccess?.(result);
        setStatus(usePromise.Status.Resolved);
      });
    } catch (e) {
      doIfWonRace(() => {
        setError(e);
        onError?.(e);
        setStatus(usePromise.Status.Rejected);
      });
    } finally {
      doIfWonRace(() => {
        onAny?.();
        lastPromiseRef.current = undefined;
      });
    }
  }, [promiseCreator, resolveRace, onStart, onSuccess, onError, onAny, setData, setError, setStatus]);

  useEffect(() => {
    if (deps && !use(skip, ...deps) && (triggerOnSameDeps || !isEqual(deps, prevDepsRef.current))) {
      trigger(...deps);
    }

    prevDepsRef.current = deps;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps ? [...deps, trigger, skip, triggerOnSameDeps] : []);

  return useMemo(
    () => [data, error, status === usePromise.Status.Processing, { trigger, status }],
    [data, error, trigger, status],
  );
}

export namespace usePromise {
  export enum Status {
    Pending = 'pending',
    Processing = 'processing',
    Resolved = 'resolved',
    Rejected = 'rejected',
  }

  export enum ResolveRace {
    TakeFirst = 'takeFirst',
    TakeLast = 'takeLast',
  }
}