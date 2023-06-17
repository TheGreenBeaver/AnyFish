import { useCallback, useEffect, useState } from 'react';
import { createGetOptions, devConsole, use } from '../utils/misc';
import type { SetStateResult, Unfilled, Usable } from '../utils/types';
import { usePrevious } from './use-previous';
import { Settings } from '../utils/settings';

export type Options<S> = {
  storage: Storage,
  serializer: { stringify: (value: S) => string, parse: (serialized: string) => S },
  cleanup: boolean,
  follow: boolean,
  clearOnParsingError: boolean,
};

const getOptions = createGetOptions(
  Settings.defaults.options.persistentState,
) as <S>(providedOptions?: Partial<Options<S>>) => Unfilled<Options<S>, 'storage'>;

/**
 * A convenience wrapper for {@link React.useState} that lets you keep data in a persistent browser storage.
 *
 * @version 2.0.0
 * @see https://github.com/TheGreenBeaver/AnyFish#usepersistentstate
 */
export const usePersistentState = <S>(
  initialValue: Usable<S>,
  key: string,
  options?: Partial<Options<S>>,
): SetStateResult<S> => {
  const {
    storage: providedStorage,
    serializer,
    cleanup,
    follow,
    clearOnParsingError,
  } = getOptions<S>(options);

  const storage = providedStorage ?? (typeof localStorage === 'undefined' ? undefined : localStorage);

  const prevStorage = usePrevious(storage);
  const prevKey = usePrevious(key);

  const getStoredValue = useCallback((fallback: Usable<S>) => {
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
  }, [clearOnParsingError, storage, key, serializer]);

  const [value, setValue] = useState<S>(() => getStoredValue(initialValue));

  const storeValue = useCallback((currentValue: S) => {
    if (!storage) {
      return;
    }

    try {
      storage.setItem(key, serializer.stringify(currentValue));
    } catch (e) {
      devConsole.error(`Failed to store the current value of usePersistentState at ${key}\n`, e);
    }
  }, [storage, key, serializer]);

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => storeValue(value), [value]);

  useEffect(() => {
    if (cleanup) {
      prevStorage?.removeItem(prevKey);
    }

    if (follow || !prevStorage && storage) {
      setValue(getStoredValue);
    } else {
      storeValue(value);
    }
  }, [key, serializer, storage]);
  /* eslint-enable react-hooks/exhaustive-deps */

  return [value, setValue];
};