# Navigation State Fix

- [x] Investigate `dependencies-page-client.tsx` for state initialization from URL.
- [x] Investigate `vulnerabilities-page-client.tsx` (or equivalent) for state initialization from URL.
- [x] Investigate `vulnerability-detail-client.tsx` "Back" button implementation.
- [x] Investigate `dependency-detail-client.tsx` "Back" button implementation.
- [x] Create implementation plan to ensure URL parameters are correctly synced and restored.
- [x] Implement fixes in list pages to strictly respect URL params.
- [x] Implement fixes in detail pages to preserve history or navigate back correctly.
- [x] Verify the fix.

# SBOM Navigation Link Fix

## Problem
The "Back" button in the SBOM detail page (`sbom-detail-client.tsx`) is hardcoded to navigate to `/module/scout/sbom`. When users access the detail page from "Mission Control" (`/module/scout/scan`) or other locations, clicking "Back" sends them to the wrong page instead of returning them to their previous context.

## Solution
Replace the `<Link>` component wrapping the "Back" button with a simple button that calls `window.history.back()` on click. This will ensure the browser returns to the previous page (Mission Control) with the state preserved.

## Proposed Changes
### `client/src/pages/scoutCustomPages/_detail-pages/sbom/sbom-detail-client.tsx`
- Replace:
  ```tsx
  <Link href="/module/scout/sbom">
    <Button variant="ghost" size="sm" className="gap-2 hover:bg-muted transition-colors">
      <ArrowLeft className="w-4 h-4" />
      Back to SBOMs
    </Button>
  </Link>
  ```
- With:
  ```tsx
  <Button 
    variant="ghost" 
    size="sm" 
    className="gap-2 hover:bg-muted transition-colors"
    onClick={() => window.history.back()}
  >
    <ArrowLeft className="w-4 h-4" />
    Back
  </Button>
  ```
