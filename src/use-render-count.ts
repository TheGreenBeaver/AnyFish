import { useCallback, useEffect, useRef } from 'react';

/**
 * Returns a function to access the amount of times the Component has rendered.
 *
 * @version 1.0.0
 * @see https://github.com/TheGreenBeaver/AnyFish#userendercount
 */
const useRenderCount = (): () => number => {
  const renderCountRef = useRef<number>(0);

  useEffect(() => {
    renderCountRef.current++;
  });

  return useCallback(() => renderCountRef.current, []);
};

export default useRenderCount;