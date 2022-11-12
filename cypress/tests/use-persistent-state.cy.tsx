import PersistentState from '../test-components/use-persistent-state';

describe('usePersistentState', () => {
  it('Should keep the state in browser storage', () => {
    cy.mount(<PersistentState />).then(cmp => {
      cy.get('input').type('text');
      cmp.unmount({ log: true });
    });
    cy.mount(<PersistentState />);
    cy.get('input').should('have.value', 'text');
  });
});