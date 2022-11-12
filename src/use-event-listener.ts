import type { RefObject } from 'react';
import { useCallback, useEffect, useMemo } from 'react';
import { isFunction, isObject, isString } from '../utils/misc';

type Target = EventTarget | RefObject<EventTarget>;
type Options = AddEventListenerOptions | boolean;
type ManyListeners = EventListenerOrEventListenerObject[];
type WindowListener<KnownName extends keyof WindowEventMap> = (this: Window, ev: WindowEventMap[KnownName]) => void;

const isOptions = (v: unknown): v is Options =>
  isObject(v)
  && ['capture', 'once', 'passive', 'signal'].some(field => field in v);
const isListener = (v: unknown): v is EventListenerOrEventListenerObject =>
  isFunction(v) ||
  (isObject(v) && 'handleEvent' in v);

function useEventListener (
  targetPointer: Target,
  eventName: string,
  options: Options,
  ...eventListeners: ManyListeners
): void;
function useEventListener (
  targetPointer: Target,
  eventName: string,
  eventListener: EventListenerOrEventListenerObject,
  options: Options,
): void;
function useEventListener (
  targetPointer: Target,
  eventName: string,
  ...eventListeners: ManyListeners
): void;

function useEventListener (
  eventName: string,
  options: Options,
  ...eventListeners: ManyListeners
): void;
function useEventListener (
  eventName: string,
  eventListener: EventListenerOrEventListenerObject,
  options: Options,
): void;
function useEventListener (
  eventName: string,
  ...eventListeners: ManyListeners
): void;

function useEventListener<KnownName extends keyof WindowEventMap> (
  eventName: KnownName,
  options: Options,
  ...eventListeners: WindowListener<KnownName>[]
): void;
function useEventListener<KnownName extends keyof WindowEventMap> (
  eventName: KnownName,
  eventListener: WindowListener<KnownName>,
  options: Options,
): void;
function useEventListener<KnownName extends keyof WindowEventMap> (
  eventName: KnownName,
  ...eventListeners: WindowListener<KnownName>[]
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
    const currentTarget = 'current' in targetAccessor ? targetAccessor.current : targetAccessor;
    currentTarget?.addEventListener(eventName, combinedEventListener, options);

    return () => {
      currentTarget?.removeEventListener(eventName, combinedEventListener, options);
    };
  }, [targetAccessor, eventName, combinedEventListener, options]);
}

export default useEventListener;