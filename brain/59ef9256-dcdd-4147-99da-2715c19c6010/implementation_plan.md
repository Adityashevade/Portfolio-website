# Kaleido UI Redesign Plan

## Goal
Revamp the entire frontend UI to match the "Kaleido" aesthetic: a premium dark theme with cyan accents, glassmorphism, and rounded pill navigation.

## Design Specs (Inferred from Screenshot)
- **Background**: Deep dark blue/black (approx `#0f111a` or `slate-950`).
- **Cards**: Dark, semi-transparent with subtle borders (`bg-slate-900/50`, `border-slate-800`).
- **Accent**: Bright Cyan/Teal (`#22d3ee` / `cyan-400`).
- **Sidebar**: Dark column, active state is a full-width or rounded pill with solid cyan background and black text.
- **Typography**: Clean, sans-serif (Inter/SF Pro), white text (`text-slate-50`, `text-slate-400`).

## Proposed Changes

### 1. Global Theme Updates
#### [MODIFY] [index.css](file:///c:/SCOUTNEW/scout_db/frontend/src/index.css)
- Override `:root` variables to default to the dark theme palette.
- Set `background` to deep dark space blue.
- Set `primary` to Cyan.

### 2. Layout & Navigation
#### [MODIFY] [Layout.tsx](file:///c:/SCOUTNEW/scout_db/frontend/src/components/Layout.tsx)
- **Sidebar**: Redesign to match the "Kaleido" sidebar (floating pills or solid block).
- **Header**: Simplify and blend with the background.

### 3. Dashboard Redesign
#### [MODIFY] [Dashboard.tsx](file:///c:/SCOUTNEW/scout_db/frontend/src/pages/Dashboard/Dashboard.tsx)
- **Stats Cards**: Update to look like the "Block Explorer" cards (dark bg, icon on left, big numbers).
- **Activity Section**: Style as "Latest Blocks" / "Transactions" panels.

### 4. Component Updates
#### [MODIFY] [Card.tsx] / [Table.tsx]
- Ensure standard UI components inherit the transparency and border styles correctly.

### 5. Theme Support (Dark/Light Mode)
#### [MODIFY] [index.css](file:///c:/SCOUTNEW/scout_db/frontend/src/index.css)
- Restore standard light mode variables in `:root`.
- Ensure `.dark` class contains the Kaleido dark theme.

#### [NEW] [ThemeProvider.tsx](file:///c:/SCOUTNEW/scout_db/frontend/src/components/theme-provider.tsx)
- Create a React Context to manage `theme` state ('light', 'dark', 'system').
- Persist preference to `localStorage`.
- Apply `dark` class to `html` element.

#### [NEW] [ModeToggle.tsx](file:///c:/SCOUTNEW/scout_db/frontend/src/components/mode-toggle.tsx)
- Create a dropdown or toggle button to switch themes.

#### [MODIFY] [Layout.tsx](file:///c:/SCOUTNEW/scout_db/frontend/src/components/Layout.tsx)
- Add `ModeToggle` to the header.

### 6. Refactor Override Creation
#### [MODIFY] [routes.py](file:///c:/SCOUTNEW/scout_db/src/scout_db/api/routes.py)
- Update `search_vulnerabilities` to accept `search_query` or `id_pattern` to filter by Vulnerability ID (regex match).

#### [NEW] [components/ui/command.tsx](file:///c:/SCOUTNEW/scout_db/frontend/src/components/ui/command.tsx)
- Install `cmdk` (`npm install cmdk`).
- Create Shadcn/UI Command component.

#### [NEW] [VulnerabilityPicker.tsx](file:///c:/SCOUTNEW/scout_db/frontend/src/components/shared/VulnerabilityPicker.tsx)
- Create a reusable Combobox component.
- Use the new backend search capability to filter vulnerabilities by ID.

#### [MODIFY] [OverrideForm.tsx](file:///c:/SCOUTNEW/scout_db/frontend/src/pages/Overrides/OverrideForm.tsx)
- Replace the simple text input for `id` (vulnerability_id) with the `VulnerabilityPicker`.

## Verification Plan
### Visual Inspection
- Check Sidebar interactions and active states.
- Verify color contrast and readability.
- Ensure the "Mission Control" (now Dashboard) looks premium.
- **Theme Switching**: Verify switching between light and dark modes works and persists on reload.
