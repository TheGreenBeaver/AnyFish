import { useEffect } from 'react';

const useWillUnmount = (callback: () => void): void => {
  useEffect(() => () => {
    // Long notation so that no `return`s affect the hook logic
    callback();
  }, []);
};

export default useWillUnmount;