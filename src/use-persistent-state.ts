import { useCallback, useEffect, useMemo, useState } from 'react';
import { createGetOptions, devConsole, use } from '../utils/misc';
import type { SetState, Usable } from '../utils/types';
import { usePrevious } from './use-previous';

type Options<S> = {
  storage: Storage,
  serializer: { stringify: (value: S) => string, parse: (serialized: string) => S },
  cleanup: boolean,
  follow: boolean,
  clearOnParsingError: boolean,
};

const defaultSerializer = {
  stringify: (value: unknown) => JSON.stringify({ value }),
  parse: (serialized: string) => JSON.parse(serialized).value,
};

const getOptions = createGetOptions({
  serializer: defaultSerializer,
  cleanup: true,
  follow: false,
  clearOnParsingError: true,
}) as <S>(providedOptions?: Partial<Options<S>>) => Omit<Options<S>, 'storage'> & { storage?: Storage };

/**
 * A convenience wrapper for {@link React.useState} that lets you keep data in a persistent browser storage.
 *
 * @version 1.3.0
 * @see https://github.com/TheGreenBeaver/AnyFish#usepersistentstate
 */
export const usePersistentState = <S>(
  initialValue: Usable<S>,
  key: string,
  options?: Partial<Options<S>>,
): [S, SetState<S>] => {
  const {
    storage: providedStorage,
    serializer,
    cleanup,
    follow,
    clearOnParsingError,
  } = useMemo(() => getOptions<S>(options), [options]);

  const storage = providedStorage ?? (typeof localStorage === 'undefined' ? undefined : localStorage);

  const getPrevStorage = usePrevious(storage);
  const getPrevKey = usePrevious(key);

  const getStoredValue = useCallback((fallback: Usable<S> = initialValue) => {
    if (!storage) {
      return use(fallback);
    }

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

    return use(fallback);
  }, [clearOnParsingError, storage, initialValue, key, serializer]);

  const [value, setValue] = useState<S>(getStoredValue);

  useEffect(() => {
    if (!storage) {
      return undefined;
    }

    try {
      storage.setItem(key, serializer.stringify(value));
    } catch (e) {
      devConsole.error(`Failed to stringify the current value of usePersistentState to store at ${key}\n`, e);
    }

    return undefined;
  }, [storage, key, serializer, value]);

  useEffect(() => {
    if (follow || !getPrevStorage() && storage) {
      setValue(getStoredValue);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, serializer, storage, getPrevStorage]);

  useEffect(() => {
    if (cleanup) {
      getPrevStorage()?.removeItem(getPrevKey());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, serializer, storage, getPrevStorage, getPrevKey]);

  return [value, setValue];
};