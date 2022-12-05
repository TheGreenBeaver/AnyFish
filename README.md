# AnyFish

Utility React Hooks for any purpose. _There is a Hook for Any Fish._

**Installation**

`yarn add any-fish`  
`npm install any-fish`

**TypeScript usage**

The package is written in TypeScript, so no additional @types packages are needed.

## useDidMount

### Call signature

`(effect) => void`

### Description

Executes the effect after the initial render.

### Arguments

- **effect**: `() => void` - The effect to execute. The return value is ignored. Use
  plain [useEffect](https://reactjs.org/docs/hooks-reference.html#useeffect) for effects that need cleanup.

## useDimensions

### Call signatures

1. `(src, mediaKind) => Dimensions | null`: Calculates the dimensions of a visual media object by its source.
    - **src**: `string` - The media object source, same as the one passed to `<img />` or `<video />`.
    - **mediaKind** (_optional_): `useDimensions.MediaKind` - Defines whether a Video or an Image is measured. _Defaults
      to_ `MediaKind.Image`.
2. `(options) => [Dimensions | null, RefCallback]`: Returns a callback ref to pass to a DOM element and
   calculates the dimensions of that element.
    - **options** (_optional_): `Partial<Options>` - Adjustments for measuring behaviour.

### Type aliases

- **Dimensions**: `{ width: number, height: number }`
- **Options**
  ```
  {
    originalRef: MutableRefObject | RefCallback,
    throttle: number,
  }
  ```
  Pass `originalRef` if you need to use some extra ref logic alongside the one provided by the hook.  
  `throttle` can serve for optimization purposes if the measured element's size changes very often.
- **MutableRefObject**: Return type of [useRef](https://reactjs.org/docs/hooks-reference.html#useref) with a
  non-`undefined` initial value.
- [**RefCallback**](https://reactjs.org/docs/refs-and-the-dom.html#callback-refs)

## useEventListener

### Call signatures

1. `(targetPointer, eventName, options, ...eventListeners) => void`
2. `(targetPointer, eventName, eventListener, options) => void`
3. `(targetPointer, eventName, ...eventListeners) => void`
4. `(eventName, options, ...eventListeners) => void`
5. `(eventName, eventListener, options) => void`
6. `(eventName, ...eventListeners) => void`

### Description

Adds the provided listeners to the target and performs automatic cleanup. Call signatures № 4, 5 & 6 are shorthands for
adding listeners to `window`.

### Arguments

- **targetPointer**: `Target` - Points to the element which events are to be handled.
- **eventName**: `string` - The name of the event to handle.
- **eventListener**: `Listener` - The handler for the event.
- **options**: `Options` - The options to pass to `addEventListener`.

### Type aliases

- **Target**: `EventTarget | RefObject` - anything that supports `addEventListener` and `removeEventListener`, or
  a React Ref holding a reference to one.
- For types of **Listener** and **Options**, see
  the [corresponding MDN page](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener).

## useIsMounted

### Call signature

`() => (() => boolean)`

### Description

Returns a function to access the mounted state of a functional component.

## useMountedState

### Call signature

`(initialState) => [State, SetState]`

### Description

A combination of plain [useState](https://reactjs.org/docs/hooks-reference.html#usestate)
and [useIsMounted](#useismounted). Useful for async operations like data fetching, when `setState` can potentially be
called after the component has already unmounted, to avoid the "Cannot set state on an unmounted component" warnings and
leaks.

The call signature is identical to [useState](https://reactjs.org/docs/hooks-reference.html#usestate).

## usePersistentState

### Call signature

`(initialState, key, options) => [State, SetState]`

### Description

A convenience wrapper for [useState](https://reactjs.org/docs/hooks-reference.html#usestate) that lets you keep data in
a persistent browser storage (i. e. localStorage).

### Arguments

- **key**: `string` - The key to store the data at.
- **options** (_optional_): `Partial<Options>` - Adjustments for storing behaviour.

### Type aliases

- **Options**:
  ```
  {
    storage: Storage,
    serializer: { stringify: (value: State) => string, parse: (serialized: string) => State },
    cleanup: boolean,
    clearOnParsingError: boolean,
  }
  ```
  `storage` is either localStorage, sessionStorage or any custom construction implementing the same interface. _By
  default_, localStorage is used.  
  `serializer` allows for customizing the way the data is serialized and deserialized. _By default_, this is done via
  JSON.  
  `cleanup` defines whether the stored value should be cleaned up when `options.storage`, `options.serializer` or `key`
  change. _Defaults to_ `true`.  
  `clearOnParsingError` defines whether the stored data should be cleared if the `serializer` fails to parse it.
  _Defaults to_ `true`.

### Returned value

Returned value is identical to [useState](https://reactjs.org/docs/hooks-reference.html#usestate).

## usePromise

### Call signatures

1. `(promiseCreator, options) => HookResult`
2. `(promiseCreator, deps, options) => HookResult`

### Description

Tracks the lifecycle of a Promise, handles data storing and error catching. If `deps` are provided, automatically calls
the async function on their update.

### Arguments

- **promiseCreator**: `(...args: Deps) => Promise<Data>` - The async function to create the tracked Promise.
- **deps** (_optional_): `Deps` - The array of dependencies that should trigger the `promiseCreator`.
- **options** (_optional_): `Partial<Options>` - Customize the way the data is operated.

### Type aliases

- **Options**:
  ```
  {
    resolveRace: usePromise.ResolveRace,
    onStart: () => void,
    onSuccess: (result) => void,
    onError: (e) => void,
    onAny: () => void,
    skip: boolean | (...deps) => boolean,
  }
  ```
  `resolveRace` defines how the hook should behave if a new Promise is launched while some other one is already running.
  `ResolveRace.TakeFirst` waits for the first launched Promise to finish before accepting any new
  triggers, `ResolveRace.TakeLast` (_default_) drops any running process whenever a new one is launched.  
  `onStart` is executed before any operation.  
  `onSuccess` is executed whenever the Promise resolves; the resolved value is passed as an argument.  
  `onError` is executed whenever the Promise rejects; the rejection reason is passed as an argument.  
  `onAny` is executed in the `final` block.  
  `skip` is either a flag or a function returning one, defining whether the automatic trigger should be skipped for the
  current set of dependencies. _By default_, each dependency in the array is checked to neither be `null`
  nor `undefined`.

### Returned value

The returned value is an array, with the following values at each position:

1. The resolved data (or `undefined`, if no Promise has resolved yet).
2. The error (or whatever other value the Promise rejects with).
3. A flag representing the "processing" state of the Promise.
4. An object holding these properties:
   - `status` - the precise representation of the current state of the Promise. Can be `Pending`, `Processing`, `Resolved`
     or `Rejected`.
   - `trigger` - a function allowing for manual launching of a new Promise. Accepts the same arguments as the original
     `promiseCreator`.

## useReRenderTrigger

### Call signature

`() => (() => void)`

### Description

Returns a function that forces the Component to re-render when called.

## useRenderCount

### Call signature

`() => (() => number)`

### Description

The hook is mostly meant for debugging purposes. Returns a function to access the amount of times the Component has
rendered.

## useUpdate

### Call signature

`(effect, deps, options) => ((overrideOptions) => void)`

### Description

A convenience wrapper for [useEffect](https://reactjs.org/docs/hooks-reference.html#useeffect) when the first N `deps`
updates should not trigger the effect.

### Arguments

- **effect**: `() => void` - The effect to execute.
- **deps**: `unknown[]` - The dependencies array.
- **options** (_optional_): `Partial<Options>` - Adjustments for execution behaviour.

### Type aliases

- **Options**:
  ```
  {
    nthUpdate: number,
    withCleanup: boolean,
    once: boolean,
  }
  ```
  `nthUpdate` defines which change of `deps` should first trigger the `effect`. The count is 0-based: render №0 is the
  initial render. _Defaults to_ `1`, meaning the initial render is skipped.  
  `withCleanup` defines whether the cleanup function returned by the `effect` should be taken in account. _Defaults
  to_ `true`.  
  If `once` is set to `true`, the effect and its cleanup will only be executed once after the Nth update. _Defaults
  to_ `false`.

### Returned value

Returned value is a function allowing you to reset the counter and potentially update the used options.

## useWillUnmount

### Call signature

`(effect) => void`

### Description

Executes the effect before the component unmounts.

### Arguments

- **effect**: `() => void` - The effect to execute.

## Package settings

The package exposes a `Settings` object. You can modify it to refine some global behaviour. The following settings are
available:
- **isDev**: `((method) => boolean) | boolean` - Either a flag or a function returning one, defining whether the app is
running in development environment. All the console messages generated by the hooks will be omitted in non-dev
environments. `method` is the name of console logging method used (`log`, `error`, `warn` etc.). _By default_, the app
is considered to be in development if `process.env.NODE_ENV` is `development`.