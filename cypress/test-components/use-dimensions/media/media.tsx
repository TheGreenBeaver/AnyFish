import type { FC } from 'react';
import pic from './pic.jpg';
import useDimensions from '../../../../src/use-dimensions';

const Media: FC = () => {
  const dimensions = useDimensions(pic);

  return dimensions
    ? (
      <div>
        <p id='width'>{dimensions.width}</p>
        <p id='height'>{dimensions.height}</p>
      </div>
    ) : (
      <p id='loading'>Loading image...</p>
    );
};

export default Media;