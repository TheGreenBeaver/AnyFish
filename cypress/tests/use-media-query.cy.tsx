import SingleQuery from '../test-components/use-media-query/single-query';
import { UseMediaQuery } from '../constants';
import MultiQuery from '../test-components/use-media-query/multi-query';

describe('useMediaQuery', () => {
  const setWidth = (width: number) => cy.viewport(width, 700);

  const getText = (value: boolean) => value ? UseMediaQuery.trueText : UseMediaQuery.falseText;

  type CheckArgs = { first: boolean, second?: boolean, width?: number };

  const doCheck = ({ first, second, width }: CheckArgs) => {
    if (width != null) {
      setWidth(width);
    }

    cy.get(UseMediaQuery.elements.firstIndicatorSelector).should('have.text', getText(first));

    if (second != null) {
      cy.get(UseMediaQuery.elements.secondIndicatorSelector).should('have.text', getText(second));
    }
  };

  it('Should detect if the window matches a single query (reactively / once)', () => {
    setWidth(1000);

    cy.mount(<SingleQuery />).then(cmp => {
      // Reactively
      doCheck({ first: true });
      doCheck({ width: 400, first: false });

      cmp.rerender(<SingleQuery track={false} />);

      // Once
      doCheck({ first: false });
      doCheck({ width: 1000, first: false });
    });
  });

  it('Should detect if the window matches multiple queries', () => {
    setWidth(1000);
    const firstSource = { firstQuery: '(min-width: 600px)', secondQuery: '(max-width: 1400px)' };
    const secondSource = { firstQuery: '(min-width: 1000px)', secondQuery: '(max-width: 450px)' };

    cy.mount(<MultiQuery source={firstSource} />).then(cmp => {
      doCheck({ first: true, second: true });
      doCheck({ width: 1600, first: true, second: false });
      doCheck({ width: 500, first: false, second: true });

      cmp.rerender(<MultiQuery source={secondSource} />);
      doCheck({ first: false, second: false });
      doCheck({ width: 1600, first: true, second: false });

      cmp.rerender(<MultiQuery source={firstSource} track={false} />);
      doCheck({ first: true, second: false });
      doCheck({ width: 300, first: true, second: false });
    });
  });
});