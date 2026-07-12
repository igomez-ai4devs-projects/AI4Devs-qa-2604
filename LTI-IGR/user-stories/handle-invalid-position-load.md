# Handle loading of a non-existent or invalid position

## Story
As a **Recruiter**, I want **the system to respond gracefully when I open a position that does not exist** so that **I am not left with a broken or misleading pipeline view**.

## INVEST justification
- **Independent:** Error handling for the load path is separable from the happy-path rendering stories.
- **Negotiable:** The need is "fail gracefully"; the exact messaging/redirect is negotiable.
- **Valuable:** Prevents confusing empty or broken boards, protecting recruiter trust in the data.
- **Estimable:** Bounded to the not-found responses of the two load endpoints.
- **Small:** A single error-handling behavior on the load flow.
- **Testable:** Verifiable via backend status codes and the absence of a misleading pipeline.

## Acceptance criteria

### Scenario 1: Non-existent position returns not found
- **Given** a position `id` that does not exist
- **When** the interview flow is requested via `GET /positions/:id/interviewflow`
- **Then** the backend responds with HTTP `404` and a "Position not found" message

### Scenario 2: Board is not populated with misleading data
- **Given** the interview flow request for a position failed
- **When** the Position page attempts to load
- **Then** no stage columns are populated with candidate data
- **And** the failure is surfaced (not silently ignored) to the Recruiter

## Notes / dependencies
- Source: PRD F3 §3.4 and PRD risk observations.
- Current implementation logs fetch errors to the console; product-level handling (message/redirect) is to be defined with the team.
- Depends on [view-position-interview-pipeline](./view-position-interview-pipeline.md).
