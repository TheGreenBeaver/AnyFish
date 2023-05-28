import { renderHook, waitFor } from '@testing-library/react';
import { useDelayedValue } from '../src/use-delayed-value';
import { getUniqueReturnedValues, spyOnSingle, waitMs } from './test-utils';
import type { Options, HookResult } from '../src/use-delayed-value';

describe('useDelayedValue', () => {
  enum State {
    First,
    Second,
    Third,
    Fourth,
  }

  type TestSource = { current: HookResult<State> };

  const onSetState = jest.fn();

  const [useDelayedValueHook, delayedValueHookSpy] = spyOnSingle(useDelayedValue);

  beforeEach(() => {
    delayedValueHookSpy.mockClear();
    onSetState.mockClear();
  });

  const prepareForTest = (
    options?: Partial<Options>,
  ): TestSource => {
    const initialState = Object.assign(() => State.First, {
      onSetState,
    });
    return renderHook(() => useDelayedValueHook(initialState, options)).result;
  };

  const performFinalCheck = async (result: TestSource, finalState: State = State.Fourth) => {
    await waitFor(() => expect(result.current[0]).toBe(finalState));
    expect(onSetState).toHaveBeenCalledTimes(1);
    expect(onSetState).toHaveBeenLastCalledWith(finalState);
    expect(getUniqueReturnedValues(delayedValueHookSpy, value => value[0])).toEqual([State.First, finalState]);
  };

  const doUpdate = async (result: TestSource, newState: State, ms: number) => {
    result.current[1](newState);
    expect(onSetState).not.toHaveBeenCalled();
    await waitMs(ms);
  };

  it('Should debounce the value update', async () => {
    const result = prepareForTest();

    await doUpdate(result, State.Second, 100);
    await doUpdate(result, State.Third, 200);
    await doUpdate(result, State.Fourth, 500);

    await performFinalCheck(result);
  });

  it('Should update the value immediately', async () => {
    const result = prepareForTest();
    result.current[2](State.Second);

    await performFinalCheck(result, State.Second);
  });

  it('Should work with throttle and / or custom delay', async () => {
    const result = prepareForTest({ delayFn: 'throttle', delay: 700 });

    result.current[1](State.Second);
    await waitFor(() => expect(result.current[0]).toBe(State.Second));
    expect(onSetState).toHaveBeenCalledTimes(1);

    result.current[1](State.Third);
    await waitMs(100);
    expect(onSetState).toHaveBeenCalledTimes(1);

    result.current[1](State.Fourth);
    await waitMs(200);

    result.current[1](State.First);
    await waitFor(() => expect(result.current[0]).toBe(State.First));
    expect(onSetState).toHaveBeenCalledTimes(2);
  });
});