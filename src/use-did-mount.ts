import { useEffect } from 'react';
import { devConsole } from '../utils/misc';

const cleanupWarning =
  'The effect passed to useDidMount returned with a non-empty value. ' +
  'If your effect needs cleanup, consider using plain useEffect: ' +
  'https://reactjs.org/docs/hooks-reference.html#useeffect';

/**
 * Executes the effect after the initial render.
 *
 * The return value of the effect is ignored. Use plain {@link React.useEffect} for effects that need cleanup.
 *
 * @version 1.0.0
 * @see https://github.com/TheGreenBeaver/AnyFish#usedidmount
 */
export const useDidMount = (effect: () => unknown): void => useEffect(() => {
  const cleanup = effect();

  if (cleanup !== undefined) {
    devConsole.warn(cleanupWarning);
  }
// eslint-disable-next-line react-hooks/exhaustive-deps
}, []);