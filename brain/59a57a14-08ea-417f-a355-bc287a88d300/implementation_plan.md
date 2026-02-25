### scout_db/frontend/src/components

#### [MODIFY] [VulnerabilityEditForm.tsx](file:///c:/SCOUTNEW/scout_db/frontend/src/components/VulnerabilityEditForm.tsx)

- Refactor "Affected Packages" section to use a single row for Ecosystem, Package Name, and Versions.
- Use `flex flex-wrap md:flex-nowrap` for responsive behavior, allowing fields to adapt to their content size.
- Fix the logic that defaults Ecosystem to "unknown" when the package name is provided as a string. Instead, check for `item.ecosystem` or use a more robust fallback.

## Verification Plan

### Automated Tests
- Run `npm run build` or `npx tsc` to ensure no regressions.

### Manual Verification
- Check the "Affected Packages" section in the Create/Edit Override sheet.
- Verify that Ecosystem, Package Name, and Versions are aligned on the same row.
- Verify that the Ecosystem correctly shows from the database (e.g., "PyPI", "npm") instead of "unknown".
- Verify that long version lists or package names wrap or adapt correctly.
