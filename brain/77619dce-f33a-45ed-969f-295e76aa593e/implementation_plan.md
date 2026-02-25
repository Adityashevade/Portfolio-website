# Implement Side Drawers for Details

## Goal
Replace navigation to detail pages with a 90% width side drawer on "Dependencies" and "Vulnerabilities" pages, rendering the exact same detail component inside the drawer.

## Proposed Changes

### 1. `client/src/pages/scoutCustomPages/_detail-pages/dependency/dependency-detail-client.tsx`
- Update `DependencyDetailClientProps` to include optional `onBack: () => void`.
- Update component to use `onBack` if provided, otherwise `window.history.back()`.

### 2. `client/src/pages/scoutCustomPages/dependencies/dependencies-page-client.tsx`
- Import `DependencyDetailClient`.
- Add state `selectedDependencyId` and `isDrawerOpen`.
- Find `Link` or `onClick` that navigates to details.
- Replace with handler that sets `selectedDependencyId` and opens drawer.
- Render `Sheet` component (90% width) containing `DependencyDetailClient`.

### 3. `client/src/pages/scoutCustomPages/vulnerabilities/vulnerabilities-page-client.tsx`
- Import `VulnerabilityDetailClient`.
- Add state `selectedVulnerabilityId` and `isDrawerOpen`.
- Find `Link` or `onClick` that navigates to details.
- Replace with handler that sets `selectedVulnerabilityId` and opens drawer.
- Render `Sheet` component (90% width) containing `VulnerabilityDetailClient`.
