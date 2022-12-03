import SimpleText from '../test-components/use-persistent-state/simple-text';
import Nullish from '../test-components/use-persistent-state/nullish';
import { UsePersistentState } from '../constants';

describe('usePersistentState', () => {
  it('Should keep the state in browser storage', () => {
    const TEXT = 'text';
    cy.mount(<SimpleText />).then(cmp => {
      cy.get('input').type(TEXT);
      cmp.unmount({ log: true });
    });
    cy.mount(<SimpleText />);
    cy.get('input').should('have.value', TEXT);
  });

  it('Should properly handle empty values with default serializer', () => {
    cy.mount(<Nullish />).then(cmp => {
      cy.get(UsePersistentState.elements.ButtonSelector).click();
      cmp.unmount({ log: true });
    });

    cy.mount(<Nullish />).then(cmp => {
      cy.get(UsePersistentState.elements.IndicatorSelector).should('have.text', UsePersistentState.indicatorText);
      cmp.unmount({ log: true });
    });

    cy.clearLocalStorage();
    cy.mount(<Nullish />);
    cy.get(UsePersistentState.elements.IndicatorSelector).should('not.have.text', UsePersistentState.indicatorText);
  });
});