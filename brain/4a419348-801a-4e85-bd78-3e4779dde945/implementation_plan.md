
# Goal Description
Enhance the Audit Log search suggestions to include vulnerability IDs from the central database (`/api/v1/vulnerabilities/search`) in addition to local Actor suggestions derived from the current audit log. This ensures the user can search for any vulnerability ID even if it hasn't appeared in the audit log yet.

## User Review Required
None. This is a direct enhancement of existing functionality.

## Proposed Changes

### Frontend
#### [MODIFY] [AuditSearchInput.tsx](file:///C:/SCOUTNEW/scout_db/frontend/src/components/shared/AuditSearchInput.tsx)
-   Import `useQuery` from `@tanstack/react-query` and `api` from `@/lib/api`.
-   Add `useDebounce` or manual debounce logic for the search query.
-   Implement a `useQuery` hook to fetch vulnerability suggestions from `/vulnerabilities/search` when the query length is >= 2.
-   Combine local suggestions (Actors from `data` prop) with remote suggestions (Vulnerabilities from API).
-   Deduplicate results if necessary.
-   Update the rendering logic to display both types of suggestions.

## Verification Plan

### Manual Verification
1.  Go to the **Audit Log** page.
2.  Type a known vulnerability ID (e.g., "GHSA") that exists in the database but might not be in the audit log.
3.  Verify that suggestions appear with a **Shield** icon.
4.  Type a known actor name that exists in the audit log.
5.  Verify that suggestions appear with a **User** icon.
6.  Select a suggestion and verify it populates the search bar.
