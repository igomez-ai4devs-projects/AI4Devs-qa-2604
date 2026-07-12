/**
 * Shared test world for the ATS BDD suite.
 *
 * Holds the domain state seeded by the `Given` steps so that later `When` /
 * `Then` steps can drive the application and assert against it. The state is a
 * mutable singleton that is reset before every scenario.
 */
import { Before } from '@badeball/cypress-cucumber-preprocessor';

/** A single stage (interview step) of a position's hiring pipeline. */
export interface Stage {
  id: number;
  name: string;
  order: number;
}

/** A candidate that has applied to the position under test. */
export interface SeededCandidate {
  candidateId: number;
  applicationId: number;
  fullName: string;
  /** Name of the pipeline stage the candidate currently sits in. */
  currentStage: string;
  /** Raw interview scores; the average is what the board displays. */
  scores: number[];
}

/** The full domain state for one scenario. */
export interface AtsWorld {
  positionId: number;
  positionName: string;
  /** Whether the position exists in the ATS. */
  positionExists: boolean;
  stages: Stage[];
  candidates: SeededCandidate[];
  /** Simulates whether the backend can currently persist a stage change. */
  saveAvailable: boolean;
  /** Tracks if the position board has already been opened in the browser. */
  boardOpened: boolean;
}

/**
 * The singleton world instance. Steps import and mutate this object directly.
 */
export const world: AtsWorld = createEmptyWorld();

function createEmptyWorld(): AtsWorld {
  return {
    positionId: 1,
    positionName: '',
    positionExists: true,
    stages: [],
    candidates: [],
    saveAvailable: true,
    boardOpened: false,
  };
}

/** Reset the world before each scenario so tests stay independent. */
Before(() => {
  Object.assign(world, createEmptyWorld());
});

/** Look up a stage by its display name. */
export function stageByName(name: string): Stage | undefined {
  return world.stages.find((stage) => stage.name === name);
}

/** Compute the average interview score the same way the backend does. */
export function averageScore(scores: number[]): number {
  if (scores.length === 0) return 0;
  return scores.reduce((total, score) => total + score, 0) / scores.length;
}
