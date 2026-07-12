# CLAUDE.md

Technical guide for the **LTI - Talent Tracking System** project. A full-stack applicant tracking system (ATS) for managing candidates and recruitment processes.

This document summarizes the technical architecture and establishes a clear separation between **backend** and **frontend**. Complementary documentation in the repo:
- `README.md` — setup instructions (EN/ES) and EC2/GitHub Actions deployment.
- `backend/api-spec.yaml` — OpenAPI specification of the endpoints.
- `backend/ModeloDatos.md` — data model description and diagram.
- `backend/ManifestoBuenasPracticas.md` — best-practices guide.

---

## Overview

- **Monorepo** with two independent applications: `backend/` and `frontend/`, each with its own `package.json`.
- A root `package.json` exists only for `dotenv` and to point Prisma at the schema (`backend/prisma/schema.prisma`).
- **PostgreSQL** database managed via `docker-compose.yml` (service `db`, image `postgres`).
- Shared language: **TypeScript** (backend is pure TS; frontend mixes `.tsx`/`.ts` with legacy `.js` files from Create React App).

| Aspect         | Backend                          | Frontend                              |
|----------------|----------------------------------|---------------------------------------|
| Runtime        | Node.js                          | Browser (React)                       |
| Framework      | Express 4                        | React 18 (Create React App)           |
| Language       | TypeScript 4.9                   | TypeScript 4.9 + JS (CRA)             |
| Port           | `3010`                           | `3000`                                |
| ORM / Data     | Prisma 5 + PostgreSQL            | `fetch` to the backend API            |
| Tests          | Jest + ts-jest                   | Jest + React Testing Library          |

---

## Backend

Location: `backend/`. An **Express application written in TypeScript**, using a layered architecture (inspired by DDD / hexagonal architecture).

### Stack and dependencies
- **Express** `^4.19.2` — HTTP server and routing.
- **Prisma** `^5.13.0` (`@prisma/client`) — ORM over PostgreSQL.
- **cors** `^2.8.5` — CORS restricted to `http://localhost:3000`.
- **multer** `^1.4.5-lts.1` — file uploads (CVs/résumés).
- **dotenv** `^16.4.5` — environment variables.
- **swagger-jsdoc** + **swagger-ui-express** — API documentation.
- Dev: **TypeScript** `^4.9.5`, **ts-node**, **ts-node-dev**, **Jest** `^29` + **ts-jest**, **ESLint** `^9`, **Prettier**.

### TypeScript configuration (`backend/tsconfig.json`)
- `target: es5`, `module: commonjs`, `strict: true`, `esModuleInterop: true`.
- Compilation output in `./dist`. Includes `src/**/*.ts`.

### Folder structure (`backend/src/`)
Layered architecture:
- **`index.ts`** — entry point. Creates the Express app, configures middlewares (JSON parsing, `prisma` injection into `req`, CORS, request logging, error handling) and mounts the routes. Listens on port **3010**.
- **`domain/models/`** — domain models / business logic: `Candidate`, `Education`, `WorkExperience`, `Resume`, `Company`, `Employee`, `Position`, `Application`, `Interview`, `InterviewFlow`, `InterviewStep`, `InterviewType`.
- **`application/services/`** — application logic / use cases: `candidateService.ts`, `positionService.ts`, `fileUploadService.ts`, `validator.ts`.
- **`presentation/controllers/`** — controllers translating HTTP ↔ services: `candidateController.ts`, `positionController.ts`.
- **`routes/`** — Express route definitions: `candidateRoutes.ts`, `positionRoutes.ts`.
- **`tests/`** — tests (in addition to `*.test.ts` files co-located with the code in `application/` and `presentation/`).
- **`prisma/`** — `schema.prisma` (data model) and `seed.ts` (sample data).

### REST API (endpoints)
Base: `http://localhost:3010`

**Candidates** (`/candidates`):
- `POST /candidates` — creates a candidate (with nested educations, workExperiences, and cv). Returns `201`.
- `GET /candidates/:id` — retrieves a candidate by id.
- `PUT /candidates/:id` — updates the candidate's stage.

**Positions** (`/positions`):
- `GET /positions` — lists all positions.
- `GET /positions/:id/candidates` — candidates for a position.
- `GET /positions/:id/interviewflow` — interview flow for a position.

**Other**:
- `POST /upload` — file upload (multer).
- `GET /` — healthcheck (`"Hola LTI!"`).

### Data model (Prisma / PostgreSQL)
Main entities and relationships (`backend/prisma/schema.prisma`):
- **`Candidate`** 1—N `Education`, `WorkExperience`, `Resume`, `Application`.
- **`Company`** 1—N `Employee` and `Position`.
- **`Position`** belongs to a `Company` and an `InterviewFlow`; 1—N `Application`.
- **`InterviewFlow`** 1—N `InterviewStep`; `InterviewStep` references an `InterviewType`.
- **`Application`** links `Candidate` ↔ `Position`, with a `currentInterviewStep` and 1—N `Interview`.
- **`Interview`** references `Application`, `InterviewStep`, and `Employee`; stores result/score/notes.

Prisma generator with `binaryTargets = ["native", "debian-openssl-3.0.x"]`.
> ⚠️ The DB URL is **hardcoded** in `schema.prisma` (`postgresql://LTIdbUser:...@localhost:5432/LTIdb`). It should be moved to `DATABASE_URL` in `.env`.

### Scripts (`backend/package.json`)
- `npm run dev` — development with `ts-node-dev` (respawn + transpile-only).
- `npm run build` — compiles TS with `tsc` to `dist/`.
- `npm start` — runs `node dist/index.js`.
- `npm run start:prod` — build + start.
- `npm test` — Jest.
- `npm run prisma:generate` — generates the Prisma client.

### Prisma commands (DB setup)
```
npx prisma generate
npx prisma migrate dev
ts-node seed.ts
```

---

## Frontend

Location: `frontend/`. A **React 18 SPA** created with **Create React App** (`react-scripts` 5).

### Stack and dependencies
- **React** `^18.3.1` + **react-dom** `^18.3.1`.
- **react-router-dom** `^6.23.1` — SPA routing.
- **react-bootstrap** `^2.10.2` + **bootstrap** `^5.3.3` + **react-bootstrap-icons** — UI.
- **react-beautiful-dnd** `^13.1.1` and **react-dnd** + **react-dnd-html5-backend** `^16` — drag & drop (moving candidates across stages / Kanban columns).
- **react-datepicker** `^6.9.0` — date selection.
- **web-vitals**, **dotenv**.
- Tests: **@testing-library/react** `^13.4.0`, **@testing-library/jest-dom**, **@testing-library/user-event**, **Jest**.
- **TypeScript** `^4.9.5` (coexists with `.js` components).

### Structure (`frontend/src/`)
- **`index.tsx`** — React mount point.
- **`App.js`** — defines routing (`BrowserRouter` / `Routes`).
- **`components/`** — UI components:
  - `RecruiterDashboard.js` — main dashboard.
  - `AddCandidateForm.js` — candidate creation form.
  - `Positions.tsx` — positions listing (with filters and cards).
  - `PositionDetails.js` — position detail / process view.
  - `CandidateCard.js`, `CandidateDetails.js`, `StageColumn.js` — cards and columns of the (Kanban) flow.
  - `FileUploader.js` — CV upload.
- **`services/candidateService.js`** — calls to the backend API.
- **`assets/`**, `App.css`, `index.css`, `logo.svg` — static assets and styles.
- **`public/`** — HTML and static images.
- **`build/`** — production build.

### SPA routes (`App.js`)
- `/` → `RecruiterDashboard`
- `/add-candidate` → `AddCandidateForm`
- `/positions` → `Positions`
- `/positions/:id` → `PositionDetails`

### Backend communication
The frontend consumes the API via `fetch` pointing directly at `http://localhost:3010` (hardcoded URL, e.g. in `Positions.tsx`). No proxy is configured; the backend CORS allows the `http://localhost:3000` origin.

### Scripts (`frontend/package.json`)
- `npm start` — CRA development server (port 3000).
- `npm run build` — production build.
- `npm test` — Jest (`jest --config jest.config.js`).
- ESLint extends `react-app` / `react-app/jest`.

---

## Infrastructure and environment

### Docker / PostgreSQL (`docker-compose.yml`)
Service `db` with the `postgres` image. Parameterized by environment variables:
- `POSTGRES_USER=${DB_USER}`, `POSTGRES_PASSWORD=${DB_PASSWORD}`, `POSTGRES_DB=${DB_NAME}`
- Exposed port: `${DB_PORT}:5432`

Start: `docker-compose up -d` · Stop: `docker-compose down`.
Default connection details (README): host `localhost`, port `5432`, user `postgres`, password `password`, db `mydatabase`.

### Environment variables
- Backend: `.env` with `DATABASE_URL=postgresql://user:password@localhost:5432/mydatabase`.
- Docker: `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`.

### Deployment (README)
- **EC2** instance (Amazon Linux 2 / Ubuntu), Node.js 16, **PM2**, optionally **Nginx**.
- Security ports: 22 (SSH), 80 (HTTP), 8080 (backend).
- **CI/CD** via **GitHub Actions**; required secrets: `AWS_ACCESS_ID`, `AWS_ACCESS_KEY`, `EC2_INSTANCE`.
- Workflow: develop on a fork, validate build/tests/deploy before opening a PR.

---

## Quick start

```sh
# 1. Install dependencies
cd frontend && npm install
cd ../backend && npm install

# 2. Bring up the database
docker-compose up -d

# 3. Set up Prisma (from backend/)
npx prisma generate && npx prisma migrate dev && ts-node seed.ts

# 4. Backend (port 3010)
cd backend && npm run build && npm start   # or: npm run dev

# 5. Frontend (port 3000)
cd frontend && npm start
```

---

## Notes and technical debt

- **Hardcoded DB credentials** in `backend/prisma/schema.prisma`; should use `env("DATABASE_URL")`.
- **Hardcoded backend URLs** in the frontend (`http://localhost:3010`); should use an environment variable (`REACT_APP_API_URL`).
- The frontend **mixes `.js` and `.tsx`**; TypeScript migration is incomplete.
- Test convention: `*.test.ts(x)` files are co-located with the code in addition to the `tests/` folder.
