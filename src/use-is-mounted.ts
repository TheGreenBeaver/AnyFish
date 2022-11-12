import { useCallback, useEffect, useRef } from 'react';

const useIsMounted = (): () => boolean => {
  const isMountedRef = useRef<boolean>(false);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return useCallback(() => isMountedRef.current, []);
};

export default useIsMounted;