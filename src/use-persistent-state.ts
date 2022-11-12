import type { Dispatch, SetStateAction} from 'react';
import { useCallback, useState } from 'react';
import { use } from '../utils/misc';
import type { Usable } from '../utils/types';

type Options<S> = {
  storage: Storage,
  serializer: { stringify: (value: S) => string, parse: (serialized: string) => S },
};

const getDefaultOptions = <S>(): Options<S> => ({
  storage: localStorage,
  serializer: JSON,
});

const usePersistentState = <S>(
  initializer: Usable<S>,
  key: string,
  options?: Partial<Options<S>>,
): [S, Dispatch<SetStateAction<S>>] => {
  const { storage, serializer } = { ...getDefaultOptions<S>(), ...options };

  const [value, setValue] = useState<S>(() => {
    const storedData = storage.getItem(key);

    if (storedData != null) {
      return serializer.parse(storedData);
    }

    return use(initializer);
  });

  const setPersistentValue: Dispatch<SetStateAction<S>> = useCallback(update => setValue(curr => {
    const newValue = use(update, curr);
    storage.setItem(key, serializer.stringify(newValue));

    return newValue;
  }), [key, serializer, storage]);

  return [value, setPersistentValue];
};

export default usePersistentState;