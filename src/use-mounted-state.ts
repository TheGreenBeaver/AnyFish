import { useCallback, useState } from 'react';
import { useIsMounted } from './use-is-mounted';
import type { Optional, SetState, SetStateResult, Usable } from '../utils/types';

/**
 * A combination of plain {@link React.useState} and {@link useIsMounted}.
 *
 * The call signature is identical to {@link React.useState}.
 *
 * @version 1.3.0
 * @see https://github.com/TheGreenBeaver/AnyFish#usemountedstate
 */
export function useMountedState<T>(initialState: Usable<T>): SetStateResult<T>;
/**
 * A combination of plain {@link React.useState} and {@link useIsMounted}.
 *
 * The call signature is identical to {@link React.useState}.
 *
 * @version 1.3.0
 * @see https://github.com/TheGreenBeaver/AnyFish#usemountedstate
 */
export function useMountedState<T = undefined>(): SetStateResult<Optional<T>>;
export function useMountedState<T>(
  initialState?: Usable<T>,
) {
  const [data, setData] = useState(initialState);
  const getIsMounted = useIsMounted();

  const setDataIfMounted = useCallback<SetState<Optional<T>>>(value => {
    if (getIsMounted()) {
      setData(value);
    }
  }, [getIsMounted]);

  return [data, setDataIfMounted];
}