import useRenderCount from '../src/use-render-count';
import { extractLastResult, spyOnSingle } from './test-utils';
import type { FC} from 'react';
import { memo } from 'react';
import { render } from '@testing-library/react';

describe('useRenderCount', () => {
  it('Should return the number of times the Component has rendered', () => {
    const [useCountHook, countHookSpy] = spyOnSingle(useRenderCount);

    const RawComponent: FC<{ text: string }> = ({ text }) => {
      useCountHook();

      return <p>Text: {text}</p>;
    };

    const [ComponentBody, ComponentBodySpy] = spyOnSingle(RawComponent);
    const MemoComponent = memo(ComponentBody);
    const check = () => expect(extractLastResult(countHookSpy)()).toBe(ComponentBodySpy.mock.calls.length);

    const { rerender } = render(<MemoComponent text='lorem' />);
    check();

    rerender(<MemoComponent text="ipsum" />);
    check();

    rerender(<MemoComponent text="ipsum" />);
    check();
  });
});