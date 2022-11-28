import type { Dispatch, SetStateAction} from 'react';
import { useEffect, useMemo, useState } from 'react';
import { devConsole, use } from '../utils/misc';
import type { Usable } from '../utils/types';
import defaults from 'lodash/defaults';

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

const getOptions = <S>(providedOptions?: Partial<Options<S>>): Options<S> => defaults(
  {}, providedOptions, {
    storage: localStorage,
    serializer: defaultSerializer,
    cleanup: true,
    clearOnParsingError: true,
  },
);

/**
 * A convenience wrapper for {@link React.useState} that lets you keep data in a persistent browser storage.
 *
 * @version 0.0.1
 * @see https://github.com/TheGreenBeaver/AnyFish#usepersistentstate
 */
const usePersistentState = <S>(
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

        devConsole.error('Failed to parse the stored data for usePersistentState', e);
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
      devConsole.error('Failed to stringify the current value of usePersistentState', e);
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

export default usePersistentState;