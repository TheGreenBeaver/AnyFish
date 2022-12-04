import { useCallback, useEffect, useRef } from 'react';

/**
 * Returns a function to access the mounted state of a functional component.
 *
 * @version 1.0.0
 * @see https://github.com/TheGreenBeaver/AnyFish#useismounted
 */
export const useIsMounted = (): () => boolean => {
  const isMountedRef = useRef<boolean>(false);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return useCallback(() => isMountedRef.current, []);
};