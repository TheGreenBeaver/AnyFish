import type { KeymapToUnion, Nullable } from '../utils/types';
import type { MutableRefObject, RefCallback } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { isFunction, isString, pick } from '../utils/misc';

type MediaKind = 'video' | 'image';
type Dimensions = { width: number, height: number };
type OriginalRef<T extends Element> = MutableRefObject<Nullable<T>> | RefCallback<T>;
/* eslint-disable @typescript-eslint/indent */
type ExtractHandlerNames<Target> = Exclude<
  keyof Target,
  KeymapToUnion<{
    [Attr in keyof Target]: Attr extends `on${string}` ? (
      NonNullable<Target[Attr]> extends (ev: Event) => unknown ? never : Attr
    ) : Attr
  }>
>;
/* eslint-enable */
type ExtractEventName<HandlerName> = HandlerName extends `on${infer EventName}` ? EventName : never;
type ElementByKind = {
  image: HTMLImageElement,
  video: HTMLVideoElement,
};
type MeasuringLogic<Target> = {
  create: () => Target,
  eventName: ExtractEventName<ExtractHandlerNames<Target>>,
};

const configs: { [Kind in MediaKind]: MeasuringLogic<ElementByKind[Kind]> } = {
  video: {
    create: () => document.createElement('video'),
    eventName: 'loadedmetadata',
  },
  image: {
    create: () => new Image(),
    eventName: 'load',
  },
};

const keys = ['width', 'height'];

function useDimensions(src: string, mediaKind?: MediaKind): Nullable<Dimensions>;
function useDimensions<T extends Element>(originalRef?: OriginalRef<T>): [Nullable<Dimensions>, RefCallback<T>];
function useDimensions<T extends Element>(
  firstArg?: string | OriginalRef<T>,
  secondArg?: MediaKind,
) {
  const [dimensions, setDimensions] = useState<Nullable<Dimensions>>(null);

  const isMedia = isString(firstArg);
  const originalRef = isMedia ? undefined : firstArg;
  const src = isMedia ? firstArg : undefined;
  const mediaKind = isMedia ? secondArg || 'image' : undefined;

  useEffect(() => {
    const measure = async () => {
      if (mediaKind != null && src != null) {
        setDimensions(null);
        const { create, eventName } = configs[mediaKind];

        const measurable = create();
        const newDimensions = await new Promise<Dimensions>(resolve => {
          measurable.addEventListener(eventName, () => resolve(pick(measurable, keys)));
          measurable.src = src;
        });
        measurable.remove();

        setDimensions(newDimensions);
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

    setDimensions(instance ? pick(instance.getBoundingClientRect(), keys) : null);
  }, [originalRef]);

  return isMedia ? dimensions : [dimensions, dimensionsTracker];
}

export default useDimensions;