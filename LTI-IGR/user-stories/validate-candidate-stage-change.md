# Validate and safeguard a candidate stage change

## Story
As a **Recruiter**, I want **the system to reject invalid stage-change requests with clear errors** so that **candidate pipeline data stays accurate and I am not misled into thinking an invalid move succeeded**.

## INVEST justification
- **Independent:** Validation and error responses can be implemented and tested independently of the drag-and-drop UI.
- **Negotiable:** The need is "invalid moves are safely rejected"; exact codes and messages are negotiable.
- **Valuable:** Protects data integrity of the pipeline and prevents silent corruption of candidate stages.
- **Estimable:** Bounded to the validation branches of `updateCandidateStageController` / `updateCandidateStage`.
- **Small:** A focused set of validation rules on one endpoint.
- **Testable:** Verifiable via deterministic status codes for each invalid input.

## Acceptance criteria

### Scenario 1: Non-existent application is rejected
- **Given** a stage-change request referencing an `applicationId` that does not exist for the candidate
- **When** `PUT /candidates/:id` is processed
- **Then** the backend responds with HTTP `404` and an "Application not found" message
- **And** no stage is modified

### Scenario 2: Non-numeric application identifier is rejected
- **Given** a stage-change request whose `applicationId` is not a valid number
- **When** `PUT /candidates/:id` is processed
- **Then** the backend responds with HTTP `400` (invalid identifier format)

### Scenario 3: Non-numeric target stage is rejected
- **Given** a stage-change request whose `currentInterviewStep` is not a valid number
- **When** `PUT /candidates/:id` is processed
- **Then** the backend responds with HTTP `400` (invalid `currentInterviewStep` format)

## Notes / dependencies
- Source: PRD F4 §4.3 controller validations and §7 acceptance criteria.
- Contract note: the controller internally labels `applicationId` as "position ID" (PRD risk #4); wording should be clarified but behavior is as above.
- Complements [move-candidate-across-stages](./move-candidate-across-stages.md).
