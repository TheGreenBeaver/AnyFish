import type { Dispatch, SetStateAction} from 'react';
import { useEffect, useMemo, useState } from 'react';
import { createGetOptions, devConsole, use } from '../utils/misc';
import type { Usable } from '../utils/types';

type Options<S> = {
  storage: Storage,
  serializer: { stringify: (value: S) => string, parse: (serialized: string) => S },
  cleanup: boolean,
  clearOnParsingError: boolean,
};

const defaultSerializer = {
  stringify: (value: unknown) => JSON.stringify({ value }),
  parse: (serialized: string) => JSON.parse(serialized).value,
};

const getOptions = createGetOptions({
  storage: typeof localStorage === 'undefined' ? undefined : localStorage,
  serializer: defaultSerializer,
  cleanup: true,
  clearOnParsingError: true,
}) as <S>(providedOptions?: Partial<Options<S>>) => Options<S>;

/**
 * A convenience wrapper for {@link React.useState} that lets you keep data in a persistent browser storage.
 *
 * @version 1.2.2
 * @see https://github.com/TheGreenBeaver/AnyFish#usepersistentstate
 */
export const usePersistentState = <S>(
  initialValue: Usable<S>,
  key: string,
  options?: Partial<Options<S>>,
): [S, Dispatch<SetStateAction<S>>] => {
  const { storage, serializer, cleanup, clearOnParsingError } = useMemo(() => getOptions<S>(options), [options]);

  const [value, setValue] = useState<S>(() => {
    const storedData = storage.getItem(key);

    if (storedData != null) {
      try {
        return serializer.parse(storedData);
      } catch (e) {
        if (clearOnParsingError) {
          storage.removeItem(key);
        }

        devConsole.error(`Failed to parse the data stored for usePersistentState at "${key}"\n`, e);
      }
    }

    return use(initialValue);
  });

  useEffect(() => {
    const lastStorage = storage;
    const lastKey = key;
    const lastSerializer = serializer;

    try {
      storage.setItem(key, serializer.stringify(value));
    } catch (e) {
      devConsole.error(`Failed to stringify the current value of usePersistentState to store at ${key}\n`, e);
    }

    return () => {
      if (cleanup && (
        lastStorage !== storage ||
        lastKey !== key ||
        lastSerializer !== serializer
      )) {
        storage.removeItem(key);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, storage, value, serializer]);

  return [value, setValue];
};