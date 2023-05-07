import type { FC } from 'react';
import { useMediaQuery } from '../../../src/use-media-query';
import { UseMediaQuery } from '../../constants';

type Props = { track?: boolean };

const SingleQuery: FC<Props> = props => {
  const isScreenLarge = useMediaQuery('(min-width: 600px)', props);

  return (
    <div id={UseMediaQuery.elements.firstIndicatorId}>
      {isScreenLarge ? UseMediaQuery.trueText : UseMediaQuery.falseText}
    </div>
  );
};

export default SingleQuery;