# Fix Hover Buttons on Mission Control SBOM Cards

The user wants to fix the hover buttons ("Analyze" and "DETAILS") on the SBOM cards in the "Mission Control" page (`scan/page.tsx`). The current implementation causes clipping or layout issues on hover. The user requests simple buttons with proper clipping handling (likely absolute positioning).

## User Review Required
> [!NOTE]
> I will modify `scan/page.tsx`. I am focusing on the "Uploaded SBOM" section (lines 2150+).

## Proposed Changes

### Client
#### [MODIFY] [scan/page.tsx](file:///C:/Users/Aditya/SCOUT_Frontend/client/src/pages/scoutCustomPages/scan/page.tsx)
- Locate the SBOM card rendering loop in the `UploadedSBOMs` section (around lines 2195-2204).
- Change the container of the buttons to be absolutely positioned (`absolute inset-x-0 bottom-0`) to overlay the bottom of the card on hover. This prevents layout shifts and clipping.
- Style "DETAILS" as a button (was a `div` with text).
- Style "Analyze" as a button.
- Ensure buttons are small and simple (ghost/outline) as per "simple, no buttton" request (interpreted as minimal styling).
- Ensure z-indexing is correct.

## Verification Plan
### Manual Verification
- Navigate to "Mission Control" (Scan Dashboard).
- Hover over the "Uploaded SBOM" cards (e.g., "client1.0").
- Verify that "Analyze" and "DETAILS" buttons appear.
- Verify they overlay the card bottom properly without growing the card or clipping options.
- Verify they are clickable.
