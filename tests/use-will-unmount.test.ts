import useWillUnmount from '../src/use-will-unmount';
import { renderHook } from '@testing-library/react';

describe('useWillUnmount', () => {
  it('Should execute the effect right before the unmount', () => {
    const cleanup = jest.fn();
    const effect = jest.fn(() => cleanup);

    const { unmount, rerender } = renderHook(() => useWillUnmount(effect));

    expect(effect).not.toHaveBeenCalled();

    rerender();
    expect(effect).not.toHaveBeenCalled();

    unmount();
    expect(effect).toHaveBeenCalled();
  });
});