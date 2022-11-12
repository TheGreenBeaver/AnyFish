import type { FC } from 'react';
import useDidMount from '../src/use-did-mount';
import { render } from '@testing-library/react';

describe('useDidMount', () => {
  it('Should execute the callback after the initial render', () => {
    const callback = jest.fn();

    const Component: FC = () => {
      useDidMount(callback);

      return <div />;
    };

    const { rerender } = render(<Component />);
    expect(callback).toHaveBeenCalledTimes(1);

    rerender(<Component />);
    expect(callback).toHaveBeenCalledTimes(1);
  });
});