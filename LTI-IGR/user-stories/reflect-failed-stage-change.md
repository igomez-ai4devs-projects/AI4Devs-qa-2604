# Keep the board in sync when a stage change fails

## Story
As a **Recruiter**, I want **the pipeline board to reflect the true persisted state when a stage change fails** so that **I do not believe a candidate was moved when the change was never saved**.

## INVEST justification
- **Independent:** The failure-reconciliation behavior can be added to the existing move interaction without changing the happy path.
- **Negotiable:** The need is "no false-positive moves"; the recovery mechanism (revert, retry, notify) is negotiable.
- **Valuable:** Prevents a documented desync risk where an optimistic move survives on screen despite a failed save, corrupting the recruiter's mental model of the pipeline.
- **Estimable:** Scope is the error branch of the persistence call in the move flow.
- **Small:** One error-path behavior on an existing interaction.
- **Testable:** Verifiable by forcing the persistence call to fail and asserting the board no longer misrepresents the move.

## Acceptance criteria

### Scenario 1: Failed persistence does not leave a false move
- **Given** a Recruiter drags a candidate to a new stage
- **When** the `PUT /candidates/:id` persistence call fails (e.g., network or server error)
- **Then** the board does not present the candidate as successfully moved
- **And** the Recruiter is informed that the change was not saved

### Scenario 2: Successful persistence keeps the move
- **Given** a Recruiter drags a candidate to a new stage
- **When** the persistence call returns HTTP `200`
- **Then** the candidate remains in the destination stage after the board reconciles

## Notes / dependencies
- Source: PRD F4 §4.4 and risk #1 (optimistic UI without rollback).
- Current implementation performs an optimistic update and only logs the error on failure; this story closes that gap.
- Depends on [move-candidate-across-stages](./move-candidate-across-stages.md).
