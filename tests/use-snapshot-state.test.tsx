import { fireEvent, render } from '@testing-library/react';
import { useSnapshotState } from '../src/use-snapshot-state';
import type { FC } from 'react';
import { useCallback, useState } from 'react';

describe('useSnapshotState', () => {
  const PLUS_INT = 'plus-int';
  const MINUS_INT = 'minus-int';
  const INT = 'int';

  const PLUS_EXT = 'plus-ext';
  const MINUS_EXT = 'minus-ext';
  const EXT = 'ext';

  type TestProps = Partial<{ value: number, setValue: (newValue: number) => void }>;

  const TestComponent: FC<TestProps> = props => {
    const [value, setValue] = useSnapshotState(0, props);

    const inc = useCallback(() => setValue(curr => curr + 1), [setValue]);
    const dec = useCallback(() => setValue(curr => curr - 1), [setValue]);

    return (
      <div>
        <button onClick={dec}>
          {MINUS_INT}
        </button>
        <p data-testid={INT}>{value}</p>
        <button onClick={inc}>
          {PLUS_INT}
        </button>
      </div>
    );
  };

  it('Should support controlled behaviour', () => {
    const ControlledComponent: FC = () => {
      const [value, setValue] = useState(0);

      const inc = useCallback(() => setValue(curr => curr + 3), []);
      const dec = useCallback(() => setValue(curr => curr - 3), []);

      return (
        <div>
          <button onClick={dec}>
            {MINUS_EXT}
          </button>
          <p data-testid={EXT}>{value}</p>
          <button onClick={inc}>
            {PLUS_EXT}
          </button>
          <TestComponent value={value} setValue={setValue} />
        </div>
      );
    };

    const { getByText, getByTestId } = render(<ControlledComponent />);

    fireEvent.click(getByText(PLUS_INT));
    expect(getByTestId(EXT)).toHaveTextContent(String(getByTestId(INT).textContent));

    fireEvent.click(getByText(MINUS_INT));
    expect(getByTestId(EXT)).toHaveTextContent(String(getByTestId(INT).textContent));

    fireEvent.click(getByText(PLUS_EXT));
    expect(getByTestId(EXT)).toHaveTextContent(String(getByTestId(INT).textContent));

    fireEvent.click(getByText(MINUS_EXT));
    expect(getByTestId(EXT)).toHaveTextContent(String(getByTestId(INT).textContent));
  });

  it('Should support uncontrolled behaviour', () => {
    const { getByText, getByTestId } = render(<TestComponent />);

    fireEvent.click(getByText(PLUS_INT));
    expect(getByTestId(INT)).toHaveTextContent('1');

    fireEvent.click(getByText(MINUS_INT));
    expect(getByTestId(INT)).toHaveTextContent('0');
  });
});