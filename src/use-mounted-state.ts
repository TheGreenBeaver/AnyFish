import type { Dispatch, SetStateAction } from 'react';
import { useCallback, useState } from 'react';
import useIsMounted from './use-is-mounted';

const useMountedState = <T>(
  initializer: T | (() => T),
): [T, Dispatch<SetStateAction<T>>] => {
  const [data, setData] = useState<T>(initializer);
  const getIsMounted = useIsMounted();

  const setDataIfMounted: Dispatch<SetStateAction<T>> = useCallback(value => {
    if (getIsMounted()) {
      setData(value);
    }
  }, [getIsMounted]);

  return [data, setDataIfMounted];
};

export default useMountedState;