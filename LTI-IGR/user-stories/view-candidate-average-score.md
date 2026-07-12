# See each candidate's average interview score on their card

## Story
As a **Recruiter**, I want **to see each candidate's average interview score displayed on their pipeline card** so that **I can quickly compare candidate performance without opening each profile**.

## INVEST justification
- **Independent:** The score is already computed and returned by the candidates endpoint; displaying it is a self-contained card enhancement.
- **Negotiable:** The need is "show the average score"; its visual form (circles, stars, number) is negotiable.
- **Valuable:** Surfacing performance on the card speeds up screening and shortlisting decisions.
- **Estimable:** Read one field (`averageScore`) and render it on the card.
- **Small:** A single display element on an existing card.
- **Testable:** Verifiable by asserting the rendered score matches the average of the candidate's interview scores.

## Acceptance criteria

### Scenario 1: Score reflects the average of interview scores
- **Given** a candidate application with one or more scored interviews
- **When** the candidate card is rendered on the Position page
- **Then** the card shows a rating equal to the average of that application's interview scores

### Scenario 2: Candidate with no interviews
- **Given** a candidate application with no interviews
- **When** the candidate card is rendered
- **Then** the card shows a rating of zero (no rating indicators)

## Notes / dependencies
- Source: PRD F3, `averageScore` computed by `calculateAverageScore` in `getCandidatesByPositionService`.
- Depends on [view-candidates-by-current-stage](./view-candidates-by-current-stage.md).
