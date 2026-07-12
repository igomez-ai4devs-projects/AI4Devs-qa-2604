# User Stories — LTI ATS

Backlog derived from [PRD.md](../../PRD.md), scoped to two ATS domains: **Position page loading (F3)** and **Candidate stage change (F4)**.

## Analysis summary

**Product goal & scope.** LTI is an Applicant Tracking System (ATS) that lets a recruitment team manage the candidate lifecycle through a position's interview pipeline, presented as a Kanban-style board. This backlog covers only two functional domains from the PRD: loading the Position page (rendering the interview pipeline and placing candidates in their current stage) and changing a candidate's stage (moving applicants across the pipeline via drag-and-drop with persistence). Out of scope: candidate creation, CV upload, candidate detail panel, and dashboard.

**Actors.** The dominant actor is the **Recruiter** (hiring manager / recruiter), the single interactive user of both domains: they open positions, read the pipeline, and reposition candidates. A secondary implicit actor is the **ATS platform/backend**, which enforces data integrity (validation, persistence, error responses) on stage changes — reflected in the validation and reconciliation stories. No other human roles are exercised by these two domains in the PRD.

**Covered features.** For *Position page loading* the backlog decomposes the board into its pipeline (stage columns), candidate placement by current stage, per-candidate average interview score, and graceful handling of an invalid/non-existent position. For *Candidate stage change* it covers the drag-and-drop move with persistence, server-side validation of the change (400/404), and board/state reconciliation when persistence fails — the latter directly addressing the PRD's optimistic-UI-without-rollback risk.

## Backlog summary table

| ID | Story | Actor | Value | Priority |
|----|-------|-------|-------|----------|
| US-01 | [View the interview pipeline for a position](./view-position-interview-pipeline.md) | Recruiter | Visualize the full selection workflow of a position | High |
| US-02 | [See candidates placed in their current pipeline stage](./view-candidates-by-current-stage.md) | Recruiter | Know where every candidate stands in the process | High |
| US-03 | [See each candidate's average interview score on their card](./view-candidate-average-score.md) | Recruiter | Compare candidate performance at a glance | Medium |
| US-04 | [Handle loading of a non-existent or invalid position](./handle-invalid-position-load.md) | Recruiter | Avoid broken/misleading pipeline views | Medium |
| US-05 | [Move a candidate across pipeline stages via drag-and-drop](./move-candidate-across-stages.md) | Recruiter | Advance candidates through the pipeline (persisted) | High |
| US-06 | [Validate and safeguard a candidate stage change](./validate-candidate-stage-change.md) | Recruiter / Platform | Protect pipeline data integrity | High |
| US-07 | [Keep the board in sync when a stage change fails](./reflect-failed-stage-change.md) | Recruiter | Prevent false "moved" states on failure | Medium |

### Dependency order
`US-01` → `US-02` → (`US-03`, `US-04`) · `US-02` → `US-05` → (`US-06`, `US-07`)

## Domain coverage
- **Position page loading (F3):** US-01, US-02, US-03, US-04
- **Candidate stage change (F4):** US-05, US-06, US-07
