import type { Optional } from '../utils/types';
import useMountedState from './use-mounted-state';
import { useCallback, useEffect, useMemo, useRef } from 'react';

enum Status {
  Pending = 'pending',
  Processing = 'processing',
  Resolved = 'resolved',
  Rejected = 'rejected',
}

enum ResoleRace {
  TakeFirst = 'takeFirst',
  TakeLast = 'takeLast',
  TakeEvery = 'takeEvery',
}

const EnumHolder = { Status, ResoleRace } as const;

type Options<Data> = {
  resolveRace: ResoleRace,
  onStart: () => void,
  onSuccess: (result: Data) => void,
  onError: (e: unknown) => void,
  onAny: () => void,
};

type HookResult<Data, Deps extends unknown[]> = [
  Optional<Data>,
  unknown,
  boolean,
  (...args: Deps) => Promise<void>,
  Status,
];

function usePromiseImplementation <Data, Deps extends unknown[]>(
  promiseCreator: (...args: Deps) => Promise<Data>, options?: Partial<Options<Data>>,
): HookResult<Data, Deps>;
function usePromiseImplementation <Data, Deps extends unknown[]>(
  promiseCreator: (...args: Deps) => Promise<Data>, deps?: Deps,
): HookResult<Data, Deps>;
function usePromiseImplementation <Data, Deps extends unknown[]>(
  promiseCreator: (...args: Deps) => Promise<Data>, deps?: Deps, options?: Partial<Options<Data>>,
): HookResult<Data, Deps>;
function usePromiseImplementation <Data, Deps extends unknown[]>(
  promiseCreator: (...args: Deps) => Promise<Data>,
  secondArg?: Deps | Partial<Options<Data>>,
  thirdArg?: Partial<Options<Data>>,
): HookResult<Data, Deps> {
  const secondIsArray = Array.isArray(secondArg);
  const deps = secondIsArray ? secondArg : undefined;
  const options = thirdArg || (!secondIsArray ? secondArg : undefined);

  const resolveRace = options?.resolveRace || ResoleRace.TakeLast;
  const { onStart, onSuccess, onError, onAny } = options || {};

  const [data, setData] = useMountedState<Optional<Data>>(undefined);
  const [error, setError] = useMountedState(undefined);
  const [status, setStatus] = useMountedState<Status>(Status.Pending);
  const lastPromiseRef = useRef<Optional<Promise<Data>>>(undefined);

  const trigger = useCallback(async (...args: Deps) => {
    if (resolveRace === ResoleRace.TakeFirst && lastPromiseRef.current) {
      return;
    }

    const promise = promiseCreator(...args);
    lastPromiseRef.current = promise;

    const doIfWonRace = (action: () => void) => {
      if (resolveRace !== ResoleRace.TakeLast || lastPromiseRef.current === promise) {
        action();
      }
    };

    onStart?.();
    setStatus(Status.Processing);

    try {
      const result = await promise;

      doIfWonRace(() => {
        setData(result);
        onSuccess?.(result);
        setStatus(Status.Resolved);
      });
    } catch (e) {
      doIfWonRace(() => {
        setError(e);
        onError?.(e);
        setStatus(Status.Rejected);
      });
    } finally {
      doIfWonRace(() => {
        onAny?.();
        lastPromiseRef.current = undefined;
      });
    }
  }, [promiseCreator, resolveRace, onStart, onSuccess, onError, onAny, setData, setError, setStatus]);

  useEffect(() => {
    if (deps) {
      trigger(...deps);
    }
  }, deps ? [...deps, trigger] : []);

  return useMemo(() => [data, error, status === Status.Processing, trigger, status], [data, error, trigger, status]);
}

const usePromise: typeof usePromiseImplementation & typeof EnumHolder =
  Object.assign(usePromiseImplementation, EnumHolder);

export default usePromise;