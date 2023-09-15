import type { Optional, Usable } from '../utils/types';
import { useMountedState } from './use-mounted-state';
import { useCallback, useEffect, useRef } from 'react';
import { createGetOptions, use } from '../utils/misc';
import isArray from 'lodash/isArray';
import isNil from 'lodash/isNil';
import isEqual from 'lodash/isEqual';

export type Options<Data, Deps extends unknown[]> = Partial<{
  resolveRace: usePromise.ResolveRace,
  onStart: VoidFunction,
  onSuccess: (result: Data) => void,
  onError: (e: unknown) => void,
  onAny: VoidFunction,
  skip: Usable<boolean, Deps>,
  triggerOnSameDeps: boolean,
}>;

type More<Deps extends unknown[]> = {
  status: usePromise.Status,
  trigger: (...args: Deps) => Promise<void>,
  clearError: VoidFunction,
  clearData: VoidFunction,
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

type SkipToken = typeof usePromise.skipToken;

const isDeps = <Data, Deps extends unknown[]>(
  value?: Deps | SkipToken | Options<Data, Deps>,
): value is Deps | SkipToken => isArray(value) || value === usePromise.skipToken;

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
export function usePromise<Data, Deps extends unknown[]>(
  promiseCreator: (...args: Deps) => Promise<Data>,
  deps?: Deps | SkipToken,
  options?: Options<Data, Deps>,
): HookResult<Data, Deps>;
export function usePromise<Data, Deps extends unknown[]>(
  promiseCreator: (...args: Deps) => Promise<Data>,
  secondArg?: Deps | SkipToken | Options<Data, Deps>,
  thirdArg?: Options<Data, Deps>,
): HookResult<Data, Deps> {
  const secondIsDeps = isDeps(secondArg);
  const deps = secondIsDeps ? secondArg : undefined;
  const options = thirdArg || (!secondIsDeps ? secondArg : undefined);

  const {
    onStart,
    onSuccess,
    onError,
    onAny,
    skip,
    resolveRace,
    triggerOnSameDeps,
  } = getOptions(options);

  const [data, setData] = useMountedState<Optional<Data>>(undefined);
  const [error, setError] = useMountedState(undefined);
  const [status, setStatus] = useMountedState<usePromise.Status>(usePromise.Status.Pending);

  const lastPromiseRef = useRef<Optional<Promise<Data>>>(undefined);
  const prevDepsRef = useRef<Optional<Deps | SkipToken>>(undefined);

  const trigger = useCallback(async (...args: Deps) => {
    if (resolveRace === usePromise.ResolveRace.TakeFirst && lastPromiseRef.current) {
      return;
    }

    const promise = promiseCreator(...args);
    lastPromiseRef.current = promise;

    const doIfWonRace = (action: VoidFunction) => {
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
    if (
      deps &&
      deps !== usePromise.skipToken &&
      !use(skip, ...deps) &&
      (triggerOnSameDeps || !isEqual(deps, prevDepsRef.current))
    ) {
      trigger(...deps);
    }

    prevDepsRef.current = deps;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps ? [...[deps].flat(), trigger, skip, triggerOnSameDeps] : []);

  const clearError = useCallback(() => setError(undefined), [setError]);
  const clearData = useCallback(() => setData(undefined), [setData]);

  return [
    data,
    error,
    status === usePromise.Status.Processing,
    { trigger, status, clearError, clearData },
  ];
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

  export const skipToken = Symbol('skipToken');
}