import type { StringMapToUnion, Nullable, Optional } from '../utils/types';
import type { MutableRefObject, RefCallback } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import isFunction from 'lodash/isFunction';
import isString from 'lodash/isString';
import pick from 'lodash/pick';
import throttle from 'lodash/throttle';
import { devConsole } from '../utils/misc';

export type Dimensions = { width: number, height: number };

type OriginalRef<T extends Element> = MutableRefObject<Nullable<T>> | RefCallback<T>;
export type Options<T extends Element> = Partial<{
  originalRef: OriginalRef<T>,
  throttle: number,
}>;

type ExtractHandlerNames<Target> =
  StringMapToUnion<{
    [Attr in keyof Target]: Attr extends `on${string}` ? (
      NonNullable<Target[Attr]> extends (ev: Event) => unknown ? Attr : never
    ) : never
  }>;
type ExtractEventName<HandlerName> = HandlerName extends `on${infer EventName}` ? EventName : never;
type ElementByKind = {
  image: HTMLImageElement,
  video: HTMLVideoElement,
};
type MeasuringLogic<Target> = {
  create: () => Target,
  eventName: ExtractEventName<ExtractHandlerNames<Target>>,
};

const configs: { [Kind in useDimensions.MediaKind]: MeasuringLogic<ElementByKind[Kind]> } = {
  video: {
    create: () => document.createElement('video'),
    eventName: 'loadedmetadata',
  },
  image: {
    create: () => new Image(),
    eventName: 'load',
  },
};

const keys = ['width', 'height'] as const;

/**
 * Calculates the dimensions of a visual media object by its source.
 *
 * @version 1.0.0
 * @see https://github.com/TheGreenBeaver/AnyFish#usedimensions
 */
export function useDimensions(src: string, mediaKind?: useDimensions.MediaKind): Nullable<Dimensions>;
/**
 * Returns a callback ref to pass to a DOM element and calculates the dimensions of that element.
 *
 * @version 1.2.0
 * @see https://github.com/TheGreenBeaver/AnyFish#usedimensions
 */
export function useDimensions<T extends Element>(options?: Options<T>): [Nullable<Dimensions>, RefCallback<T>];
export function useDimensions<T extends Element>(
  firstArg?: string | Options<T>,
  secondArg?: useDimensions.MediaKind,
) {
  const [dimensions, setDimensions] = useState<Nullable<Dimensions>>(null);
  const elementRef = useRef<Optional<T>>(undefined);

  const isMedia = isString(firstArg);
  const originalRef = isMedia ? undefined : firstArg?.originalRef;
  const throttleDelay = isMedia ? undefined : firstArg?.throttle;
  const src = isMedia ? firstArg : undefined;
  const mediaKind = isMedia ? secondArg || useDimensions.MediaKind.Image : undefined;

  const enhancedSetDimensions = useMemo(() => throttleDelay == null
    ? setDimensions
    : throttle(setDimensions, throttleDelay),
  [throttleDelay]);

  const resizeObserver = useMemo(() => new ResizeObserver((entries, observer) => {
    let elementIsObserved = false;

    entries.forEach(entry => {
      if (elementIsObserved || entry.target !== elementRef.current) {
        observer.unobserve(entry.target);
      } else {
        enhancedSetDimensions(pick(entry.contentRect, keys));
        elementIsObserved = true;
      }
    });
  }), [enhancedSetDimensions]);

  useEffect(() => {
    const element = elementRef.current;

    if (element) {
      resizeObserver.observe(element);
    }

    return () => resizeObserver.disconnect();
  }, [resizeObserver]);

  useEffect(() => {
    const measure = async () => {
      if (mediaKind != null && src != null) {
        setDimensions(null);
        const { create, eventName } = configs[mediaKind];

        const measurable = create();
        try {
          const newDimensions = await new Promise<Dimensions>((resolve, reject) => {
            measurable.addEventListener(eventName, () => resolve(pick(measurable, keys)));
            measurable.addEventListener('error', reject);
            measurable.src = src;
          });

          setDimensions(newDimensions);
        } catch (e) {
          devConsole.error(`Failed to load media at ${src}`);
        }
        measurable.remove();
      }
    };

    measure();
  }, [src, mediaKind]);

  const dimensionsTracker: RefCallback<T> = useCallback(instance => {
    if (originalRef) {
      if (isFunction(originalRef)) {
        originalRef(instance);
      } else {
        originalRef.current = instance;
      }
    }

    if (instance) {
      elementRef.current = instance;
      resizeObserver.observe(instance);
    } else {
      setDimensions(null);
      const element = elementRef.current;

      if (element) {
        resizeObserver.unobserve(element);
        elementRef.current = undefined;
      }
    }
  }, [originalRef, resizeObserver]);

  return isMedia ? dimensions : [dimensions, dimensionsTracker];
}

export namespace useDimensions {
  export enum MediaKind {
    Image = 'image',
    Video = 'video',
  }
}