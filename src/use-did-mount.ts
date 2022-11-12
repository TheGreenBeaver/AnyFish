import { useEffect } from 'react';

/**
 * Execute the callback after the first render
 */
const useDidMount = (callback: () => void): void => {
  useEffect(() => {
    // Long notation so that no `return`s affect the hook logic
    callback();
  }, []);
};

export default useDidMount;