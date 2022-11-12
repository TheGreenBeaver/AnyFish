import Media from '../test-components/use-dimensions/media';
import RefElement from '../test-components/use-dimensions/ref-element/ref-element';

describe('useDimensions', () => {
  it('Should calculate size of media resources', () => {
    cy.mount(<Media />);
    cy.get('#width').should('have.text', '1920');
    cy.get('#height').should('have.text', '1080');
  });

  it('Should calculate size of dom elements', () => {
    cy.mount(<RefElement />);
    cy.get('#measured').then(m => {
      cy.get('#height').should('have.text', m.height());
    });
    cy.get('textarea').type(
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi malesuada orci ut urna dignissim hendrerit. ' +
      'Fusce accumsan turpis sit amet diam consequat pretium. Duis eu iaculis velit, vitae facilisis enim. Quisque ' +
      'nec sagittis elit. Mauris dictum vitae turpis porta tempor. Quisque metus lorem, tristique ut urna ut, ' +
      'dapibus aliquet nulla. Maecenas ultricies ante ut lectus bibendum aliquam. Sed mi sem, tincidunt quis' +
      ' dictum ac, blandit vel ligula. ',
    );
    cy.get('#measured').then(m => {
      cy.get('#height').should('have.text', m.height());
    });
  });
});