import Media from '../test-components/use-dimensions/media';
import RefElement from '../test-components/use-dimensions/ref-element';
import { UseDimensions } from '../constants';

describe('useDimensions', () => {
  const inspect = (width?: number, height?: number) => {
    cy.get(UseDimensions.WidthSelector).should('have.text', width);
    cy.get(UseDimensions.HeightSelector).should('have.text', height);
  };

  it('Should calculate size of media resources', () => {
    cy.mount(<Media />);
    inspect(1920, 1080);
  });

  const getAndInspect = () => cy
    .get(UseDimensions.MeasuredSelector)
    .then(m => inspect(m.outerWidth(), m.outerHeight()));

  const updateAndInspect = () => {
    getAndInspect();
    cy.get('textarea').type(
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi malesuada orci ut urna dignissim hendrerit. ' +
      'Fusce accumsan turpis sit amet diam consequat pretium. Duis eu iaculis velit, vitae facilisis enim. Quisque ' +
      'nec sagittis elit. Mauris dictum vitae turpis porta tempor. Quisque metus lorem, tristique ut urna ut, ' +
      'dapibus aliquet nulla. Maecenas ultricies ante ut lectus bibendum aliquam. Sed mi sem, tincidunt quis' +
      ' dictum ac, blandit vel ligula. ',
    );
    getAndInspect();
  };

  const tickAndInspect = (widthBefore?: number, heightBefore?: number) => {
    const newWidth = 90 + Math.floor(Math.random() * 300);
    const newHeight = 120 + Math.floor(Math.random() * 500);
    cy.viewport(newWidth, newHeight);
    inspect(widthBefore, heightBefore);
    cy.tick(100);
  };

  it('Should calculate size of dom elements', () => {
    cy.mount(<RefElement />).then(cmp => {
      updateAndInspect();

      cmp.rerender(<RefElement throttle={500} />);
      // Start with `inspect` to check the track wasn't lost after arg change
      getAndInspect();

      cy.get(UseDimensions.MeasuredSelector).then(m => {
        const widthBefore = m.outerWidth();
        const heightBefore = m.outerHeight();
        cy.clock();

        tickAndInspect(widthBefore, heightBefore);
        tickAndInspect(widthBefore, heightBefore);
        tickAndInspect(widthBefore, heightBefore);

        cy.viewport(220, 500);
        cy.tick(500);
        getAndInspect();
      });
    });
  });
});