import { renderHook, waitFor } from '@testing-library/react';
import { useBoolean } from '../src/use-boolean';

describe('useBoolean', () => {
  it('Should control the boolean flag value', async () => {
    const { result } = renderHook(useBoolean);

    result.current[1]();
    await waitFor(() => expect(result.current[0]).toBe(true));

    result.current[2]();
    await waitFor(() => expect(result.current[0]).toBe(false));

    result.current[3]();
    await waitFor(() => expect(result.current[0]).toBe(true));

    result.current[3]();
    await waitFor(() => expect(result.current[0]).toBe(false));

    result.current[4](true);
    await waitFor(() => expect(result.current[0]).toBe(true));
  });
});