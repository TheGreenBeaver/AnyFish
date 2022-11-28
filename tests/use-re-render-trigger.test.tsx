import useReRenderTrigger from '../src/use-re-render-trigger';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { spyOnSingle } from './test-utils';
import type { FC } from 'react';
import { memo } from 'react';

describe('useReRenderTrigger', () => {
  it('Should force the Component to re-render', async () => {
    const BUTTON_TEXT = 'trigger';

    const RawComponent: FC = () => {
      const trigger = useReRenderTrigger();

      return (
        <button onClick={trigger}>
          {BUTTON_TEXT}
        </button>
      );
    };

    const [ComponentBody, ComponentBodySpy] = spyOnSingle(RawComponent);
    const MemoComponent = memo(ComponentBody);

    const { getByText } = render(<MemoComponent />);

    fireEvent.click(getByText(BUTTON_TEXT));
    await waitFor(() => expect(ComponentBodySpy).toHaveBeenCalledTimes(2));
  });
});