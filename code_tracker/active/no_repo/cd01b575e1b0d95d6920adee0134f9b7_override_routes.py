ÅL"""API routes for vulnerability override management."""

from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import JSONResponse

from scout_db.models.override import (
    AuditAction,
    BulkOverrideCreate,
    BulkOverrideResult,
    OverrideAuditEntry,
    OverrideExport,
    OverrideStatus,
    VulnerabilityOverride,
    VulnerabilityOverrideCreate,
    VulnerabilityOverrideUpdate,
)
from scout_db.models.vulnerability import Vulnerability
from scout_db.services.override_service import override_service

router = APIRouter(prefix="/api/v1", tags=["overrides"])


# =============================================================================
# Override CRUD Endpoints
# =============================================================================


@router.post("/overrides", response_model=VulnerabilityOverride, status_code=201)
async def create_override(data: VulnerabilityOverrideCreate) -> JSONResponse:
    """
    Create a new vulnerability override.

    Returns the created override and any conflict warnings.
    """
    try:
        override, warnings = await override_service.create_override(data)
        response_data = override.model_dump(mode="json")
        if warnings:
            response_data["_warnings"] = [w.model_dump(mode="json") for w in warnings]
        return JSONResponse(status_code=201, content=response_data)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e)) from None


@router.get("/overrides")
async def list_overrides(
    vulnerability_id: Annotated[
        str | None, Query(description="Filter by vulnerability ID")
    ] = None,
    status: Annotated[OverrideStatus | None, Query(description="Filter by status")] = None,
    created_by: Annotated[str | None, Query(description="Filter by creator")] = None,
    created_after: Annotated[
        datetime | None, Query(description="Created after this date")
    ] = None,
    created_before: Annotated[
        datetime | None, Query(description="Created before this date")
    ] = None,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=500)] = 50,
) -> dict:
    """List overrides with optional filters."""
    items = await override_service.list_overrides(
        vulnerability_id=vulnerability_id,
        status=status,
        created_by=created_by,
        created_after=created_after,
        created_before=created_before,
        skip=skip,
        limit=limit,
    )
    return {"items": items, "total": len(items)}


@router.get("/overrides/{override_id}", response_model=VulnerabilityOverride)
async def get_override(override_id: str) -> VulnerabilityOverride:
    """Get a single override by ID."""
    override = await override_service.get_override(override_id)
    if not override:
        raise HTTPException(status_code=404, detail=f"Override {override_id} not found")
    return override


@router.put("/overrides/{override_id}", response_model=VulnerabilityOverride)
async def update_override(override_id: str, data: VulnerabilityOverrideUpdate) -> JSONResponse:
    """
    Update an existing override.

    Returns the updated override and any conflict warnings.
    """
    try:
        override, warnings = await override_service.update_override(override_id, data)
        if not override:
            raise HTTPException(
                status_code=404, detail=f"Override {override_id} not found"
            )
        response_data = override.model_dump(mode="json")
        if warnings:
            response_data["_warnings"] = [w.model_dump(mode="json") for w in warnings]
        return JSONResponse(content=response_data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from None


@router.delete("/overrides/{override_id}", response_model=VulnerabilityOverride)
async def revert_override(
    override_id: str,
    actor: Annotated[str, Query(description="User performing the revert")] = "anonymous",
) -> VulnerabilityOverride:
    """
    Revert (soft-delete) an override.

    The override status is changed to 'reverted' and it will no longer be applied.
    """
    override = await override_service.revert_override(override_id, actor)
    if not override:
        raise HTTPException(status_code=404, detail=f"Override {override_id} not found")
    return override


# =============================================================================
# Vulnerability-Centric Endpoints
# =============================================================================


@router.get("/vulnerabilities/{vuln_id}/overrides", response_model=list[VulnerabilityOverride])
async def get_vulnerability_overrides(vuln_id: str) -> list[VulnerabilityOverride]:
    """List all overrides for a specific vulnerability."""
    return await override_service.get_overrides_for_vulnerability(vuln_id)


@router.get("/vulnerabilities/{vuln_id}/effective", response_model=Vulnerability)
async def get_effective_vulnerability(vuln_id: str) -> Vulnerability:
    """
    Get a vulnerability with all active overrides applied.

    Returns the corrected view of the vulnerability data.
    """
    result = await override_service.get_effective_vulnerability(vuln_id)
    if not result:
        raise HTTPException(status_code=404, detail=f"Vulnerability {vuln_id} not found")
    return Vulnerability(**result)


@router.get("/vulnerabilities/{vuln_id}/diff")
async def get_vulnerability_diff(vuln_id: str) -> dict:
    """
    Compare raw vs corrected vulnerability data.

    Returns both the original and effective (corrected) data for comparison.
    """
    result = await override_service.get_vulnerability_diff(vuln_id)
    if not result:
        raise HTTPException(status_code=404, detail=f"Vulnerability {vuln_id} not found")
    return result


# =============================================================================
# Bulk Operations
# =============================================================================


@router.post("/overrides/bulk", response_model=BulkOverrideResult, status_code=201)
async def bulk_create_overrides(data: BulkOverrideCreate) -> BulkOverrideResult:
    """
    Create multiple overrides at once.

    Returns summary of created overrides and any errors.
    """
    created, errors = await override_service.bulk_create_overrides(data.overrides)
    return BulkOverrideResult(
        created=len(created),
        failed=len(errors),
        errors=errors,
        override_ids=[o.id for o in created],
    )


@router.get("/overrides/export", response_model=OverrideExport)
async def export_overrides(
    vulnerability_id: Annotated[
        str | None, Query(description="Filter by vulnerability ID")
    ] = None,
    status: Annotated[OverrideStatus | None, Query(description="Filter by status")] = None,
) -> OverrideExport:
    """
    Export overrides as JSON for backup or transfer.

    Optionally filter by vulnerability ID or status.
    """
    overrides = await override_service.export_overrides(
        vulnerability_id=vulnerability_id, status=status
    )
    return OverrideExport(total=len(overrides), overrides=overrides)


@router.post("/overrides/import", response_model=BulkOverrideResult, status_code=201)
async def import_overrides(
    data: OverrideExport,
    actor: Annotated[str, Query(description="User performing the import")] = "anonymous",
) -> BulkOverrideResult:
    """
    Import overrides from a JSON backup.

    Creates new overrides based on the imported data.
    """
    override_dicts = [o.model_dump() for o in data.overrides]
    created, errors = await override_service.import_overrides(override_dicts, actor)
    return BulkOverrideResult(
        created=len(created),
        failed=len(errors),
        errors=errors,
        override_ids=[o.id for o in created],
    )


# =============================================================================
# Audit Endpoints
# =============================================================================


@router.get("/overrides/{override_id}/history", response_model=list[OverrideAuditEntry])
async def get_override_history(override_id: str) -> list[OverrideAuditEntry]:
    """Get the audit history for a single override."""
    # Verify override exists
    override = await override_service.get_override(override_id)
    if not override:
        raise HTTPException(status_code=404, detail=f"Override {override_id} not found")
    return await override_service.get_override_history(override_id)


@router.get("/vulnerabilities/{vuln_id}/audit", response_model=list[OverrideAuditEntry])
async def get_vulnerability_audit(vuln_id: str) -> list[OverrideAuditEntry]:
    """Get all audit entries for a vulnerability."""
    return await override_service.get_vulnerability_audit(vuln_id)


@router.get("/audit")
async def get_global_audit(
    actor: Annotated[str | None, Query(description="Filter by actor")] = None,
    action: Annotated[AuditAction | None, Query(description="Filter by action type")] = None,
    after: Annotated[datetime | None, Query(description="After this timestamp")] = None,
    before: Annotated[datetime | None, Query(description="Before this timestamp")] = None,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=500)] = 50,
) -> dict:
    """
    Get global audit log with optional filters.

    Provides visibility into all override changes across the system.
    """
    items = await override_service.get_global_audit(
        actor=actor,
        action=action,
        after=after,
        before=before,
        skip=skip,
        limit=limit,
    )
    return {"items": items, "total": len(items)}
ÅL*cascade082@file:///c:/SCOUTNEW/scout_db/src/scout_db/api/override_routes.py