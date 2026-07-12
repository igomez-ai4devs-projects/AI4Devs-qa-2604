/**
 * Step definitions for: features/position-page-loading.feature
 */
import { Given, When, Then, DataTable } from '@badeball/cypress-cucumber-preprocessor';
import { world, SeededCandidate } from './support/world';
import { registerAtsIntercepts } from './support/atsBackend';
import { positionTitle, stageColumn, allStageHeaders, candidateCard } from './support/selectors';

let nextId = 1;

// --- Background -------------------------------------------------------------

Given('the Recruiter is authenticated in the ATS', () => {
  // Authentication is out of scope for these flows; the Recruiter is assumed
  // to be a valid, signed-in user of the ATS.
  world.positionExists = true;
});

Given(
  'a position {string} exists with an interview flow of the stages:',
  (positionName: string, table: DataTable) => {
    world.positionName = positionName;
    world.positionExists = true;
    world.stages = table.hashes().map((row) => ({
      id: Number(row.order),
      name: row.stage,
      order: Number(row.order),
    }));
  },
);

// --- Given ------------------------------------------------------------------

Given('the following candidates are applying to {string}:', (_positionName: string, table: DataTable) => {
  world.candidates = table.hashes().map((row) => buildCandidate(row.candidate, row['current stage']));
});

Given('no candidates are applying to {string}', (_positionName: string) => {
  world.candidates = [];
});

Given('the candidate {string} is applying to {string}', (fullName: string, _positionName: string) => {
  const firstStage = world.stages[0]?.name ?? 'Initial Screening';
  world.candidates.push(buildCandidate(fullName, firstStage));
});

Given('the candidate {string} has the interview scores {string}', (fullName: string, scores: string) => {
  const candidate = world.candidates.find((c) => c.fullName === fullName);
  if (candidate) {
    candidate.scores = parseScores(scores);
  }
});

Given('no position named {string} exists', (positionName: string) => {
  world.positionName = positionName;
  world.positionExists = false;
});

// --- When -------------------------------------------------------------------

When('the Recruiter opens the position {string}', (positionName: string) => {
  if (world.positionExists) {
    world.positionName = positionName;
  }
  registerAtsIntercepts();
  cy.visit(`/positions/${world.positionId}`);
  world.boardOpened = true;
});

// --- Then -------------------------------------------------------------------

Then('the pipeline shows the stages in this order:', (table: DataTable) => {
  const expected = table.raw().map((row) => row[0]);
  allStageHeaders().should('have.length', expected.length);
  expected.forEach((stageName, index) => {
    allStageHeaders().eq(index).should('have.text', stageName);
  });
});

Then('the pipeline is titled with the position name {string}', (positionName: string) => {
  positionTitle().should('have.text', positionName);
});

Then('{string} appears in the {string} stage', (fullName: string, stageName: string) => {
  stageColumn(stageName).within(() => {
    cy.contains('.card-title', fullName).should('be.visible');
  });
});

Then(
  '{string} and {string} appear in the {string} stage',
  (firstName: string, secondName: string, stageName: string) => {
    stageColumn(stageName).within(() => {
      cy.contains('.card-title', firstName).should('be.visible');
      cy.contains('.card-title', secondName).should('be.visible');
    });
  },
);

Then(
  'the {string} and {string} stages have no candidates',
  (firstStage: string, secondStage: string) => {
    [firstStage, secondStage].forEach((stageName) => {
      stageColumn(stageName).find('.card-title').should('have.length', 0);
    });
  },
);

Then('every stage of the pipeline is shown without candidates', () => {
  world.stages.forEach((stage) => {
    stageColumn(stage.name).find('.card-title').should('have.length', 0);
  });
});

Then('no error is reported to the Recruiter', () => {
  cy.contains(/error|failed|not found/i).should('not.exist');
});

Then('the candidate {string} shows an average score of {string}', (fullName: string, average: string) => {
  const expected = Number(average);
  candidateCard(fullName)
    .find('span[role="img"][aria-label="rating"]')
    .should('have.length', expected);
});

Then('the pipeline is not displayed', () => {
  cy.get('.card-header').should('not.exist');
});

Then('the Recruiter is informed that the position could not be found', () => {
  // NOTE: the current frontend only logs the fetch error to the console.
  // This assertion encodes the intended behaviour (a visible not-found notice)
  // and will pass once the position load surfaces such a message to the user.
  cy.contains(/position .*not.*found|could not be found/i).should('be.visible');
});

// --- Helpers ----------------------------------------------------------------

function buildCandidate(fullName: string, currentStage: string): SeededCandidate {
  const id = nextId++;
  return {
    candidateId: id,
    applicationId: 100 + id,
    fullName,
    currentStage,
    scores: [],
  };
}

function parseScores(raw: string): number[] {
  return raw
    .split(',')
    .map((value) => value.trim())
    .filter((value) => value.length > 0)
    .map((value) => Number(value));
}
