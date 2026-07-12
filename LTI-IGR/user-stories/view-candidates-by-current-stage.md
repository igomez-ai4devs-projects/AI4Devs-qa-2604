# See candidates placed in their current pipeline stage

## Story
As a **Recruiter**, I want **each applicant to appear as a card in the pipeline stage they currently occupy** so that **I can immediately understand where every candidate stands in the selection process for the position**.

## INVEST justification
- **Independent:** Consumes a dedicated endpoint (`GET /positions/:id/candidates`) and can be layered onto the already-rendered pipeline columns.
- **Negotiable:** The need is "candidates shown in the right column"; card content and layout are negotiable.
- **Valuable:** Placing candidates by stage is the primary reason a recruiter opens the Position page.
- **Estimable:** One read endpoint plus a name-based matching rule into existing columns.
- **Small:** A single behavior on top of an existing view.
- **Testable:** Verifiable by asserting each candidate card appears under the correct stage column.

## Acceptance criteria

### Scenario 1: Candidates are distributed into their current stage
- **Given** a position with applications whose `currentInterviewStep` matches existing stage names
- **When** the Position page loads
- **Then** each candidate card appears in the column whose title equals the candidate's current interview step
- **And** each card displays the candidate's full name

### Scenario 2: Empty stages render without candidates
- **Given** a stage that has no candidates in it
- **When** the Position page loads
- **Then** the corresponding column is displayed empty (no candidate cards)

### Scenario 3: Position with no applications
- **Given** a position that has no applications
- **When** the Position page loads
- **Then** all stage columns are rendered empty and no error is shown

## Notes / dependencies
- Source: PRD F3, Request 2 (`GET /positions/:id/candidates`).
- Candidate-to-stage placement is done by **stage name match** (`currentInterviewStep === stage.title`), which is fragile against duplicate or renamed stages (PRD risk #2).
- Depends on [view-position-interview-pipeline](./view-position-interview-pipeline.md).
