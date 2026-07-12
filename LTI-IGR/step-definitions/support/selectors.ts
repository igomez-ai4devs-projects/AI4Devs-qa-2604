/**
 * Domain-oriented DOM selectors for the position board.
 *
 * These helpers deliberately use the visible structure of the board
 * (stage headers, candidate titles) rather than technical identifiers,
 * keeping the step definitions aligned with the ubiquitous language.
 */

/** The position title heading shown at the top of the board. */
export function positionTitle(): Cypress.Chainable<JQuery<HTMLElement>> {
  return cy.get('h2');
}

/** The column (card) that represents a given pipeline stage. */
export function stageColumn(stageName: string): Cypress.Chainable<JQuery<HTMLElement>> {
  return cy.contains('.card-header', stageName).parents('.card').first();
}

/** All stage headers, in the order they are rendered. */
export function allStageHeaders(): Cypress.Chainable<JQuery<HTMLElement>> {
  return cy.get('.card-header');
}

/** The candidate card identified by the candidate's full name. */
export function candidateCard(fullName: string): Cypress.Chainable<JQuery<HTMLElement>> {
  return cy.contains('.card-title', fullName).parents('.card').first();
}

/** The draggable handle element for a candidate card. */
export function candidateDragHandle(fullName: string): Cypress.Chainable<JQuery<HTMLElement>> {
  return cy.contains('.card-title', fullName).closest('[data-rbd-drag-handle-draggable-id]');
}
