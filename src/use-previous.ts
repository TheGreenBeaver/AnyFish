import { useCallback, useEffect, useRef } from 'react';

/**
 * Returns a function to access the previous value of a variable.
 *
 * @version 1.2.0
 * @see https://github.com/TheGreenBeaver/AnyFish#useprevious
 */
export const usePrevious = <T>(value: T, initialValue: T = value): () => T => {
  const previousValueRef = useRef<T>(initialValue);

  useEffect(() => {
    previousValueRef.current = value;
  }, [value]);

  return useCallback(() => previousValueRef.current, []);
};