import type { Unfilled, Usable } from './types';
import type { Options as UseDelayedValueOptions } from '../src/use-delayed-value';
import type { Options as UseMediaQueryOptions } from '../src/use-media-query';
import type { Options as UsePersistentStateOptions } from '../src/use-persistent-state';
import type { Options as UseUpdateOptions } from '../src/use-update';
import isEqual from 'lodash/isEqual';

export type SettingsType = {
  isDev: Usable<boolean>,
  allowConsole: Usable<boolean, [keyof Console]>,

  defaults: {
    delay: number,
    isEqual: <T>(a: T, b: T) => boolean,

    options: {
      delayedValue: Unfilled<UseDelayedValueOptions, 'delay'>,
      mediaQuery: Unfilled<UseMediaQueryOptions, 'throttle'>,
      persistentState: Unfilled<UsePersistentStateOptions<unknown>, 'storage'>,
      update: UseUpdateOptions,
    },
  },
};

const defaultIsDev: SettingsType['isDev'] = () => process.env.NODE_ENV === 'development';

export const Settings: SettingsType = {
  isDev: defaultIsDev,
  allowConsole: defaultIsDev,

  defaults: {
    delay: 300,
    isEqual,

    options: {
      delayedValue: { delayFn: 'debounce' },
      mediaQuery: { track: true },
      persistentState: {
        serializer: {
          stringify: value => JSON.stringify({ value }),
          parse: serialized => JSON.parse(serialized).value,
        },
        cleanup: true,
        follow: false,
        clearOnParsingError: true,
      },
      update: { nthUpdate: 1, withCleanup: true, once: false, isInStrictMode: true },
    },
  },
};