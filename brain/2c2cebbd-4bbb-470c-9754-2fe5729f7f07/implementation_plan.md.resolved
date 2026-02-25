# Scout DB Frontend Implementation Plan

## User Review Required
> [!IMPORTANT]
> This plan involves creating a new `frontend` directory and modifying the backend to allow CORS.
> I will be using port 8666 for the API as specified in the plan.

## Proposed Changes

### Backend (`c:/SCOUTNEW/scout_db/src/scout_db`)

#### [MODIFY] [main.py](file:///c:/SCOUTNEW/scout_db/src/scout_db/main.py)
- Add `CORSMiddleware` to allow requests from `http://localhost:5173` (Vite default).

### Frontend (`c:/SCOUTNEW/scout_db/frontend`)

#### [NEW] Project Initialization
- Create React + TypeScript project using Vite.
- Install dependencies: `axios`, `react-router-dom`, `@tanstack/react-query`, `lucide-react`, `clsx`, `tailwind-merge`.
- Setup Tailwind CSS with a dark theme palette (Zinc/Slate).

#### [NEW] src/lib/api.ts
- Axios instance configured with `baseURL: 'http://localhost:8666/api/v1'`.

#### [NEW] src/components/Layout.tsx
- Main layout with a Sidebar navigation and Header.
- specialized for "Dark" aesthetic (bg-zinc-950, text-zinc-100).

#### [NEW] src/pages/Overrides/OverrideList.tsx
- Table view for `/overrides` endpoint.
- Columns: Vulnerability ID, Status, Created By, Created At.

#### [NEW] src/pages/Overrides/OverrideForm.tsx
- Form for creating/editing overrides.
- Fields: Vulnerability ID, Reason, Fields (dynamic list).

#### [NEW] src/App.tsx
- Route inclusions for `/overrides`, `/overrides/new`, `/overrides/:id`.

## Verification Plan

### Automated Tests
- Run `npm run dev` to start the frontend.
- Backend should be running on port 8666 (I can try to start it or assume user has it running, but I will focus on frontend).

### Manual Verification
1.  **Start Backend**: Ensure `scout_db` is running on port 8666.
2.  **Start Frontend**: `npm run dev` in `frontend` directory.
3.  **Navigate**: Go to `http://localhost:5173`.
4.  **Check Layout**: Verify dark theme and sidebar.
5.  **Test Overrides**:
    - Go to "Overrides" page.
    - Click "Create Override".
    - Fill form and submit.
    - Verify it appears in the list.
