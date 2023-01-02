import type { EffectCallback } from 'react';
import { createGetOptions } from '../utils/misc';
import isEqual from 'lodash/isEqual';
import { useEffect, useRef } from 'react';
import type { Optional } from '../utils/types';

export type Options<Deps extends unknown[]> = {
  compare: (prev: Deps, curr: Deps) => boolean,
};

const getOptions = createGetOptions({ compare: isEqual });

/**
 * A convenience wrapper for {@link React.useEffect} that only triggers the `effect` when `deps` deeply change.
 *
 * @version 1.1.0
 * @see https://github.com/TheGreenBeaver/AnyFish#useselectiveeffect
 */
export const useSelectiveEffect = <Deps extends unknown[]>(
  effect: EffectCallback,
  deps: Deps,
  options?: Options<Deps>,
) => {
  const { compare } = getOptions(options);

  const prevDepsRef = useRef<Optional<Deps>>(undefined);

  useEffect(() => {
    if (prevDepsRef.current == null || !compare(prevDepsRef.current, deps)) {
      prevDepsRef.current = deps;
      return effect();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
};