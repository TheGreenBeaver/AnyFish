import type { FC } from 'react';
import { useEventListener } from '../src/use-event-listener';
import { useLayoutEffect, useRef, useState } from 'react';
import { fireEvent, render, renderHook, waitFor } from '@testing-library/react';
import type { Nullable } from '../utils/types';

type SkipFirstTwo<Arr extends unknown[]> = Arr extends [unknown, unknown, ...infer Tail] ? Tail : [never];
type HookArgs = SkipFirstTwo<Parameters<typeof useEventListener>>;

describe('useEventListener', () => {
  const TEXT = 'Click me';
  const listener = jest.fn();

  beforeEach(listener.mockClear);

  it('Should work with plain EventTarget', async () => {
    const INDICATOR = 'Visible';
    const ID = 'trigger';

    const InnerComponent: FC<{ target: HTMLElement }> = ({ target }) => {
      useEventListener(target, 'click', listener);

      return <div>{INDICATOR}</div>;
    };

    const Component: FC = () => {
      const [target, setTarget] = useState<Nullable<HTMLElement>>(null);

      useLayoutEffect(() => {
        const foundTarget = document.getElementById(ID);

        if (foundTarget) {
          setTarget(foundTarget);
        }
      }, []);

      return (
        <div>
          <div id={ID}>{TEXT}</div>
          {target && <InnerComponent target={target} />}
        </div>
      );
    };

    const { queryByText, getByText } = render(<Component />);
    await waitFor(() => expect(queryByText(INDICATOR)).toBeInTheDocument());

    fireEvent.click(getByText(TEXT));
    expect(listener).toHaveBeenCalled();
  });

  const prepareRefTest = (
    ...args: [
      EventListenerOrEventListenerObject,
      AddEventListenerOptions | boolean,
    ] | EventListenerOrEventListenerObject[]
  ): () => void => {
    const Component: FC = () => {
      const divRef = useRef<HTMLDivElement>(null);
      useEventListener(divRef, 'click', ...(args as HookArgs));

      return <div ref={divRef}>{TEXT}</div>;
    };

    const { getByText } = render(<Component />);

    const clickTrigger = () => fireEvent.click(getByText(TEXT));

    clickTrigger();

    return clickTrigger;
  };

  it('Should work with ref', () => {
    prepareRefTest(listener);
    expect(listener).toHaveBeenCalled();
  });

  it('Should work with multiple listeners', () => {
    const listeners = [...Array(3)].map(() => jest.fn());
    prepareRefTest(...listeners);
    listeners.forEach(singleListener => {
      expect(singleListener).toHaveBeenCalled();
    });
  });

  it('Should support options', () => {
    const clickTrigger = prepareRefTest(listener, { once: true });
    expect(listener).toHaveBeenCalledTimes(1);

    clickTrigger();
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('Should support shorthand with window as default target', () => {
    renderHook(() => useEventListener('scroll', listener));

    fireEvent.scroll(window);
    expect(listener).toHaveBeenCalled();
  });

  it('Should cleanup the listeners', () => {
    const { unmount } = renderHook(() => useEventListener('scroll', listener));

    fireEvent.scroll(window);
    expect(listener).toHaveBeenCalledTimes(1);

    unmount();
    fireEvent.scroll(window);
    expect(listener).toHaveBeenCalledTimes(1);
  });
});