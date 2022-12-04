import type { FC } from 'react';
import pic from './pic.jpg';
import { useDimensions } from '../../../../src/use-dimensions';
import { UseDimensions } from '../../../constants';

const Media: FC = () => {
  const dimensions = useDimensions(pic);

  return dimensions
    ? (
      <div>
        <p id={UseDimensions.WidthId}>{dimensions.width}</p>
        <p id={UseDimensions.HeightId}>{dimensions.height}</p>
      </div>
    ) : (
      <p>Loading image...</p>
    );
};

export default Media;