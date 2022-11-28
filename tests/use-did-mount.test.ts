import useDidMount from '../src/use-did-mount';
import { renderHook } from '@testing-library/react';

describe('useDidMount', () => {
  it('Should execute the effect after the initial render', () => {
    const cleanup = jest.fn();
    const effect = jest.fn(() => cleanup);

    const { rerender } = renderHook(() => useDidMount(effect));
    expect(effect).toHaveBeenCalledTimes(1);

    rerender();
    expect(effect).toHaveBeenCalledTimes(1);
    expect(cleanup).not.toHaveBeenCalled();
  });
});