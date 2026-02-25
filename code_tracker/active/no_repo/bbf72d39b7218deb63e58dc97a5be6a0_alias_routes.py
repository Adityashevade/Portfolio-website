þ."""API routes for package alias management."""

from typing import Annotated

from fastapi import APIRouter, HTTPException, Query

from scout_db.models.alias import (
    AliasExport,
    AliasImportRequest,
    AliasImportResult,
    AliasLookupResult,
    PackageAlias,
    PackageAliasCreate,
    PackageAliasUpdate,
)
from scout_db.services.alias_service import alias_service

router = APIRouter(prefix="/api/v1", tags=["aliases"])


# =============================================================================
# Alias CRUD Endpoints
# =============================================================================


@router.post("/aliases", response_model=PackageAlias, status_code=201)
async def create_alias(data: PackageAliasCreate) -> PackageAlias:
    """
    Create a new package alias mapping.

    Maps alternative package names (aliases) to a canonical package name
    within a specific ecosystem. When querying for vulnerabilities,
    all aliases will be expanded to find matches.

    Example:
        Create an alias for log4j Maven artifacts:
        ```json
        {
            "ecosystem": "maven",
            "canonical_name": "log4j",
            "aliases": ["log4j-core", "log4j-api"],
            "bidirectional": true,
            "created_by": "analyst@example.com",
            "reason": "Log4j Maven artifacts share vulnerabilities"
        }
        ```
    """
    try:
        return await alias_service.create_alias(data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from None


@router.get("/aliases")
async def list_aliases(
    ecosystem: Annotated[
        str | None, Query(description="Filter by ecosystem (npm, pypi, maven, etc.)")
    ] = None,
    canonical_name: Annotated[
        str | None, Query(description="Filter by canonical package name")
    ] = None,
    created_by: Annotated[str | None, Query(description="Filter by creator")] = None,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=500)] = 50,
) -> dict:
    """List package aliases with optional filters."""
    items = await alias_service.list_aliases(
        ecosystem=ecosystem,
        canonical_name=canonical_name,
        created_by=created_by,
        skip=skip,
        limit=limit,
    )
    return {"items": items, "total": len(items)}


@router.get("/aliases/{alias_id}", response_model=PackageAlias)
async def get_alias(alias_id: str) -> PackageAlias:
    """Get a single alias by ID."""
    alias = await alias_service.get_alias(alias_id)
    if not alias:
        raise HTTPException(status_code=404, detail=f"Alias {alias_id} not found")
    return alias


@router.put("/aliases/{alias_id}", response_model=PackageAlias)
async def update_alias(alias_id: str, data: PackageAliasUpdate) -> PackageAlias:
    """Update an existing alias."""
    try:
        alias = await alias_service.update_alias(alias_id, data)
        if not alias:
            raise HTTPException(status_code=404, detail=f"Alias {alias_id} not found")
        return alias
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from None


@router.delete("/aliases/{alias_id}", status_code=204)
async def delete_alias(alias_id: str) -> None:
    """Delete an alias."""
    deleted = await alias_service.delete_alias(alias_id)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Alias {alias_id} not found")


# =============================================================================
# Lookup Endpoint
# =============================================================================


@router.get("/aliases/lookup/{ecosystem}/{package}", response_model=AliasLookupResult)
async def lookup_alias(ecosystem: str, package: str) -> AliasLookupResult:
    """
    Resolve a package name to all its aliases.

    Given a package name, returns all package names that should be searched
    when looking for vulnerabilities. This includes:
    - The original package name
    - The canonical name (if the input was an alias)
    - All other aliases in the group (if bidirectional is enabled)

    Example:
        `GET /api/v1/aliases/lookup/maven/log4j-core`

        If an alias exists mapping log4j â†’ [log4j-core, log4j-api] with bidirectional=true,
        this will return:
        ```json
        {
            "original_package": "log4j-core",
            "expanded_packages": ["log4j", "log4j-core", "log4j-api"],
            "alias_id": "...",
            "canonical_name": "log4j"
        }
        ```
    """
    return await alias_service.resolve(ecosystem, package)


# =============================================================================
# Import/Export Endpoints
# =============================================================================


@router.get("/aliases/export", response_model=AliasExport)
async def export_aliases(
    ecosystem: Annotated[
        str | None, Query(description="Filter by ecosystem")
    ] = None,
) -> AliasExport:
    """
    Export aliases as JSON for backup or transfer.

    Optionally filter by ecosystem.
    """
    aliases = await alias_service.export_aliases(ecosystem=ecosystem)
    return AliasExport(total=len(aliases), aliases=aliases)


@router.post("/aliases/import", response_model=AliasImportResult, status_code=201)
async def import_aliases(
    data: AliasImportRequest,
) -> AliasImportResult:
    """
    Import aliases from JSON.

    Creates new aliases or updates existing ones (matched by ecosystem + canonical_name).

    Example request body:
    ```json
    {
        "aliases": [
            {
                "ecosystem": "maven",
                "canonical_name": "log4j",
                "aliases": ["log4j-core", "log4j-api"],
                "bidirectional": true,
                "reason": "Log4j Maven artifacts"
            }
        ],
        "created_by": "import-script@example.com"
    }
    ```
    """
    return await alias_service.import_aliases(data.aliases, data.created_by)
þ.*cascade082=file:///c:/SCOUTNEW/scout_db/src/scout_db/api/alias_routes.py