import type { Dispatch, SetStateAction } from 'react';
import { useCallback, useState } from 'react';
import { useIsMounted } from './use-is-mounted';

/**
 * A combination of plain {@link React.useState} and {@link useIsMounted}.
 *
 * The call signature is identical to {@link React.useState}.
 *
 * @version 1.0.0
 * @see https://github.com/TheGreenBeaver/AnyFish#usemountedstate
 */
export const useMountedState = <T>(
  initialState: T | (() => T),
): [T, Dispatch<SetStateAction<T>>] => {
  const [data, setData] = useState<T>(initialState);
  const getIsMounted = useIsMounted();

  const setDataIfMounted: Dispatch<SetStateAction<T>> = useCallback(value => {
    if (getIsMounted()) {
      setData(value);
    }
  }, [getIsMounted]);

  return [data, setDataIfMounted];
};