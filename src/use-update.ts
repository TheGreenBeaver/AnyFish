import type { EffectCallback } from 'react';
import { useCallback, useEffect, useRef } from 'react';
import isFunction from 'lodash/isFunction';
import { createGetOptions } from '../utils/misc';

export type Options = {
  nthUpdate: number,
  withCleanup: boolean,
  once: boolean,
};

const getOptions = createGetOptions<Options>({ nthUpdate: 1, withCleanup: true, once: false });

/**
 * A convenience wrapper for {@link React.useEffect} when the first N `deps` updates should not trigger the effect.
 *
 * @version 1.0.0
 * @see https://github.com/TheGreenBeaver/AnyFish#useupdate
 */
export const useUpdate = (
  effect: EffectCallback,
  deps: unknown[],
  options?: Partial<Options>,
): (overrideOptions?: Partial<Options>) => void => {
  const currentOptionsRef = useRef(getOptions(options));
  const updateCountRef = useRef(options?.nthUpdate ?? 1);

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

    return;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return useCallback(overrideOptions => {
    updateCountRef.current = overrideOptions?.nthUpdate ?? currentOptionsRef.current.nthUpdate;
    currentOptionsRef.current = getOptions(overrideOptions);
  }, []);
};