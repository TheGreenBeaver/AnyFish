import type { FC } from 'react';
import useEventListener from '../src/use-event-listener';
import { useRef } from 'react';
import { fireEvent, render } from '@testing-library/react';

describe('useEventListener', () => {
  it('Should work with plain EventTarget', () => {

  });

  it('Should work with ref', () => {
    const TEXT = 'Click me';
    const listener = jest.fn();

    const Component: FC = () => {
      const divRef = useRef<HTMLDivElement>(null);

      useEventListener(divRef, 'click', listener);

      return <div ref={divRef}>{TEXT}</div>;
    };

    const { getByText } = render(<Component />);

    fireEvent.click(getByText(TEXT));
    expect(listener).toHaveBeenCalled();
  });

  it('Should work with multiple listeners', () => {

  });

  it('Should support options in both notations', () => {
    const TEXT = 'Click me';
    const listeners = [...Array(3)].map(() => jest.fn());

    const Component: FC = () => {
      const divRef = useRef<HTMLDivElement>(null);

      useEventListener(divRef, 'click', ...listeners);

      return <div ref={divRef}>{TEXT}</div>;
    };

    const { getByText } = render(<Component />);

    fireEvent.click(getByText(TEXT));
    listeners.forEach(listener => {
      expect(listener).toHaveBeenCalledTimes(1);
    });

    fireEvent.click(getByText(TEXT));
    listeners.forEach(listener => {
      expect(listener).toHaveBeenCalledTimes(1);
    });
  });

  it('Should support shorthand with window as default target', () => {
    const listener = jest.fn();

    const Component: FC = () => {
      useEventListener('scroll', listener);

      return <div />;
    };

    render(<Component />);

    fireEvent.scroll(window);
    expect(listener).toHaveBeenCalled();
  });

  it('Should cleanup the listeners', () => {

  });
});