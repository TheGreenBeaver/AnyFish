import type { SetState, Usable } from '../utils/types';
import { useCallback, useEffect, useRef, useState } from 'react';
import { use } from '../utils/misc';

type ExternalControls<T> = Partial<{
  value: T,
  setValue: (newValue: T) => void,
}>;

const PIN = Symbol('pin');

/**
 * A hook to manage state of components that allow both controlled and uncontrolled behaviour.
 *
 * @version 2.1.0
 * @see https://github.com/TheGreenBeaver/AnyFish#usesnapshotstate
 */
export const useSnapshotState = <T>(
  initialValue: Usable<T>,
  externalControls?: ExternalControls<T>,
  isValueValid = (v => v !== undefined) as (v: T | undefined) => v is T,
): [T, SetState<T>] => {
  const v = externalControls?.value;
  const externalValue = isValueValid(v) ? v : PIN;
  const setExternalValue = externalControls?.setValue;

  const getDefaultValue = () => externalValue === PIN ? use(initialValue) : externalValue;
  const snapshotRef = useRef(getDefaultValue());
  const [internalValue, setInternalValue] = useState(getDefaultValue);

  const applyUpdate = useCallback((newValue: T) => {
    setInternalValue(newValue);
    snapshotRef.current = newValue;
  }, []);

  useEffect(() => {
    if (externalValue !== PIN) {
      applyUpdate(externalValue);
    }
  }, [applyUpdate, externalValue]);

  const setValue = useCallback<SetState<T>>(update => {
    const snapshot = snapshotRef.current;
    const newValue = use(update, snapshot);

    applyUpdate(newValue);
    setExternalValue?.(newValue);
  }, [applyUpdate, setExternalValue]);

  const value = externalValue === PIN ? internalValue : externalValue;

  return [value, setValue];
};