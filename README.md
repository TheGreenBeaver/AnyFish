# AnyFish

Utility React Hooks for any purpose. _There is a Hook for Any Fish._

**Installation**

`yarn add any-fish`  
`npm install any-fish`

**TypeScript usage**

The package is written in TypeScript, so no additional @types packages are needed.

## useBoolean

### Call signature

`(initialState) => [boolean, SwitchToTrue, SwitchToFalse, Toggle, Dispatch<SetStateAction<boolean>>]`

### Description

A convenience wrapper for [useState](https://react.dev/reference/react/useState) to manage boolean flags.

### Arguments

- **initialState** (_optional_): `boolean | (() => boolean)` - same as you'd pass to `useState<boolean>`. _Defaults to_
  `false`.

### Type aliases

**SwitchToTrue**, **SwitchToFalse**, **Toggle** are all just plain void functions (`() => void`). **SwitchToTrue** sets
the flag value to `true`, **SwitchToFalse** sets it to `false`, and **Toggle** sets it to be the opposite of the current
value.

## useDelayedValue

### Call signature

`(initialState, options) => [State, DebouncedFunc<SetState>, SetState]`

### Description

A convenience wrapper for [useState](https://react.dev/reference/react/useState) that lets you
[debounce or throttle](https://css-tricks.com/debouncing-throttling-explained-examples/) value updates.

### Arguments

- **initialState**: `T | (() => T)` - same as you'd pass to `useState`.
- **options** (_optional_): `Partial<Options>` - adjustments for delay logic.

### Type aliases
- **Options**:
  ```
  {
    delay: number,
    delayFn: 'debounce' | 'throttle',
  }
  ```
  `delay` defines the throttle / debounce timeout. _Defaults to_ 300.
  `delayFn` defines how to delay the setter. _Defaults to_ `debounce`.

### Returned value

Returned value is a tuple:
1. The current state value
2. The delayed state setter
3. The original state setter (executes immediately, not wrapped in neither `debounce` nor `throttle`)

## useDidMount

### Call signature

`(effect) => void`

### Description

Executes the effect after the initial render.

### Arguments

- **effect**: `() => void` - The effect to execute. The return value is ignored. Use plain
  [useEffect](https://react.dev/reference/react/useEffect) for effects that need cleanup.

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
- **Options**:
  ```
  {
    originalRef: MutableRefObject | RefCallback,
    throttle: number,
  }
  ```
  Pass `originalRef` if you need to use some extra ref logic alongside the one provided by the hook.  
  `throttle` can serve for optimization purposes if the measured element's size changes too often.
- **MutableRefObject**: Return type of [useRef](https://react.dev/reference/react/useRef).
- [**RefCallback**](https://react.dev/reference/react-dom/components/common#ref-callback)

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

## useMediaQuery

### Call signatures
1. `(mediaQuerySource, options) => boolean` - Checks if window matches provided media query
  - **mediaQuerySource**: `string` - The media query to match against.
  - **options** (_optional_): `Partial<Options>` - Adjustments for matching behaviour
2. `<K>(mediaQuerySources, options) => Record<K, boolean>`
- **mediaQuerySource**: `Record<K, string>` - The media queries to match against.
- **options** (_optional_): `Partial<Options>` - Adjustments for matching behaviour

### Type aliases

- **Options**:
  ```
  {
    track: boolean,
    throttle: number,
  }
  ```
  With `track` set to `false` the window will only be matched against the provided query once, otherwise the matching
  result will be tracked. _Defaults to_ `true`.
  `throttle` defines the throttle timeout when tracking the matching result. _Defaults to_ 300.

## useMountedState

### Call signature

`(initialState) => [State, SetState]`

### Description

A combination of plain [useState](https://react.dev/reference/react/useState)
and [useIsMounted](#useismounted). Useful for async operations like data fetching, when `setState` can potentially be
called after the component has already unmounted, to avoid the "Cannot set state on an unmounted component" warnings and
leaks.

The call signature is identical to [useState](https://react.dev/reference/react/useState).

## usePersistentState

### Call signature

`(initialState, key, options) => [State, SetState]`

### Description

A convenience wrapper for [useState](https://react.dev/reference/react/useState) that lets you keep data in
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
    follow: boolean,
    clearOnParsingError: boolean,
  }
  ```
  `storage` is either localStorage, sessionStorage or any custom construction implementing the same interface. _By
  default_, localStorage is used.  
  `serializer` allows for customizing the way the data is serialized and deserialized. _By default_, this is done via
  JSON.  
  `cleanup` defines whether the stored value should be cleaned up whenever `options.storage`, `options.serializer`
  or `key` change. _Defaults to_ `true`.  
  `follow` defines whether the state value should be updated whenever `options.storage`, `options.serializer` or `key`
  change to whatever is stored at that "new address". _Defaults to_ `false`.  
  `clearOnParsingError` defines whether the stored data should be cleared if the `serializer` fails to parse it.
  _Defaults to_ `true`.

### Returned value

Returned value is identical to [useState](https://react.dev/reference/react/useState).

## usePrevious

### Call signature

`(value, initialValue) => previousValue`

### Description

Returns the previous value of a variable.

### Arguments

- **value**: `T` - Current value.
- **initialValue** (_optional_): `T` - Initial value. _Defaults to_ `value`.

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
    skip: boolean | ((...deps) => boolean),
    triggerOnSameDeps: boolean,
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
  `triggerOnSameDeps` forces the hook to trigger the promise creator on **shallow** `deps` change even if current deps
  are **deep** equal to the previous ones.

### Returned value

The returned value is an array, with the following values at each position:

1. The resolved data (or `undefined`, if no Promise has resolved yet).
2. The error (or whatever other value the Promise rejects with).
3. A flag representing the "processing" state of the Promise.
4. An object holding the following properties:
  - `status` - the precise representation of the current state of the Promise. Can
    be `Pending`, `Processing`, `Resolved` or `Rejected`.
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

## useSelectiveEffect

### Call signature

`(effect, deps, options) => void`

### Description

A convenience wrapper for [useEffect](https://react.dev/reference/react/useEffect) that only triggers
the `effect` when `deps` **deeply** change.

### Arguments

- **effect**: `() => (void | (() => void))` - The effect to execute.
- **deps**: `unknown[]` - The dependencies array.
- **options** (_optional_): `Partial<Options>` - Adjustments for execution behaviour.

### Type aliases

- **Options**:
  ```
  {
    compare: (prev: Deps, curr: Deps) => boolean
  }
  ```
  `compare` defines how the change in `deps` is detected. _By default_,
  [Lodash.isEqual](https://lodash.com/docs/4.17.15#isEqual) is used.

## useUpdate

### Call signature

`(effect, deps, options) => ((overrideOptions) => void)`

### Description

A convenience wrapper for [useEffect](https://react.dev/reference/react/useEffect) when the first N `deps`
updates should not trigger the effect.

### Arguments

- **effect**: `() => (void | (() => void))` - The effect to execute.
- **deps**: `unknown[]` - The dependencies array.
- **options** (_optional_): `Partial<Options>` - Adjustments for execution behaviour.

### Type aliases

- **Options**:
  ```
  {
    nthUpdate: number,
    withCleanup: boolean,
    once: boolean,
    isInStrictMode: boolean,
  }
  ```
  `nthUpdate` defines which change of `deps` should first trigger the `effect`. The count is 0-based: render №0 is the
  initial render. _Defaults to_ `1`, meaning the initial render is skipped.  
  `withCleanup` defines whether the cleanup function returned by the `effect` should be taken in account. _Defaults
  to_ `true`.  
  If `once` is set to `true`, the effect and its cleanup will only be executed once after the Nth update. _Defaults
  to_ `false`.
  `isInStrictMode` defines whether the hook is used within [StrictMode](https://react.dev/reference/react/StrictMode);
  unfortunately, this can't be detected automatically, while it is essential when calculating which render should
  trigger the effect. _Defaults to_ `true`.

### Returned value

Returned value is a function allowing you to reset the counter and, if you need to, update the used options for the next
cycle.

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

- **isDev**: `(() => boolean) | boolean` - Either a flag or a function returning one, defining whether the app is
  running in development environment. _By default_, the app is considered to be in development if `process.env.NODE_ENV`
  is `development`.
- **allowConsole**: `((method) => boolean) | boolean` - Either a flag or a function returning one, defining whether the
  package is allowed to write to console. `method` is the name of console logging method used (`log`, `error`, `warn`
  etc.). _By default_, the logs are turned on if `isDev` is `true`.
- **defaults** - a complex field containing fallback options and settings for hooks:
  - **delay**: `number` - The fallback delay to use for debouncing and throttling. _Defaults to_ 300.
  - **isEqual**: `(a, b) => boolean` - The fallback comparison function. _Defaults
    to_ [Lodash.isEqual](https://lodash.com/docs/4.17.15#isEqual).
  - **options** - a complex field containing fallback options for hooks:
    - **delayedValue** - fallback options for [useDelayedValue](#usedelayedvalue). `delay` might be omitted, in such
      case `Settings.defaults.delay` will be used. _Defaults to_ `{ delayFn: 'debounce' }`.
    - **mediaQuery** - fallback options for [useMediaQuery](#usemediaquery). `throttle` might be omitted, in such
      case `Settings.defaults.delay` will be used. _Defaults to_ `{ track: true }`.
    - **persistentState** - fallback options for [usePersistentState](#usepersistentstate). `storage` might be omitted
      (_should_ be, if your app does not only run in browser environment). _Defaults to_
      ```
      {
        serializer: {
          stringify: value => JSON.stringify({ value }),
          parse: serialized => JSON.parse(serialized).value,
        },
        cleanup: true,
        follow: false,
        clearOnParsingError: true,
      }
      ```
    - **update** - fallback options for [useUpdate](#useupdate). _Defaults to_
      ```
      {
        nthUpdate: 1,
        withCleanup: true,
        once: false,
        isInStrictMode: true,
      }
      ```