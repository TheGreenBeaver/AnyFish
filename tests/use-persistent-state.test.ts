import type { Nullable } from '../utils/types';
import { renderHook, waitFor } from '@testing-library/react';
import { usePersistentState } from '../src/use-persistent-state';

describe('usePersistentState', () => {
  class MockStorage implements Storage {
    private readonly data = new Map<string, string>();

    get length(): number {
      return this.data.size;
    }

    clear(): void {
      this.data.clear();
    }

    getItem(key: string): Nullable<string> {
      return this.data.get(key) ?? null;
    }

    key(index: number): Nullable<string> {
      return Array.from(this.data.keys())[index] ?? null;
    }

    removeItem(key: string): void {
      this.data.delete(key);
    }

    setItem(key: string, value: string): void {
      this.data.set(key, value);
    }
  }

  it('Should support the `cleanup` option', async () => {
    const storage1 = new MockStorage();
    const storage2 = new MockStorage();
    const key = 'key';
    const initialText = 'HELLO';
    const storedValue = JSON.stringify({ value: initialText });

    const { rerender } = renderHook(({
      storage,
    }) => usePersistentState(initialText, key, {
      storage,
    }), {
      initialProps: {
        storage: storage1,
      },
    });

    await waitFor(() => expect(storage1.getItem(key)).toBe(storedValue));

    rerender({ storage: storage2 });
    await waitFor(() => {
      expect(storage1.getItem(key)).toBe(null);
      expect(storage2.getItem(key)).toBe(storedValue);
    });
  });

  it('Should support the `follow` option', async () => {
    const storage1 = new MockStorage();
    const storage2 = new MockStorage();
    const key = 'key';
    const initialText = 'HELLO';
    const secondText = 'GOODBYE';
    const storedValue = JSON.stringify({ value: secondText });

    const { rerender, result } = renderHook(({
      storage,
    }) => usePersistentState(initialText, key, {
      storage,
      follow: true,
    }), {
      initialProps: {
        storage: storage1,
      },
    });

    storage2.setItem(key, storedValue);

    rerender({ storage: storage2 });
    await waitFor(() => expect(result.current[0]).toBe(secondText));
  });
});