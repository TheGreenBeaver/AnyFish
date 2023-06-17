import type { StringMap, MapKey, Usable } from './types';
import isFunction from 'lodash/isFunction';
import isPlainObject from 'lodash/isPlainObject';
import isObject from 'lodash/isObject';
import mapValues from 'lodash/mapValues';
import defaults from 'lodash/defaults';
import memoize from 'lodash/memoize';
import isEqual from 'lodash/isEqual';
import { Settings } from './settings';

export function isObjectWithKey<Key extends MapKey>(
  v: unknown, key: Key, plain: false,
): v is Record<Key, unknown> & object;
export function isObjectWithKey<Key extends MapKey>(
  v: unknown, key: Key, plain?: true
): v is Record<Key, unknown> & StringMap;
export function isObjectWithKey<Key extends MapKey>(
  v: unknown, key: Key, plain?: boolean,
) {
  const typeCheck = plain ? isPlainObject : isObject;

  return typeCheck(v) && key in v;
}

export const use = <T, Args extends unknown[] = []>(factory: Usable<T, Args>, ...args: Args): T =>
  isFunction(factory) ? factory(...args) : factory;

export const devConsole = mapValues(console, (method, methodName) => isFunction(method)
  ? (...args: Parameters<typeof method>) => {
    if (use(Settings.allowConsole, methodName)) {
      method(...args);
    }
  }
  : method,
) as Console;

type GetOptions<Options> = (providedOptions?: Partial<Options>) => Options;

export const createGetOptions = <Options>(defaultOptions: Options): GetOptions<Options> => {
  let prevOptions: Options;

  return memoize(providedOptions => {
    const options = defaults({}, providedOptions, defaultOptions);

    if (!isEqual(options, prevOptions)) {
      prevOptions = options;
    }

    return prevOptions;
  });
};