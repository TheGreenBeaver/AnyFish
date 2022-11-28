import { useCallback, useState } from 'react';

const description = 'seed';

/**
 * Returns a function that forces the Component to re-render when called.
 *
 * @version 0.0.1
 * @see https://github.com/TheGreenBeaver/AnyFish#usererendertrigger
 */
const useReRenderTrigger = (): () => void => {
  const [, setSeed] = useState(Symbol(description));

  return useCallback(() => setSeed(Symbol(description)), []);
};

export default useReRenderTrigger;