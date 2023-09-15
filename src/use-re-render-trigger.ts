import { useCallback, useState } from 'react';

const description = 'seed';

/**
 * Returns a function that forces the Component to re-render when called.
 *
 * @version 1.0.0
 * @see https://github.com/TheGreenBeaver/AnyFish#usererendertrigger
 */
export const useReRenderTrigger = (): VoidFunction => {
  const [, setSeed] = useState(Symbol(description));

  return useCallback(() => setSeed(Symbol(description)), []);
};