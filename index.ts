export { default as useDidMount } from './src/use-did-mount';
export { default as useDimensions } from './src/use-dimensions';
export { default as useEventListener } from './src/use-event-listener';
export { default as useIsMounted } from './src/use-is-mounted';
export { default as useMountedState } from './src/use-mounted-state';
export { default as usePersistentState } from './src/use-persistent-state';
export { default as usePromise } from './src/use-promise';
export { default as useReRenderTrigger } from './src/use-re-render-trigger';
export { default as useRenderCount } from './src/use-render-count';
export { default as useUpdate } from './src/use-update';
export { default as useWillUnmount } from './src/use-will-unmount';

export type { Dimensions, Options as UseDimensionsOptions } from './src/use-dimensions';
export type { Target as ListenerTarget } from './src/use-event-listener';
export type { Options as UsePromiseOptions, HookResult as UsePromiseResult } from './src/use-promise';
export type { Options as UseUpdateOptions } from './src/use-update';

export { Settings } from './utils/settings';
export type { SettingsType } from './utils/settings';