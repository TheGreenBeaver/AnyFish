import type { FC } from 'react';
import useWillUnmount from '../src/use-will-unmount';
import { render } from '@testing-library/react';

describe('useWillUnmount', () => {
  it('Should execute the callback right before the unmount', () => {
    const callback = jest.fn();

    const Component: FC = () => {
      useWillUnmount(callback);

      return <div />;
    };

    const { unmount, rerender } = render(<Component />);
    expect(callback).not.toHaveBeenCalled();

    rerender(<Component />);
    expect(callback).not.toHaveBeenCalled();

    unmount();
    expect(callback).toHaveBeenCalled();
  });
});