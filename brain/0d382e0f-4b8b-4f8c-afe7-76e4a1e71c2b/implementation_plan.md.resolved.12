# UI Optimization: Refinement of Override Creation Form

This plan details the UI changes to the "Create Override" drawer to minimize scrolling, maximize space usage, and improve the logical layout for non-technical users.

## User Review Required

> [!IMPORTANT]
> - The drawer width will be kept at 90% (standard wide drawer), but the internal form width will increase from `max-w-2xl` to `max-w-5xl` to use the extra space.
> - The layout of severity and packages will shift from a single vertical stack to a side-by-side grid.

## Proposed Changes

### [Frontend] React App

#### [MODIFY] [OverrideList.tsx](file:///c:/SCOUTNEW/scout_db/frontend/src/pages/Overrides/OverrideList.tsx)
- Remove `SheetHeader` (redundant title and description) to minimize vertical scrolling.

#### [MODIFY] [OverrideForm.tsx](file:///c:/SCOUTNEW/scout_db/frontend/src/pages/Overrides/OverrideForm.tsx)
- Increase container width from `max-w-2xl` to `max-w-5xl`.

#### [MODIFY] [VulnerabilityEditForm.tsx](file:///c:/SCOUTNEW/scout_db/frontend/src/components/VulnerabilityEditForm.tsx)
- **State Management**:
    - Add `isSummaryCollapsed` and `isMetaCollapsed` (for CVSS/Severity/Refs) states.
    - Default all to `false` (expanded).
    - Ensure all reset to `false` when `initialData` changes (new selection).
- **Layout Restructuring**:
    - **Row 1 (Summary & Details)**:
        - Collapsible header with toggle.
        - Summary and Details fields in 2-column grid when expanded.
    - **Row 2 (CVSS, Severity, References)**:
        - Collapsible header with toggle.
        - CVSS Score, Severity Level, and References list in a row when expanded.
    - **Row 3 (Affected Packages)**:
        - Header (no toggle).
        - Affected Packages list (always expanded).

## Verification Plan

### Manual Verification
1.  **Search Reset**: Search for a vulnerability ID. Verify "Affected Packages" and "References" are expanded.
2.  **Pagination Check**: Verify pagination controls show "Page 1 of X" and allow navigating through packages.
3.  **Cross-Search Persistence**: Navigate to page 2 of packages, then search for a DIFFERENT vulnerability. Verify it resets to page 1 and stays expanded.
