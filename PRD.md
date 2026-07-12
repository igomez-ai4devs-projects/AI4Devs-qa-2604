# PRD — LTI Talent Tracking System

**Product Requirements Document**
Version: 1.0 · Role: Product Owner · Based on the repository source code.

---

## 1. Product vision

**LTI** is a talent tracking system (ATS — *Applicant Tracking System*) aimed at recruitment teams. It manages a candidate's lifecycle from creation through their progression across the different interview stages of a position, with a visual **Kanban board** experience that reflects the interview *pipeline*.

**Primary user:** the *Recruiter* / hiring manager, who manages open positions and moves candidates through the interview flow.

---

## 2. Main features (overview)

| # | Feature | Description | Surface |
|---|---------|-------------|---------|
| F1 | Recruiter dashboard | Application entry point (`/`). | Frontend |
| F2 | Positions listing | Shows visible positions with filters (title, date, status, manager). | `/positions` |
| F3 | **Position page loading** | Position detail view as a Kanban board of stages with their candidates. | `/positions/:id` |
| F4 | **Candidate stage change** | Move a candidate from one stage to another by dragging its card (drag & drop), persisting the change. | `/positions/:id` |
| F5 | Candidate creation | Candidate creation form with education, experience, and CV. | `/add-candidate` |
| F6 | Candidate detail | Side panel with data, history, and interview logging. | *Offcanvas* panel |
| F7 | CV upload | Résumé file upload. | `POST /upload` |

Features **F3** and **F4** are the core of this document and are detailed below.

---

## 3. F3 — Position page loading

### 3.1 Functional description
When navigating to `/positions/:id`, the recruiter sees the **position board**: the position title and one column per **stage (interview step)** of the interview flow. Within each column appear the **candidate cards** currently in that stage, showing their name and their average score represented visually.

### 3.2 Behavior and data
Page loading performs **two parallel requests** on component mount (`PositionDetails.js`, `useEffect` with dependency `[id]`):

1. **Fetch the interview flow** — builds the board columns.
2. **Fetch the position's candidates** — populates each column with its cards.

#### Request 1 — Interview flow
- **Endpoint:** `GET /positions/:id/interviewflow`
- **Backend:** `getInterviewFlowByPosition` → `getInterviewFlowByPositionService`
- **Logic:** finds the `Position` by `id`, including its `interviewFlow` and the associated `interviewSteps`.
- **Response (shape):**
  ```json
  {
    "interviewFlow": {
      "positionName": "<position title>",
      "interviewFlow": {
        "id": 1,
        "description": "...",
        "interviewSteps": [
          { "id": 1, "interviewFlowId": 1, "interviewTypeId": 1, "name": "Initial Screening", "orderIndex": 1 }
        ]
      }
    }
  }
  ```
- **Frontend usage:** for each `interviewStep`, a column `{ title: step.name, id: step.id, candidates: [] }` is created. `positionName` is also set as the page title.
- **Errors:** if the position does not exist, the backend responds `404 Position not found`.

#### Request 2 — Position candidates
- **Endpoint:** `GET /positions/:id/candidates`
- **Backend:** `getCandidatesByPosition` → `getCandidatesByPositionService`
- **Logic:** finds all `Application` records for that `positionId`, including `candidate`, `interviews`, and `interviewStep`. For each application it returns:
  ```json
  {
    "fullName": "First Last",
    "currentInterviewStep": "<current stage name>",
    "candidateId": 1,
    "applicationId": 10,
    "averageScore": 3.5
  }
  ```
- **`averageScore`:** mean of the `score` values of that application's interviews (0 if there are no interviews).
- **Frontend usage:** candidates are distributed across columns **by matching the stage name** (`candidate.currentInterviewStep === stage.title`). Each card is modeled as `{ id: candidateId (string), name: fullName, rating: averageScore, applicationId }`.

### 3.3 Presentation (UI)
- **Container:** `PositionDetails.js` — position title + `DragDropContext` (react-beautiful-dnd) + "Back to Positions" button.
- **Stage column:** `StageColumn.js` — `Droppable` with `droppableId = column index`; header with the stage name.
- **Candidate card:** `CandidateCard.js` — `Draggable`; shows the name and the score as 🟢 circles (one per `rating` point). Clicking it opens the detail panel (F6).
- **Detail panel (F6):** `CandidateDetails.js` — side `Offcanvas` that queries `GET /candidates/:id` and shows personal data, education, experience, CVs, applications, and interviews, plus a form to log a new interview (notes + score 1–5).

### 3.4 Business rules and observations
- Only positions with `isVisible = true` are listed (F2, `getAllPositionsService`), but the detail view (F3) loads by direct `id` without filtering by visibility.
- The **candidate ↔ stage association depends on the `name`** of the interview step, not its `id`. Duplicate or inconsistent names would break the matching.
- ⚠️ **Detected inconsistency:** the frontend calls `/positions/${id}/interviewFlow` (camelCase) while the backend route is `/:id/interviewflow`; it works due to case-insensitive routing, but should be normalized.
- ⚠️ Data access uses `data.interviewFlow.interviewFlow.interviewSteps` (double nesting), reflecting the controller + service *wrapping*.

---

## 4. F4 — Candidate stage change

### 4.1 Functional description
Within the Position page, the recruiter **drags a candidate's card** from its source column and **drops it onto another column (stage)**. The move is reflected immediately in the interface and **persisted to the database**, updating the current stage (`currentInterviewStep`) of that candidate's application (`Application`).

### 4.2 Interaction flow (frontend)
Handled by `onDragEnd` in `PositionDetails.js`:
1. The user drops the card. If there is no valid destination (`!destination`), nothing happens.
2. The source and destination columns are identified by `droppableId` (index).
3. The candidate is moved from the source array to the destination array (optimistic update of the local `stages` state) and the board re-renders.
4. The real destination stage `id` is obtained (`stages[destination.droppableId].id`).
5. `updateCandidateStep(candidateId, applicationId, newStepId)` is invoked, which makes the persistence call.

### 4.3 Persistence (backend)
- **Endpoint:** `PUT /candidates/:id`
- **Request body:**
  ```json
  { "applicationId": <number>, "currentInterviewStep": <number> }
  ```
- **Backend:** `updateCandidateStageController` → `updateCandidateStage`
- **Controller validations:**
  - `id` (candidate), `applicationId`, and `currentInterviewStep` are parsed to integers; if `applicationId` or `currentInterviewStep` are non-numeric → `400`.
- **Service logic:**
  - Locates the `Application` via `Application.findOneByPositionCandidateId(applicationId, candidateId)`.
  - If it does not exist → error `Application not found` → the controller responds `404`.
  - Updates `application.currentInterviewStep = currentInterviewStep` and saves (`application.save()`).
- **Success response:** `200` with `{ message: 'Candidate stage updated successfully', data: <updated application> }`.

### 4.4 Business rules and observations
- The stage is persisted by the interview step's **numeric id**, even though the initial visual distribution (F3) was done by stage **name**. Both worlds coexist: rendered by name, saved by id.
- The UI update is **optimistic**: the card is moved before the backend response is confirmed. If the `PUT` call fails, the error is logged to the console but **the UI does not revert** the move → potential visual vs. database desync (risk to be covered by QA).
- The updated field is `currentInterviewStep` on the **`Application`** entity (not on the `Candidate`); the same candidate may have multiple applications, which is why `applicationId` is required.
- ⚠️ Contract ambiguity: the controller internally names the parameter as *"position ID"* although semantically it receives an `applicationId`.

### 4.5 Data model involved
```
Position ──1:N── Application ──N:1── Candidate
   │                  │
   └─ InterviewFlow ──┴── currentInterviewStep ──> InterviewStep (id, name, orderIndex)
Application ──1:N── Interview (score, notes)  →  averageScore
```

---

## 5. Relevant API endpoints (summary)

| Method | Route | Feature | Usage |
|--------|-------|---------|-------|
| `GET`  | `/positions` | F2 | List visible positions |
| `GET`  | `/positions/:id/interviewflow` | **F3** | Board columns (stages) |
| `GET`  | `/positions/:id/candidates` | **F3** | Candidate cards per stage |
| `PUT`  | `/candidates/:id` | **F4** | Persist stage change |
| `GET`  | `/candidates/:id` | F6 | Candidate detail |
| `POST` | `/candidates` | F5 | Create candidate |
| `POST` | `/upload` | F7 | CV upload |

---

## 6. Detected risks and inconsistencies (for QA)

1. **Optimistic UI without *rollback*** in the stage change (F4): a network failure leaves the card moved on screen but not persisted.
2. **Matching by stage name** in F3: fragile against duplicate names or text changes.
3. **Unimplemented endpoint:** `CandidateDetails.js` calls `POST /candidates/:id/interviews` to log interviews, but **that route does not exist in the backend** (`candidateRoutes.ts` only defines `POST /`, `GET /:id`, `PUT /:id`). The "Log New Interview" feature of the detail panel is **incomplete**.
4. **Confusing parameter naming** in `updateCandidateStageController` (`applicationId` treated as "position ID").
5. **Case difference** `interviewFlow` (frontend) vs `interviewflow` (backend route).
6. **Hardcoded URLs and credentials** (`http://localhost:3010`, connection string in `schema.prisma`).

---

## 7. Acceptance criteria (focus features)

**F3 — Position page loading**
- [ ] Opening `/positions/:id` displays the position name.
- [ ] One column is rendered per interview flow stage, in order.
- [ ] Each candidate appears in the column matching their current stage.
- [ ] Each card shows the candidate's name and average score.
- [ ] If the position does not exist, the error is handled (backend `404`).

**F4 — Candidate stage change**
- [ ] Dragging a card to another column relocates it visually.
- [ ] Dropping outside a valid column produces no changes.
- [ ] The change triggers `PUT /candidates/:id` with `applicationId` and the destination stage `id`.
- [ ] A valid change persists `currentInterviewStep` on the `Application` and returns `200`.
- [ ] A nonexistent `Application` returns `404`.
- [ ] A non-numeric `applicationId` or `currentInterviewStep` returns `400`.
