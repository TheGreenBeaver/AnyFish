import { useMountedState } from '../src/use-mounted-state';
import type { Dispatch, FC, SetStateAction } from 'react';
import { useEffect } from 'react';
import { createSwitchingComponents, extractLastResult, spyOnSingle, waitMs } from './test-utils';
import { fireEvent } from '@testing-library/react';

type EnhancedInit<S> = (
  S | (() => S)
) & {
  onSetState?: CallableFunction,
};

jest.mock('react', () => {
  const originalReact = jest.requireActual('react');

  return {
    ...originalReact,
    useState: function <S>(initialState: EnhancedInit<S>): [S, Dispatch<SetStateAction<S>>] {
      const [state, setState] = originalReact.useState(initialState);

      const enhancedSetState: Dispatch<SetStateAction<S>> = v => {
        initialState.onSetState?.(v);
        setState(v);
      };
      return [state, enhancedSetState];
    },
  };
});

describe('useMountedState', () => {
  it('Should only update state if the component is still mounted', async () => {
    const TIMEOUT = 1000;
    const UPDATE_BUTTON_TEXT = 'update';
    const onSetState = jest.fn();

    enum State {
      First,
      Second,
      Third,
    }

    const initialState = Object.assign(() => State.First, { onSetState });

    const [useMountedStateHook, mountedStateHookSpy] = spyOnSingle(useMountedState);

    const ActivityComponent: FC = () => {
      const [, setData] = useMountedStateHook(initialState);

      useEffect(() => {
        setTimeout(() => {
          setData(State.Third);
        }, TIMEOUT);
      }, [setData]);

      return <button onClick={() => setData(State.Second)}>{UPDATE_BUTTON_TEXT}</button>;
    };

    const [switchTab, { getByText }] = createSwitchingComponents({ ActivityComponent });

    expect(extractLastResult(mountedStateHookSpy)[0]).toBe(State.First);

    fireEvent.click(getByText(UPDATE_BUTTON_TEXT));
    expect(extractLastResult(mountedStateHookSpy)[0]).toBe(State.Second);

    switchTab();
    await waitMs(TIMEOUT);
    expect(extractLastResult(mountedStateHookSpy)[0]).toBe(State.Second);

    expect(onSetState).toHaveBeenCalledTimes(1);
    expect(onSetState).toHaveBeenLastCalledWith(State.Second);
  });
});