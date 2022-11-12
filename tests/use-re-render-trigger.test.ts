import useReRenderTrigger from '../src/use-re-render-trigger';
import { extractFuncFromHook } from './test-utils';
import { waitFor } from '@testing-library/react';

describe('useReRenderTrigger', () => {
  it('Should force the Component to re-render', async () => {
    const [trigger, ComponentBodySpy] = extractFuncFromHook(useReRenderTrigger);

    trigger();
    await waitFor(() => expect(ComponentBodySpy).toHaveBeenCalledTimes(2));
  });
});