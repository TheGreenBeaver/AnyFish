import type { EffectCallback } from 'react';
import { useCallback, useEffect, useRef } from 'react';
import isFunction from 'lodash/isFunction';
import { createGetOptions } from '../utils/misc';
import { Settings } from '../utils/settings';

export type Options = {
  nthUpdate: number,
  withCleanup: boolean,
  once: boolean,
  isInStrictMode: boolean,
};

const getOptions = createGetOptions<Options>(Settings.defaults.options.update);

const getInitialUpdateCount = (options: Options): number => {
  const extraRender = options.isInStrictMode && process.env.NODE_ENV !== 'production';

  return (options?.nthUpdate ?? 1) + +extraRender;
};

/**
 * A convenience wrapper for {@link React.useEffect} when the first N `deps` updates should not trigger the effect.
 *
 * @version 2.0.0
 * @see https://github.com/TheGreenBeaver/AnyFish#useupdate
 */
export const useUpdate = (
  effect: EffectCallback,
  deps: unknown[],
  options?: Partial<Options>,
): (overrideOptions?: Partial<Options>) => void => {
  const fullOptions = getOptions(options);
  const currentOptionsRef = useRef(fullOptions);
  const updateCountRef = useRef(getInitialUpdateCount(fullOptions));

  useEffect(() => {
    const shouldExecute = currentOptionsRef.current.once
      ? updateCountRef.current-- === 0
      : updateCountRef.current-- <= 0;

    if (shouldExecute) {
      const cleanup = effect();

      if (currentOptionsRef.current.withCleanup && isFunction(cleanup)) {
        return cleanup;
      }
    }

    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return useCallback(overrideOptions => {
    updateCountRef.current = overrideOptions?.nthUpdate ?? currentOptionsRef.current.nthUpdate;
    currentOptionsRef.current = getOptions(overrideOptions);
  }, []);
};