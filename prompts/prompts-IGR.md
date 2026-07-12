# Prompts — IGR

Registro de los prompts utilizados durante el desarrollo del proyecto.

## Prompt 1:

Agent: Claude Code - Sonnet 4.6

### Request:

Como Tech Lead, experto en tecnologías front y back con Node.js y Typescript, quiero que analices la parte técnica de este proyecto (incluyendo el README.md) y guarda en un fichero CLAUDE.md toda esa información técnica, siendo claro en la separación entre backend y frontend.

### Response:

Se ha generado un fichero **CLAUDE.md** con las especificaciones técnicas del proyecto.

</br>

## Prompt 2:

Agent: Claude Code - Sonnet 4.6

### Request:

Como experto Product Owner analiza todo el codigo PRD.md (documento de requisitos de producto) en la raíz del proyecto con la descripción de las funcionalidades principales. Es importante, sobre todo, que identifiques y describas correctamente toda aquella funcionalidad que se utilice en: 'Carga de la Página de Position' y 'Cambio de Fase de un Candidato'.

### Response:

Se ha generado un fichero **PRD.md** con las funcionalidades principales para el proyecto.

</br>

## Prompt 3:

Agent: Claude Code - Sonnet 4.6

### Request:

@.claude/commands/user-stories.md El fichero PRD.md actúa como PRD con todos los links a la información necesaria que define las funcionalidades clave para crear un sistema ATS (Applicant-Tracking System). Define las user stories principales. Idioma para las user stories: inglés. La terminología debe ser acorde al sector ATS. Cubre sólo estos dominios o funcionalidades: 'Position page loading' y 'Candidate stage change'.

### Response:

Se ha generado 7 user stories y, añadido en la carpeta LTI-IGR/user-stories.

</br>

## Prompt 4:

Agent: Claude Code - Sonnet 4.6

### Request:

Como Product Manager del proyecto AI4Devs y experto en BDD, tengo estas historias de usuario 'LTI-IGR/user-stories'. Genera escenarios BDD en formato Gherkin (Feature + Scenarios) cubriendo los principales caminos, ya sea el caso feliz como posibles errores.

Reglas: un único When por escenario, lenguaje del dominio (no UI), evita 'click' o IDs técnicos. Usa Scenario Outline si los casos comparten estructura.

### Response:

Se han generado las features 'features/candidate-stage-change' y 'features/position-page-loading'.

</br>

## Prompt 5:

Agent: Claude Code - Sonnet 4.6

### Request:

¿Puedes verificar que se cumplen estos requisitos en los .features?

Debes crear pruebas E2E para verificar los siguientes escenarios:

1. Carga de la Página de Position:

- Verifica que el título de la posición se muestra correctamente.
- Verifica que se muestran las columnas correspondientes a cada fase del proceso de contratación.
- Verifica que las tarjetas de los candidatos se muestran en la columna correcta según su fase actual.

2. Cambio de Fase de un Candidato:

- Simula el arrastre de una tarjeta de candidato de una columna a otra.
- Verifica que la tarjeta del candidato se mueve a la nueva columna.
- Verifica que la fase del candidato se actualiza correctamente en el backend mediante el endpoint PUT /candidate/:id.

### Response:

Verification that the requested E2E scenarios are covered by the Gherkin `.feature` files in `LTI-IGR/features/`.

## 1. Position page loading

| Requirement | Scenario in `.feature` | Status |
| --- | --- | --- |
| Position title is displayed correctly | `position-page-loading.feature` → _"Recruiter opens a position and sees its interview pipeline"_ → `the pipeline is titled with the position name "Senior Backend Engineer"` | ✅ |
| Columns for each hiring-process stage are displayed | same scenario → `the pipeline shows the stages in this order` | ✅ |
| Candidate cards appear in the correct column per current stage | `Candidates are shown in their current stage` → _Alice in Initial Screening; Bob & Carol in Technical Interview_ | ✅ |

## 2. Candidate stage change

| Requirement | Scenario in `.feature` | Status |
| --- | --- | --- |
| Simulate dragging a candidate card from one column to another | `candidate-stage-change.feature` → `Recruiter advances a candidate to the next stage` (`moves … to the "Technical Interview" stage`) | ✅ |
| The candidate card moves to the new column | same scenario → `is shown in the "Technical Interview" stage` | ✅ |
| The candidate's stage is updated in the backend via `PUT /candidates/:id` | same scenario → `the candidate's current stage is saved as "Technical Interview"` (expressed in domain language) | ✅ |

**Result:** all requested requirements are covered by the feature files.

</br>

## Prompt 6:

Agent: Claude Code - Sonnet 4.6

### Request:

Lee 'features/candidate-stage-change.feature' y 'features/position-page-loading.feature' y genera los step definitions en TypeScript. Recuerda que el código y comentarios deben ser implemntados en inglés.

### Response:

Se han generado los step-definitions.

</br>
