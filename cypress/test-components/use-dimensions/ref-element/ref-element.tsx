import type { FC } from 'react';
import useDimensions from '../../../../src/use-dimensions';

const RefElement: FC = () => {
  const [dimensions, ref] = useDimensions();

  return (
    <>
      {dimensions && (
        <div>
          <p id='width'>{dimensions.width}</p>
          <p id='height'>{dimensions.height}</p>
        </div>
      )}
      <div ref={ref} id='measured'>
        <textarea />
      </div>
    </>
  );
};

export default RefElement;