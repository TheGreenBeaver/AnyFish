import { useCallback } from 'react';
import throttle from 'lodash/throttle';
import debounce from 'lodash/debounce';
import { createGetOptions } from '../utils/misc';
import type { SetState, Usable } from '../utils/types';
import { useMountedState } from './use-mounted-state';

const delayFunctions = {
  throttle,
  debounce,
} as const;

type DelayFnName = keyof typeof delayFunctions;
export type HookResult<T> = [T, SetState<T>, SetState<T>];

export type Options = {
  delay: number,
  delayFn: DelayFnName,
};

const getOptions = createGetOptions<Options>({ delay: 300, delayFn: 'debounce' });

/**
 * A convenience wrapper for {@link React.useState} that lets you
 * {@link https://css-tricks.com/debouncing-throttling-explained-examples/|debounce or throttle} value updates.
 *
 * @version 1.3.0
 * @see https://github.com/TheGreenBeaver/AnyFish#usedelayedvalue
 */
export function useDelayedValue<T>(
  initialState: Usable<T>,
  options?: Partial<Options>,
): HookResult<T>;
/**
 * A convenience wrapper for {@link React.useState} that lets you
 * {@link https://css-tricks.com/debouncing-throttling-explained-examples/|debounce or throttle} value updates.
 *
 * @version 1.3.0
 * @see https://github.com/TheGreenBeaver/AnyFish#usedelayedvalue
 */
export function useDelayedValue<T = undefined>(): HookResult<T | undefined>;
export function useDelayedValue <T>(
  initialState?: Usable<T>,
  options?: Partial<Options>,
) {
  const { delay, delayFn } = getOptions(options);

  const [value, setValue] = useMountedState(initialState);

  const setDelayedValue = useCallback((delayFunctions[delayFn])(setValue, delay), [delayFn, delay, setValue]);

  return [value, setDelayedValue, setValue];
}