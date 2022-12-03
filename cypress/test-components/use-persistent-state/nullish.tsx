import type { FC } from 'react';
import usePersistentState from '../../../src/use-persistent-state';
import type { Optional } from '../../../utils/types';
import { UsePersistentState } from '../../constants';

type Status = Optional<'good' | 'bad'>

const Nullish: FC = () => {
  const [inputStatus, setStatus] = usePersistentState<Status>('good', 'inputValue');

  return (
    <>
      <button
        id={UsePersistentState.elements.ButtonId}
        onClick={() => setStatus(undefined)}
      >
        Clear
      </button>
      <div id={UsePersistentState.elements.IndicatorId}>
        {inputStatus === undefined && UsePersistentState.indicatorText}
      </div>
    </>
  );
};

export default Nullish;