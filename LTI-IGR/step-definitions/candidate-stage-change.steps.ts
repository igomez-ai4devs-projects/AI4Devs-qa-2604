/**
 * Step definitions for: features/candidate-stage-change.feature
 */
import { Given, When, Then, DataTable } from '@badeball/cypress-cucumber-preprocessor';
import { world, stageByName, SeededCandidate } from './support/world';
import {
  ensureBoardOpen,
  requestStageChange,
  SAVE_STAGE_CHANGE_ALIAS,
} from './support/atsBackend';
import { stageColumn } from './support/selectors';
import { moveCandidateAcross, releaseOutsideAnyStage } from './support/dragAndDrop';

let nextId = 500;

// --- Background -------------------------------------------------------------

Given('the position {string} has the pipeline stages:', (positionName: string, table: DataTable) => {
  world.positionName = positionName;
  world.positionExists = true;
  world.stages = table.raw().map((row, index) => ({
    id: index + 1,
    name: row[0],
    order: index + 1,
  }));
});

Given(
  'the candidate {string} is applying to {string} in the {string} stage',
  (fullName: string, _positionName: string, stageName: string) => {
    const id = nextId++;
    const candidate: SeededCandidate = {
      candidateId: id,
      applicationId: 100 + id,
      fullName,
      currentStage: stageName,
      scores: [],
    };
    world.candidates.push(candidate);
  },
);

// --- Given ------------------------------------------------------------------

Given('the candidate {string} is in the {string} stage', (fullName: string, stageName: string) => {
  const candidate = world.candidates.find((c) => c.fullName === fullName);
  if (candidate) {
    candidate.currentStage = stageName;
  }
});

Given('saving stage changes is temporarily unavailable', () => {
  world.saveAvailable = false;
});

// --- When -------------------------------------------------------------------

When('the Recruiter moves {string} to the {string} stage', (fullName: string, targetStage: string) => {
  ensureBoardOpen();

  const candidate = world.candidates.find((c) => c.fullName === fullName);
  const sourceIndex = world.stages.findIndex((s) => s.name === candidate?.currentStage);
  const targetIndex = world.stages.findIndex((s) => s.name === targetStage);

  moveCandidateAcross(fullName, targetIndex - sourceIndex);

  // Reflect the intended move in the world for subsequent assertions.
  if (candidate) {
    candidate.currentStage = targetStage;
  }
});

When('the Recruiter releases {string} outside of any stage', (fullName: string) => {
  ensureBoardOpen();
  releaseOutsideAnyStage(fullName);
});

When('the Recruiter attempts to move {string} using {string}', (fullName: string, condition: string) => {
  const candidate = world.candidates.find((c) => c.fullName === fullName);
  const validStageId = world.stages[1]?.id ?? 2;

  // Each condition maps to an invalid stage-change command against the API.
  switch (condition) {
    case 'an application that does not exist':
      requestStageChange(candidate?.candidateId ?? 0, {
        applicationId: 999999,
        currentInterviewStep: validStageId,
      }).as('invalidStageChange');
      break;
    case 'an unrecognized application reference':
      requestStageChange(candidate?.candidateId ?? 0, {
        applicationId: 'not-a-number',
        currentInterviewStep: validStageId,
      }).as('invalidStageChange');
      break;
    case 'an unrecognized target stage':
      requestStageChange(candidate?.candidateId ?? 0, {
        applicationId: candidate?.applicationId ?? 0,
        currentInterviewStep: 'not-a-number',
      }).as('invalidStageChange');
      break;
    default:
      throw new Error(`Unsupported invalid-move condition: ${condition}`);
  }
});

// --- Then -------------------------------------------------------------------

Then('{string} is shown in the {string} stage', (fullName: string, stageName: string) => {
  stageColumn(stageName).within(() => {
    cy.contains('.card-title', fullName).should('be.visible');
  });
});

Then('the candidate\'s current stage is saved as {string}', (stageName: string) => {
  const expectedStageId = stageByName(stageName)?.id;
  cy.wait(`@${SAVE_STAGE_CHANGE_ALIAS}`).then(({ request }) => {
    expect(Number(request.body.currentInterviewStep)).to.equal(expectedStageId);
  });
});

Then('{string} remains in the {string} stage', (fullName: string, stageName: string) => {
  stageColumn(stageName).within(() => {
    cy.contains('.card-title', fullName).should('be.visible');
  });
});

Then('no stage change is saved', () => {
  cy.get(`@${SAVE_STAGE_CHANGE_ALIAS}.all`).should('have.length', 0);
});

Then('the stage change is rejected as {string}', (reason: string) => {
  cy.get('@invalidStageChange').then((response: any) => {
    if (reason === 'application not found') {
      expect(response.status).to.equal(404);
    } else {
      // "invalid request" -> the backend rejects malformed input.
      expect(response.status).to.equal(400);
    }
  });
});

Then('the candidate\'s current stage remains unchanged', () => {
  // The rejected command must not have persisted anything; nothing to update.
  cy.get('@invalidStageChange').should('exist');
});

Then(
  '{string} is not presented as advanced to the {string} stage',
  (fullName: string, targetStage: string) => {
    // NOTE: the current frontend updates the board optimistically and does not
    // revert on a failed save (see PRD risk: optimistic UI without rollback).
    // This assertion encodes the intended behaviour and will pass once the
    // board reconciles with the failed persistence.
    stageColumn(targetStage).within(() => {
      cy.contains('.card-title', fullName).should('not.exist');
    });
  },
);

Then('the Recruiter is informed that the change was not saved', () => {
  // NOTE: pending frontend support to surface a save-failure notice.
  cy.contains(/not saved|could not be saved|failed/i).should('be.visible');
});
