import type { ExclusiveUnion, StringMap, SimpleFunction } from '../utils/types';
import type { FC } from 'react';
import type { RenderResult } from '@testing-library/react';
import { fireEvent, render } from '@testing-library/react';
import { useState } from 'react';
import { isObjectWithKey } from '../utils/misc';
import identity from 'lodash/identity';

export const spyOnSingle = <Method extends SimpleFunction>(
  method: Method,
): [Method, jest.SpyInstance<ReturnType<Method>, Parameters<Method>>] => {
  const object = { method };
  const original = ((...args) => object.method(...args)) as Method;
  const spy = jest.spyOn(object as { method: (...args: Parameters<Method>) => ReturnType<Method> }, 'method');

  return [original, spy];
};

export function extractLastResult<Result>(spy: jest.SpyInstance<Result>): Result {
  const { results } = spy.mock;

  return (results[results.length - 1] as jest.MockResult<Result>).value;
}

type SwitchingComponentsOptions<Props extends StringMap> =
  ExclusiveUnion<[{ useHook: (props: Props) => unknown }, { ActivityComponent: FC<Props> }]>;

export const createSwitchingComponents = <Props extends StringMap>(
  options: SwitchingComponentsOptions<Props>,
  initialProps: Props = {} as Props,
): [() => void, RenderResult] => {
  const BUTTON_TEXT = 'switch';

  const ActivityComponent: FC<Props> = isObjectWithKey(options, 'ActivityComponent')
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

export function getUniqueReturnedValues <Result, Adjusted = Result>(
  spy: jest.SpyInstance<Result>,
  adjust: (value: Result) => Adjusted = identity,
): Adjusted[] {
  return Array.from(new Set(spy.mock.results.map(result => result.value))).map(value => adjust(value));
}