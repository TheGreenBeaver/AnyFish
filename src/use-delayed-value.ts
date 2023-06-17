import { useCallback } from 'react';
import throttle from 'lodash/throttle';
import debounce from 'lodash/debounce';
import { createGetOptions } from '../utils/misc';
import type { Optional, SetState, Usable } from '../utils/types';
import { useMountedState } from './use-mounted-state';
import type { DebouncedFunc } from 'lodash';
import { Settings } from '../utils/settings';

const delayFunctions = {
  throttle,
  debounce,
} as const;

type DelayFnName = keyof typeof delayFunctions;
export type HookResult<T> = [T, DebouncedFunc<SetState<T>>, SetState<T>];

export type Options = {
  delay: number,
  delayFn: DelayFnName,
};

const defaultOptions: Options = {
  delay: Settings.defaults.delay,
  ...Settings.defaults.options.delayedValue,
};

const getOptions = createGetOptions(defaultOptions);

/**
 * A convenience wrapper for {@link React.useState} that lets you
 * {@link https://css-tricks.com/debouncing-throttling-explained-examples/|debounce or throttle} value updates.
 *
 * @version 2.0.0
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
 * @version 2.0.0
 * @see https://github.com/TheGreenBeaver/AnyFish#usedelayedvalue
 */
export function useDelayedValue<T = undefined>(): HookResult<Optional<T>>;
export function useDelayedValue <T>(
  initialState?: Usable<T>,
  options?: Partial<Options>,
) {
  const { delay, delayFn } = getOptions(options);

  const [value, setValue] = useMountedState(initialState);

  const setDelayedValue = useCallback((delayFunctions[delayFn])(setValue, delay), [delayFn, delay, setValue]);

  return [value, setDelayedValue, setValue];
}