/**
 * Keyboard-driven drag and drop for react-beautiful-dnd.
 *
 * The board uses react-beautiful-dnd, whose draggables support an accessible
 * keyboard interaction: focus the handle, press Space to lift, use the arrow
 * keys to move across columns, and press Space again to drop. This is far more
 * reliable in an automated browser than synthesising native mouse events.
 */
import { candidateDragHandle } from './selectors';

const SPACE = 32;
const ARROW_LEFT = 37;
const ARROW_RIGHT = 39;
const ESCAPE = 27;

/** Time to let react-beautiful-dnd settle between keyboard actions. */
const SETTLE_MS = 250;

/**
 * Move a candidate a number of columns across the pipeline.
 * Positive `columns` moves right (towards later stages), negative moves left.
 */
export function moveCandidateAcross(fullName: string, columns: number): void {
  const arrowKey = columns >= 0 ? ARROW_RIGHT : ARROW_LEFT;
  const steps = Math.abs(columns);

  candidateDragHandle(fullName).focus().trigger('keydown', { keyCode: SPACE });
  cy.wait(SETTLE_MS);

  for (let i = 0; i < steps; i += 1) {
    candidateDragHandle(fullName).trigger('keydown', { keyCode: arrowKey, force: true });
    cy.wait(SETTLE_MS);
  }

  candidateDragHandle(fullName).trigger('keydown', { keyCode: SPACE, force: true });
  cy.wait(SETTLE_MS);
}

/**
 * Lift a candidate and release it outside of any stage by cancelling the drag,
 * leaving the pipeline unchanged.
 */
export function releaseOutsideAnyStage(fullName: string): void {
  candidateDragHandle(fullName).focus().trigger('keydown', { keyCode: SPACE });
  cy.wait(SETTLE_MS);
  candidateDragHandle(fullName).trigger('keydown', { keyCode: ESCAPE, force: true });
  cy.wait(SETTLE_MS);
}
