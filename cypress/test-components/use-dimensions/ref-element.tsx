import type { FC } from 'react';
import useDimensions from '../../../src/use-dimensions';
import { useState } from 'react';
import { UseDimensions } from '../../constants';

type Props = { throttle?: number };

const RefElement: FC<Props> = props => {
  const [dimensions, ref] = useDimensions(props);
  const [text, setText] = useState('initial');

  return (
    <>
      {dimensions && (
        <div>
          <p id={UseDimensions.WidthId}>{dimensions.width}</p>
          <p id={UseDimensions.HeightId}>{dimensions.height}</p>
        </div>
      )}
      <textarea onChange={e => setText(e.target.value)} />
      <div ref={ref} id={UseDimensions.MeasuredId} style={{ maxWidth: 400, wordWrap: 'break-word' }}>
        {text}
      </div>
    </>
  );
};

export default RefElement;