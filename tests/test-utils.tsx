import type { ExclusiveUnion, Keymap, SimpleFunction } from '../utils/types';
import type { FC } from 'react';
import type { RenderResult } from '@testing-library/react';
import { fireEvent, render } from '@testing-library/react';
import { memo, useState } from 'react';

export const spyOnSingle = <Method extends SimpleFunction>(
  method: Method,
): [Method, jest.SpyInstance<ReturnType<Method>, Parameters<Method>>] => {
  const object = { method };
  const original = ((...args) => object.method(...args)) as Method;
  const spy = jest.spyOn(object as { method: (...args: Parameters<Method>) => ReturnType<Method> }, 'method');

  return [original, spy];
};

export const waitMs = async (ms: number): Promise<undefined> => new Promise(resolve => setTimeout(resolve, ms));

export function extractLastResult<Result>(spy: jest.SpyInstance<Result>): Result {
  const { results } = spy.mock;

  return (results[results.length - 1] as jest.MockResult<Result>).value;
}

export const extractFuncFromHook = <
  Func extends SimpleFunction,
  Props extends Keymap,
>(
  useHook: (props: Props) => Func,
  initialProps: Props = {} as Props,
): [(...args: Parameters<Func>) => void, jest.SpyInstance<ReturnType<FC<Props>>, Parameters<FC<Props>>>] => {
  const BUTTON_TEXT = 'trigger';
  let currentArgs: Parameters<Func>;

  const RawComponent: FC<Props> = props => {
    const func = useHook(props);

    return (
      <button onClick={() => func(...currentArgs)}>
        {BUTTON_TEXT}
      </button>
    );
  };

  const [ComponentBody, ComponentBodySpy] = spyOnSingle(RawComponent);
  const MemoComponent = memo(ComponentBody);

  const { getByText } = render(<MemoComponent {...initialProps} />);

  const trigger = (...args: Parameters<Func>) => {
    currentArgs = args;
    fireEvent.click(getByText(BUTTON_TEXT));
  };

  return [trigger, ComponentBodySpy];
};

type SwitchingComponentsOptions<Props extends Keymap> =
  ExclusiveUnion<[{ useHook: (props: Props) => unknown }, { ActivityComponent: FC<Props> }]>;

export const createSwitchingComponents = <Props extends Keymap>(
  options: SwitchingComponentsOptions<Props>,
  initialProps: Props = {} as Props,
): [() => void, RenderResult] => {
  const BUTTON_TEXT = 'switch';

  const ActivityComponent: FC<Props> = 'ActivityComponent' in options
    ? options.ActivityComponent
    : props => {
      options.useHook(props);

      return <div />;
    };

  const DummyComponent: FC = () => <div />;

  const MainComponent: FC = () => {
    const [isDummy, setIsDummy] = useState(false);

    return (
      <>
        <button onClick={() => setIsDummy(true)}>{BUTTON_TEXT}</button>
        {isDummy ? <DummyComponent /> : <ActivityComponent {...initialProps} />}
      </>
    );
  };

  const renderResult = render(<MainComponent />);

  return [() => fireEvent.click(renderResult.getByText(BUTTON_TEXT)), renderResult];
};