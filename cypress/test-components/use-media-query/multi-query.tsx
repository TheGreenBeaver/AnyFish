import type { FC } from 'react';
import { useMediaQuery } from '../../../src/use-media-query';
import { UseMediaQuery } from '../../constants';

type SourceKeys = 'firstQuery' | 'secondQuery';

type Props = {
  source: Record<SourceKeys, string>,
  track?: boolean,
};

const MultiQuery: FC<Props> = ({ source, track = true }) => {
  const match = useMediaQuery(source, { track });

  return (
    <div>
      <p id={UseMediaQuery.elements.firstIndicatorId}>
        {match.firstQuery ? UseMediaQuery.trueText : UseMediaQuery.falseText}
      </p>
      <p id={UseMediaQuery.elements.secondIndicatorId}>
        {match.secondQuery ? UseMediaQuery.trueText : UseMediaQuery.falseText}
      </p>
    </div>
  );
};

export default MultiQuery;