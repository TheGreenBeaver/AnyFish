import { useCallback, useState } from 'react';

const description = 'seed';

const useReRenderTrigger = (): () => void => {
  const [, setSeed] = useState(Symbol(description));

  return useCallback(() => setSeed(Symbol(description)), []);
};

export default useReRenderTrigger;