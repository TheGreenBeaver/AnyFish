export { useDidMount } from './src/use-did-mount';
export { useDimensions } from './src/use-dimensions';
export { useEventListener } from './src/use-event-listener';
export { useIsMounted } from './src/use-is-mounted';
export { useMountedState } from './src/use-mounted-state';
export { usePersistentState } from './src/use-persistent-state';
export { usePromise } from './src/use-promise';
export { useReRenderTrigger } from './src/use-re-render-trigger';
export { useRenderCount } from './src/use-render-count';
export { useSelectiveEffect } from './src/use-selective-effect';
export { useUpdate } from './src/use-update';
export { useWillUnmount } from './src/use-will-unmount';

export type { Dimensions, Options as UseDimensionsOptions } from './src/use-dimensions';
export type { Target as ListenerTarget } from './src/use-event-listener';
export type { Options as UsePromiseOptions, HookResult as UsePromiseResult } from './src/use-promise';
export type { Options as UseSelectiveEffectOptions } from './src/use-selective-effect';
export type { Options as UseUpdateOptions } from './src/use-update';

export { Settings } from './utils/settings';
export type { SettingsType } from './utils/settings';