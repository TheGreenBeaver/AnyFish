import { useCallback, useEffect, useRef } from 'react';

const useRenderCount = (): () => number => {
  const renderCountRef = useRef<number>(0);

  useEffect(() => {
    renderCountRef.current++;
  });

  return useCallback(() => renderCountRef.current, []);
};

export default useRenderCount;