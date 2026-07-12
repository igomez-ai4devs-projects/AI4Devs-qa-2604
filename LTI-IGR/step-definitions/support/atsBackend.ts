/**
 * Backend test doubles for the ATS API.
 *
 * The position board loads its data from two GET endpoints and persists a
 * candidate stage change through a PUT endpoint. These helpers register
 * interceptors that answer with the seeded `world` state, and drive the
 * browser to the board.
 */
import { world, averageScore, AtsWorld } from './world';

const API = Cypress.env('apiUrl') || 'http://localhost:3010';

/** Alias used to await and assert the stage-change persistence request. */
export const SAVE_STAGE_CHANGE_ALIAS = 'saveStageChange';

/**
 * Register the interceptors for the two board-loading endpoints and the
 * stage-change endpoint, all backed by the current `world` state.
 */
export function registerAtsIntercepts(state: AtsWorld = world): void {
  // GET interview flow -> builds the pipeline columns.
  cy.intercept('GET', '**/positions/*/interviewFlow', (req) => {
    if (!state.positionExists) {
      req.reply({ statusCode: 404, body: { message: 'Position not found' } });
      return;
    }
    req.reply({
      statusCode: 200,
      body: {
        interviewFlow: {
          positionName: state.positionName,
          interviewFlow: {
            id: 1,
            description: 'Standard hiring flow',
            interviewSteps: [...state.stages]
              .sort((a, b) => a.order - b.order)
              .map((stage) => ({
                id: stage.id,
                interviewFlowId: 1,
                interviewTypeId: stage.id,
                name: stage.name,
                orderIndex: stage.order,
              })),
          },
        },
      },
    });
  }).as('getInterviewFlow');

  // GET candidates -> populates the columns with candidate cards.
  cy.intercept('GET', '**/positions/*/candidates', (req) => {
    if (!state.positionExists) {
      req.reply({ statusCode: 200, body: [] });
      return;
    }
    req.reply({
      statusCode: 200,
      body: state.candidates.map((candidate) => ({
        fullName: candidate.fullName,
        currentInterviewStep: candidate.currentStage,
        candidateId: candidate.candidateId,
        applicationId: candidate.applicationId,
        averageScore: averageScore(candidate.scores),
      })),
    });
  }).as('getCandidates');

  // PUT candidate -> persists the new stage, or fails when unavailable.
  cy.intercept('PUT', '**/candidates/*', (req) => {
    if (!state.saveAvailable) {
      // Simulate the persistence layer being temporarily unreachable.
      req.reply({ forceNetworkError: true });
      return;
    }
    req.reply({
      statusCode: 200,
      body: { message: 'Candidate stage updated successfully', data: req.body },
    });
  }).as(SAVE_STAGE_CHANGE_ALIAS);
}

/** Open the position board in the browser exactly once per scenario. */
export function ensureBoardOpen(state: AtsWorld = world): void {
  if (state.boardOpened) return;
  registerAtsIntercepts(state);
  cy.visit(`/positions/${state.positionId}`);
  cy.wait('@getInterviewFlow');
  cy.wait('@getCandidates');
  state.boardOpened = true;
}

/**
 * Issue a stage-change command directly against the backend contract.
 * Used for the invalid-request scenarios that cannot be produced through the
 * board UI (which only ever sends valid identifiers).
 */
export function requestStageChange(
  candidateId: number | string,
  body: Record<string, unknown>,
): Cypress.Chainable<Cypress.Response<unknown>> {
  return cy.request({
    method: 'PUT',
    url: `${API}/candidates/${candidateId}`,
    body,
    failOnStatusCode: false,
  });
}
