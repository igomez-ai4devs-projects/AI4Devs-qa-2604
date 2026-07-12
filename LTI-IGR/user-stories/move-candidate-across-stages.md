# Move a candidate across pipeline stages via drag-and-drop

## Story
As a **Recruiter**, I want **to drag a candidate's card from one stage column and drop it onto another** so that **I can advance or move the candidate through the interview pipeline and have that change persisted**.

## INVEST justification
- **Independent:** The move interaction is a discrete capability on top of the loaded board; it can be delivered on its own.
- **Negotiable:** The need is "reposition a candidate between stages"; interaction details (drag handles, animations) are negotiable.
- **Valuable:** Moving candidates between stages is the core action of managing a selection process — the primary write operation of the product.
- **Estimable:** One drag-and-drop handler plus one persistence call (`PUT /candidates/:id`).
- **Small:** A single interaction with a single persistence endpoint.
- **Testable:** Verifiable via the UI reposition, the request payload, and the persisted `currentInterviewStep`.

## Acceptance criteria

### Scenario 1: Candidate moved to a new stage is persisted
- **Given** a candidate card in a source stage on the Position page
- **When** the Recruiter drags the card and drops it onto a different stage column
- **Then** the card is shown in the destination column
- **And** a `PUT /candidates/:id` request is sent with the `applicationId` and the destination stage `id` as `currentInterviewStep`
- **And** the application's `currentInterviewStep` is updated in the database and the backend returns HTTP `200`

### Scenario 2: Dropping outside a valid stage makes no change
- **Given** a candidate card being dragged
- **When** the Recruiter releases it outside any valid stage column (no destination)
- **Then** the card remains in its original stage
- **And** no stage-change request is sent

### Scenario 3: Candidate stays in the same stage
- **Given** a candidate card in a stage
- **When** the Recruiter drops it back into the same stage
- **Then** the candidate's position reflects the drop without changing its stage assignment

## Notes / dependencies
- Source: PRD F4 §4.2–4.3 (`onDragEnd`, `updateCandidateStep`, `PUT /candidates/:id`).
- The updated field belongs to the **`Application`** entity, so `applicationId` is required in addition to the candidate `id`.
- Failure handling of the persistence call is covered by [reflect-failed-stage-change](./reflect-failed-stage-change.md); input validation by [validate-candidate-stage-change](./validate-candidate-stage-change.md).
- Depends on [view-candidates-by-current-stage](./view-candidates-by-current-stage.md).
