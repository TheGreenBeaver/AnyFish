import { useCallback, useState } from 'react';
import type { SetState, Usable } from '../utils/types';

/**
 * A convenience wrapper for {@link React.useState} to manage boolean flags.
 *
 * @version 1.3.0
 * @see https://github.com/TheGreenBeaver/AnyFish#useboolean
 */
export const useBoolean = (
  initialValue: Usable<boolean> = false,
): [boolean, VoidFunction, VoidFunction, VoidFunction, SetState<boolean>] => {
  const [value, setValue] = useState(initialValue);

  const switchToTrue = useCallback(() => setValue(true), []);
  const switchToFalse = useCallback(() => setValue(false), []);
  const toggle = useCallback(() => setValue(curr => !curr), []);

  return [value, switchToTrue, switchToFalse, toggle, setValue];
};