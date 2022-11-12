import type { FC } from 'react';
import usePersistentState from '../../src/use-persistent-state';

const PersistentState: FC = () => {
  const [inputValue, setInputValue] = usePersistentState('', 'inputValue');

  return (
    <input value={inputValue} onChange={e => setInputValue(e.target.value)} />
  );
};

export default PersistentState;