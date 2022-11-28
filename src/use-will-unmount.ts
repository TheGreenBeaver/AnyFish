import { useEffect } from 'react';

/**
 * Executes the effect before the component unmounts.
 *
 * @version 0.0.1
 * @see https://github.com/TheGreenBeaver/AnyFish#usewillunmount
 */
const useWillUnmount = (effect: () => void): void => {
  useEffect(() => () => {
    // Long notation so that no `return`s affect the hook logic
    effect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};

export default useWillUnmount;