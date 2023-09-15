import { useEffect } from 'react';

/**
 * Executes the effect before the component unmounts.
 *
 * @version 1.0.0
 * @see https://github.com/TheGreenBeaver/AnyFish#usewillunmount
 */
export const useWillUnmount = (effect: VoidFunction): void => {
  useEffect(() => () => {
    // Long notation so that no `return`s affect the hook logic
    effect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};