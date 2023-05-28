import { useEffect, useState } from 'react';
import { createGetOptions } from '../utils/misc';
import isString from 'lodash/isString';
import mapValues from 'lodash/mapValues';

export type Options = {
  track: boolean,
};

type ChangeListener = (changeEvent: MediaQueryListEvent) => void;

const getOptions = createGetOptions({ track: true });

/**
 * Checks if window matches provided media query.
 *
 * @version 1.3.0
 * @see https://github.com/TheGreenBeaver/AnyFish#usemediaquery
 */
export function useMediaQuery(mediaQuerySource: string, options?: Partial<Options>): boolean;
/**
 * Checks if window matches each of the provided media queries.
 *
 * @version 1.3.0
 * @see https://github.com/TheGreenBeaver/AnyFish#usemediaquery
 */
export function useMediaQuery<Keys extends string>(
  mediaQuerySource: Record<Keys, string>,
  options?: Partial<Options>,
): Record<Keys, boolean>;
export function useMediaQuery<Keys extends string>(
  mediaQuerySource: string | Record<Keys, string>,
  options?: Partial<Options>,
) {
  const { track } = getOptions(options);

  const [matchesQuery, setMatchesQuery] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    return isString(mediaQuerySource)
      ? window.matchMedia(mediaQuerySource).matches
      : mapValues(mediaQuerySource, queryString => window.matchMedia(queryString).matches);
  });

  useEffect(() => {
    if (isString(mediaQuerySource)) {
      const mediaQueryList = window.matchMedia(mediaQuerySource);
      setMatchesQuery(mediaQueryList.matches);

      if (track) {
        const changeListener: ChangeListener = changeEvent => setMatchesQuery(changeEvent.matches);
        mediaQueryList.addEventListener('change', changeListener);

        return () => mediaQueryList.removeEventListener('change', changeListener);
      }
    } else {
      const mediaQueryListMap = mapValues(mediaQuerySource, queryString => window.matchMedia(queryString));
      setMatchesQuery(mapValues(mediaQueryListMap, mediaQueryList => mediaQueryList.matches));

      if (track) {
        const changeEventListeners = mapValues(mediaQueryListMap, (mediaQueryList, key) => {
          const changeListener: ChangeListener = changeEvent => setMatchesQuery(
            (curr: Record<Keys, boolean>) => ({ ...curr, [key]: changeEvent.matches }),
          );

          mediaQueryList.addEventListener('change', changeListener);

          return changeListener;
        });

        return () => Object
          .entries(changeEventListeners)
          .forEach(([key, changeListener]: [Keys, ChangeListener]) =>
            mediaQueryListMap[key].removeEventListener('change', changeListener),
          );
      }
    }

    return undefined;
  }, [mediaQuerySource, track]);

  return matchesQuery;
}