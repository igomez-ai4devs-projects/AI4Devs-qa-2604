# View the interview pipeline for a position

## Story
As a **Recruiter**, I want **to open a position and see its interview pipeline rendered as ordered stage columns** so that **I can visualize the full selection workflow for that job opening at a glance**.

## INVEST justification
- **Independent:** Rendering the pipeline columns depends only on the position's interview flow; it can be built and delivered without the candidate-placement logic.
- **Negotiable:** Defines the need to see the stages; visual styling (Kanban columns, headers) is open to discussion.
- **Valuable:** The recruiter cannot manage a hiring process without seeing its stages; this is the backbone of the Position page.
- **Estimable:** Scope is a single read endpoint (`GET /positions/:id/interviewflow`) plus column rendering.
- **Small:** One view, one data source, completable within a sprint.
- **Testable:** Verifiable via the scenarios below (columns present, ordered, titled with the position name).

## Acceptance criteria

### Scenario 1: Pipeline stages are displayed for an existing position
- **Given** a position that has an interview flow with defined interview steps
- **When** the Recruiter navigates to `/positions/:id`
- **Then** one column is rendered for each interview step of the flow
- **And** each column header shows the interview step name

### Scenario 2: Stages are shown in workflow order
- **Given** a position whose interview steps have an `orderIndex`
- **When** the Position page finishes loading
- **Then** the stage columns are displayed in ascending `orderIndex` order (from first to final stage)

### Scenario 3: Position title is displayed as the page heading
- **Given** the interview flow response includes the `positionName`
- **When** the Position page loads
- **Then** the position title is shown as the page heading

## Notes / dependencies
- Source: PRD F3, Request 1 (`GET /positions/:id/interviewflow`).
- The interview flow response is double-nested (`interviewFlow.interviewFlow.interviewSteps`); the UI must read it accordingly.
- Prerequisite for [view-candidates-by-current-stage](./view-candidates-by-current-stage.md) and all stage-change stories.
