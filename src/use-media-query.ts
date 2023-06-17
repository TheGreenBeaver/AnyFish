import { useEffect } from 'react';
import { createGetOptions } from '../utils/misc';
import isString from 'lodash/isString';
import mapValues from 'lodash/mapValues';
import { Settings } from '../utils/settings';
import throttle from 'lodash/throttle';
import { useMountedState } from './use-mounted-state';

export type Options = {
  track: boolean,
  throttle: number,
};

type ChangeListener = (changeEvent: MediaQueryListEvent) => void;

const defaultOptions: Options = {
  throttle: Settings.defaults.delay,
  ...Settings.defaults.options.mediaQuery,
};

const getOptions = createGetOptions(defaultOptions);

/**
 * Checks if window matches provided media query.
 *
 * @version 2.0.0
 * @see https://github.com/TheGreenBeaver/AnyFish#usemediaquery
 */
export function useMediaQuery(mediaQuerySource: string, options?: Partial<Options>): boolean;
/**
 * Checks if window matches each of the provided media queries.
 *
 * @version 2.0.0
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
  const { track, throttle: throttleDelay } = getOptions(options);

  const [matchesQuery, setMatchesQuery] = useMountedState(() => {
    const isSingleQuery = isString(mediaQuerySource);

    if (typeof window === 'undefined') {
      return isSingleQuery ? false : mapValues(mediaQuerySource, () => false);
    }

    return isSingleQuery
      ? window.matchMedia(mediaQuerySource).matches
      : mapValues(mediaQuerySource, queryString => window.matchMedia(queryString).matches);
  });

  useEffect(() => {
    if (isString(mediaQuerySource)) {
      const mediaQueryList = window.matchMedia(mediaQuerySource);
      setMatchesQuery(mediaQueryList.matches);

      if (track) {
        const changeListenerBody: ChangeListener = changeEvent => setMatchesQuery(changeEvent.matches);
        const changeListener = throttleDelay ? throttle(changeListenerBody, throttleDelay) : changeListenerBody;
        mediaQueryList.addEventListener('change', changeListener);

        return () => mediaQueryList.removeEventListener('change', changeListener);
      }
    } else {
      const mediaQueryListMap = mapValues(mediaQuerySource, queryString => window.matchMedia(queryString));
      setMatchesQuery(mapValues(mediaQueryListMap, mediaQueryList => mediaQueryList.matches));

      if (track) {
        const changeEventListeners = mapValues(mediaQueryListMap, (mediaQueryList, key) => {
          const changeListenerBody: ChangeListener = changeEvent => setMatchesQuery(
            (curr: Record<Keys, boolean>) => ({ ...curr, [key]: changeEvent.matches }),
          );
          const changeListener = throttleDelay ? throttle(changeListenerBody, throttleDelay) : changeListenerBody;

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
  }, [mediaQuerySource, setMatchesQuery, throttleDelay, track]);

  return matchesQuery;
}