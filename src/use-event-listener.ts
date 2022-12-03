import type { RefObject } from 'react';
import { useCallback, useEffect, useMemo } from 'react';
import { isObjectWithKey } from '../utils/misc';
import isFunction from 'lodash/isFunction';
import isPlainObject from 'lodash/isPlainObject';
import isString from 'lodash/isString';
import isBool from 'lodash/isBoolean';

export type Target = EventTarget | RefObject<EventTarget>;
type Options = AddEventListenerOptions | boolean;
type ManyListeners = EventListenerOrEventListenerObject[];

const boolKeys = ['capture', 'once', 'passive'];
const optionsKeys = [...boolKeys, 'signal'];
const isOptions = (v: unknown): v is Options => {
  if (isBool(v)) {
    return true;
  }

  if (!isPlainObject(v) || Object.keys(v).some(key => !optionsKeys.includes(key))) {
    return false;
  }

  for (const boolKey of boolKeys) {
    if (v[boolKey] !== undefined && !isBool(v[boolKey])) {
      return false;
    }
  }

  return v.signal === undefined || v.signal instanceof AbortSignal;
};

const isListener = (v: unknown): v is EventListenerOrEventListenerObject =>
  isFunction(v) || isObjectWithKey(v, 'handleEvent') && isFunction(v.handleEvent);

/**
 * Adds the provided listeners to the target and performs automatic cleanup.
 *
 * @version 1.0.0
 * @see https://github.com/TheGreenBeaver/AnyFish#useeventlistener
 */
function useEventListener (
  targetPointer: Target,
  eventName: string,
  options: Options,
  ...eventListeners: ManyListeners
): void;
/**
 * Adds the provided listener to the target and performs automatic cleanup.
 *
 * @version 1.0.0
 * @see https://github.com/TheGreenBeaver/AnyFish#useeventlistener
 */
function useEventListener (
  targetPointer: Target,
  eventName: string,
  eventListener: EventListenerOrEventListenerObject,
  options: Options,
): void;
/**
 * Adds the provided listeners to the target and performs automatic cleanup.
 *
 * @version 1.0.0
 * @see https://github.com/TheGreenBeaver/AnyFish#useeventlistener
 */
function useEventListener (
  targetPointer: Target,
  eventName: string,
  ...eventListeners: ManyListeners
): void;

/**
 * Adds the provided listeners to window and performs automatic cleanup.
 *
 * @version 1.0.0
 * @see https://github.com/TheGreenBeaver/AnyFish#useeventlistener
 */
function useEventListener (
  eventName: string,
  options: Options,
  ...eventListeners: ManyListeners
): void;
/**
 * Adds the provided listener to window and performs automatic cleanup.
 *
 * @version 1.0.0
 * @see https://github.com/TheGreenBeaver/AnyFish#useeventlistener
 */
function useEventListener (
  eventName: string,
  eventListener: EventListenerOrEventListenerObject,
  options: Options,
): void;
/**
 * Adds the provided listeners to window and performs automatic cleanup.
 *
 * @version 1.0.0
 * @see https://github.com/TheGreenBeaver/AnyFish#useeventlistener
 */
function useEventListener (
  eventName: string,
  ...eventListeners: ManyListeners
): void;

function useEventListener (
  firstArg: Target | string,
  secondArg: string | Options | EventListenerOrEventListenerObject,
  thirdArg?: Options | EventListenerOrEventListenerObject,
  fourthArg?: Options | EventListenerOrEventListenerObject,
  ...rest: ManyListeners
) {
  const targetAccessor = useMemo(() => isString(firstArg) ? window : firstArg, [firstArg]);
  const eventName = useMemo(() => [firstArg, secondArg].find(isString) as string, [firstArg, secondArg]);
  const options = useMemo(() => [secondArg, thirdArg, fourthArg].find(isOptions), [secondArg, thirdArg, fourthArg]);

  const combinedEventListener = useCallback((e: Event) => {
    const eventListeners = [secondArg, thirdArg, fourthArg, ...rest].filter(isListener);
    eventListeners.forEach(listener => isFunction(listener) ? listener(e) : listener.handleEvent(e));
  }, [secondArg, thirdArg, fourthArg, rest]);

  useEffect(() => {
    const currentTarget = isObjectWithKey(targetAccessor, 'current', false) ? targetAccessor.current : targetAccessor;
    currentTarget?.addEventListener(eventName, combinedEventListener, options);

    return () => currentTarget?.removeEventListener(eventName, combinedEventListener, options);
  }, [targetAccessor, eventName, combinedEventListener, options]);
}

export default useEventListener;