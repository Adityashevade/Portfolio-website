# Walkthrough - Verify Hover Button Fix in Mission Control

I have updated the "Mission Control" page (Scout Scan Dashboard) to fix the hover button layout. The buttons "Analyze" and "DETAILS" now appear on the right side of the card footer using a gradient overlay, ensuring the date on the left remains visible.

## Verification Steps

1.  **Navigate to Mission Control**
    - Go to the Scout Module.
    - Navigate to the main "Scan" dashboard.
    - Locate the **Uploaded SBOM** section.

2.  **Test Hover Interaction**
    - Hover over an SBOM card (e.g., `client1.0`).
    - **Observe**:
        - "Analyze" and "DETAILS" buttons appear on the right.
        - The date (e.g., "10/25/2023") on the left stays visible.
        - The overlay uses a transparency gradient so it doesn't abruptly cut off the date.
        - No layout shifting occurs.

3.  **Click Test**
    - Verify buttons are clickable.

## Changes Made
- Modified `scan/page.tsx`.
- Changed hover container to `bg-gradient-to-l from-card via-card to-transparent pl-12`.
- Maintained absolute positioning for stability.
