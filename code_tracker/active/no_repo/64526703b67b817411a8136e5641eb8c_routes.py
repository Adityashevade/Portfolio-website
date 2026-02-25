Ü½"""API routes for Scout Registry."""

from typing import Any

from fastapi import APIRouter, HTTPException, Query

from scout_registry.db.connection import ECOSYSTEMS, database
from scout_registry.models.normalized import NormalizedPackageVersion
from scout_registry.services.package_service import PackageService
from scout_registry.storage.s3 import s3_storage

router = APIRouter(prefix="/api/v1", tags=["packages"])

# Service instance (initialized on startup)
_service: PackageService | None = None


def get_service() -> PackageService:
    """Get package service instance."""
    global _service
    if _service is None:
        _service = PackageService(database, s3_storage)
    return _service


async def init_service() -> None:
    """Initialize service (called on startup)."""
    global _service
    _service = PackageService(database, s3_storage)


async def close_service() -> None:
    """Close service (called on shutdown)."""
    global _service
    if _service:
        await _service.close()
        _service = None


# -----------------------------------------------------------------------------
# Package Summary Endpoints
# -----------------------------------------------------------------------------


@router.get("/packages")
async def search_registry_packages(
    ecosystem: str | None = Query(None, description="Filter by ecosystem"),
    license: str | None = Query(None, description="Filter by license (prefix match)"),
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
) -> dict[str, Any]:
    """Search packages across ecosystems."""
    service = get_service()
    packages = await service.search_packages(
        ecosystem=ecosystem,
        license=license,
        limit=limit,
        offset=offset,
    )
    return {
        "count": len(packages),
        "limit": limit,
        "offset": offset,
        "packages": packages,
    }


@router.get("/packages/bulk", response_model=None)
async def bulk_lookup(
    packages: str = Query(
        ...,
        description="Comma-separated list of ecosystem:name or ecosystem:name:version",
    ),
    fields: str | None = Query(None, description="Comma-separated fields to return"),
    auto_fetch: bool = Query(True, description="Fetch from registry if not in DB"),
) -> dict[str, Any]:
    """
    Bulk lookup multiple packages.

    Example: ?packages=npm:lodash:4.17.21,pypi:requests:2.28.0
    """
    service = get_service()

    # Parse packages string
    package_list = []
    for pkg_str in packages.split(","):
        parts = pkg_str.strip().split(":")
        if len(parts) >= 2:
            pkg = {"ecosystem": parts[0], "name": parts[1]}
            if len(parts) >= 3:
                pkg["version"] = parts[2]
            package_list.append(pkg)

    # Parse fields
    field_list = None
    if fields:
        field_list = [f.strip() for f in fields.split(",")]

    results = await service.bulk_lookup(package_list, field_list, auto_fetch)

    return {
        "count": len([r for r in results.values() if r is not None]),
        "results": results,
    }


# -----------------------------------------------------------------------------
# Packagist-Specific Endpoints (vendor/package format)
# Must be defined BEFORE generic /{ecosystem}/{name} routes
# -----------------------------------------------------------------------------


@router.get("/packagist/{vendor}/{package}")
async def get_packagist_package(
    vendor: str,
    package: str,
    auto_fetch: bool = Query(True, description="Fetch from registry if not in DB"),
) -> dict[str, Any]:
    """Get Packagist package summary (vendor/package format)."""
    name = f"{vendor}/{package}"
    service = get_service()
    pkg = await service.get_package("packagist", name, auto_fetch)

    if not pkg:
        raise HTTPException(status_code=404, detail=f"Package not found: packagist/{name}")

    return pkg


@router.get("/packagist/{vendor}/{package}/versions")
async def get_packagist_versions(
    vendor: str,
    package: str,
    auto_fetch: bool = Query(True, description="Fetch from registry if not in DB"),
) -> dict[str, Any]:
    """Get all versions of a Packagist package."""
    name = f"{vendor}/{package}"
    service = get_service()
    versions = await service.get_package_versions("packagist", name, auto_fetch)

    if not versions:
        raise HTTPException(status_code=404, detail=f"Package not found: packagist/{name}")

    return {
        "ecosystem": "packagist",
        "name": name,
        "count": len(versions),
        "versions": versions,
    }


@router.get("/packagist/{vendor}/{package}/{version}")
async def get_packagist_version(
    vendor: str,
    package: str,
    version: str,
    auto_fetch: bool = Query(True, description="Fetch from registry if not in DB"),
) -> dict[str, Any]:
    """Get a specific Packagist package version."""
    name = f"{vendor}/{package}"
    service = get_service()
    doc = await service.get_version("packagist", name, version, auto_fetch)

    if not doc:
        raise HTTPException(
            status_code=404,
            detail=f"Version not found: packagist/{name}@{version}",
        )

    return doc


@router.get("/packagist/{vendor}/{package}/{version}/full")
async def get_packagist_version_full(
    vendor: str,
    package: str,
    version: str,
    auto_fetch: bool = Query(True, description="Fetch from registry if not in DB"),
) -> dict[str, Any]:
    """Get Packagist version with extended data from S3."""
    name = f"{vendor}/{package}"
    service = get_service()
    doc = await service.get_version_full("packagist", name, version, auto_fetch)

    if not doc:
        raise HTTPException(
            status_code=404,
            detail=f"Version not found: packagist/{name}@{version}",
        )

    return doc


@router.get("/packagist/{vendor}/{package}/{version}/normalized")
async def get_packagist_version_normalized(
    vendor: str,
    package: str,
    version: str,
    auto_fetch: bool = Query(True, description="Fetch from registry if not in DB"),
) -> NormalizedPackageVersion:
    """Get Packagist version in normalized format."""
    name = f"{vendor}/{package}"
    service = get_service()
    normalized = await service.get_version_normalized("packagist", name, version, auto_fetch)

    if not normalized:
        raise HTTPException(
            status_code=404,
            detail=f"Version not found: packagist/{name}@{version}",
        )

    return normalized


@router.post("/packagist/{vendor}/{package}/refresh")
async def refresh_packagist_package(
    vendor: str,
    package: str,
) -> dict[str, Any]:
    """Force refresh Packagist package from registry."""
    name = f"{vendor}/{package}"
    service = get_service()
    pkg = await service.refresh_package("packagist", name)

    if not pkg:
        raise HTTPException(status_code=404, detail=f"Package not found: packagist/{name}")

    return {"message": "Package refreshed successfully", "package": pkg}


@router.post("/packagist/{vendor}/{package}/{version}/source")
async def download_packagist_source(
    vendor: str,
    package: str,
    version: str,
) -> dict[str, Any]:
    """Download Packagist source tarball and store in S3."""
    name = f"{vendor}/{package}"
    service = get_service()
    result = await service.download_source("packagist", name, version)

    if not result.get("success"):
        raise HTTPException(
            status_code=404 if "not found" in result.get("error", "").lower() else 500,
            detail=result.get("error", "Unknown error"),
        )

    return result


@router.get("/packagist/{vendor}/{package}/{version}/source")
async def get_packagist_source_status(
    vendor: str,
    package: str,
    version: str,
) -> dict[str, Any]:
    """Check if Packagist source tarball exists in S3."""
    name = f"{vendor}/{package}"
    service = get_service()
    return await service.get_source_status("packagist", name, version)


# -----------------------------------------------------------------------------
# Go-Specific Endpoints (module paths with slashes)
# Must be defined BEFORE generic /{ecosystem}/{name} routes
# Uses @v/ prefix to separate module path from version
# -----------------------------------------------------------------------------


@router.get("/go/{module_path:path}/@v/{version}")
async def get_go_version(
    module_path: str,
    version: str,
    auto_fetch: bool = Query(True, description="Fetch from registry if not in DB"),
) -> dict[str, Any]:
    """Get a specific Go module version."""
    service = get_service()
    doc = await service.get_version("go", module_path, version, auto_fetch)

    if not doc:
        raise HTTPException(
            status_code=404,
            detail=f"Version not found: go/{module_path}@{version}",
        )

    return doc


@router.get("/go/{module_path:path}/@v/{version}/full")
async def get_go_version_full(
    module_path: str,
    version: str,
    auto_fetch: bool = Query(True, description="Fetch from registry if not in DB"),
) -> dict[str, Any]:
    """Get Go module version with extended data from S3."""
    service = get_service()
    doc = await service.get_version_full("go", module_path, version, auto_fetch)

    if not doc:
        raise HTTPException(
            status_code=404,
            detail=f"Version not found: go/{module_path}@{version}",
        )

    return doc


@router.get("/go/{module_path:path}/@v/{version}/normalized")
async def get_go_version_normalized(
    module_path: str,
    version: str,
    auto_fetch: bool = Query(True, description="Fetch from registry if not in DB"),
) -> NormalizedPackageVersion:
    """Get Go module version in normalized format."""
    service = get_service()
    normalized = await service.get_version_normalized(
        "go", module_path, version, auto_fetch
    )

    if not normalized:
        raise HTTPException(
            status_code=404,
            detail=f"Version not found: go/{module_path}@{version}",
        )

    return normalized


@router.post("/go/{module_path:path}/@v/{version}/source")
async def download_go_source(
    module_path: str,
    version: str,
) -> dict[str, Any]:
    """Download Go module zip and store in S3."""
    service = get_service()
    result = await service.download_source("go", module_path, version)

    if not result.get("success"):
        raise HTTPException(
            status_code=404 if "not found" in result.get("error", "").lower() else 500,
            detail=result.get("error", "Unknown error"),
        )

    return result


@router.get("/go/{module_path:path}/@v/{version}/source")
async def get_go_source_status(
    module_path: str,
    version: str,
) -> dict[str, Any]:
    """Check if Go module zip exists in S3."""
    service = get_service()
    return await service.get_source_status("go", module_path, version)


@router.get("/go/{module_path:path}/versions")
async def get_go_versions(
    module_path: str,
    auto_fetch: bool = Query(True, description="Fetch from registry if not in DB"),
) -> dict[str, Any]:
    """Get all versions of a Go module."""
    service = get_service()
    versions = await service.get_package_versions("go", module_path, auto_fetch)

    if not versions:
        raise HTTPException(
            status_code=404, detail=f"Package not found: go/{module_path}"
        )

    return {
        "ecosystem": "go",
        "name": module_path,
        "count": len(versions),
        "versions": versions,
    }


@router.post("/go/{module_path:path}/refresh")
async def refresh_go_package(
    module_path: str,
) -> dict[str, Any]:
    """Force refresh Go module from proxy."""
    service = get_service()
    pkg = await service.refresh_package("go", module_path)

    if not pkg:
        raise HTTPException(
            status_code=404, detail=f"Package not found: go/{module_path}"
        )

    return {"message": "Package refreshed successfully", "package": pkg}


@router.get("/go/{module_path:path}")
async def get_go_package(
    module_path: str,
    auto_fetch: bool = Query(True, description="Fetch from registry if not in DB"),
) -> dict[str, Any]:
    """Get Go module summary."""
    service = get_service()
    pkg = await service.get_package("go", module_path, auto_fetch)

    if not pkg:
        raise HTTPException(
            status_code=404, detail=f"Package not found: go/{module_path}"
        )

    return pkg


# -----------------------------------------------------------------------------
# Maven-Specific Endpoints (groupId:artifactId format)
# Must be defined BEFORE generic /{ecosystem}/{name} routes
# -----------------------------------------------------------------------------


@router.get("/maven/{group_id}/{artifact_id}")
async def get_maven_package(
    group_id: str,
    artifact_id: str,
    auto_fetch: bool = Query(True, description="Fetch from registry if not in DB"),
) -> dict[str, Any]:
    """Get Maven package summary (groupId:artifactId format)."""
    name = f"{group_id}:{artifact_id}"
    service = get_service()
    pkg = await service.get_package("maven", name, auto_fetch)

    if not pkg:
        raise HTTPException(status_code=404, detail=f"Package not found: maven/{name}")

    return pkg


@router.get("/maven/{group_id}/{artifact_id}/versions")
async def get_maven_versions(
    group_id: str,
    artifact_id: str,
    auto_fetch: bool = Query(True, description="Fetch from registry if not in DB"),
) -> dict[str, Any]:
    """Get all versions of a Maven package."""
    name = f"{group_id}:{artifact_id}"
    service = get_service()
    versions = await service.get_package_versions("maven", name, auto_fetch)

    if not versions:
        raise HTTPException(status_code=404, detail=f"Package not found: maven/{name}")

    return {
        "ecosystem": "maven",
        "name": name,
        "count": len(versions),
        "versions": versions,
    }


@router.get("/maven/{group_id}/{artifact_id}/{version}")
async def get_maven_version(
    group_id: str,
    artifact_id: str,
    version: str,
    auto_fetch: bool = Query(True, description="Fetch from registry if not in DB"),
) -> dict[str, Any]:
    """Get a specific Maven package version."""
    name = f"{group_id}:{artifact_id}"
    service = get_service()
    doc = await service.get_version("maven", name, version, auto_fetch)

    if not doc:
        raise HTTPException(
            status_code=404,
            detail=f"Version not found: maven/{name}@{version}",
        )

    return doc


@router.get("/maven/{group_id}/{artifact_id}/{version}/full")
async def get_maven_version_full(
    group_id: str,
    artifact_id: str,
    version: str,
    auto_fetch: bool = Query(True, description="Fetch from registry if not in DB"),
) -> dict[str, Any]:
    """Get Maven version with extended data from S3."""
    name = f"{group_id}:{artifact_id}"
    service = get_service()
    doc = await service.get_version_full("maven", name, version, auto_fetch)

    if not doc:
        raise HTTPException(
            status_code=404,
            detail=f"Version not found: maven/{name}@{version}",
        )

    return doc


@router.get("/maven/{group_id}/{artifact_id}/{version}/normalized")
async def get_maven_version_normalized(
    group_id: str,
    artifact_id: str,
    version: str,
    auto_fetch: bool = Query(True, description="Fetch from registry if not in DB"),
) -> NormalizedPackageVersion:
    """Get Maven version in normalized format."""
    name = f"{group_id}:{artifact_id}"
    service = get_service()
    normalized = await service.get_version_normalized("maven", name, version, auto_fetch)

    if not normalized:
        raise HTTPException(
            status_code=404,
            detail=f"Version not found: maven/{name}@{version}",
        )

    return normalized


@router.post("/maven/{group_id}/{artifact_id}/refresh")
async def refresh_maven_package(
    group_id: str,
    artifact_id: str,
) -> dict[str, Any]:
    """Force refresh Maven package from registry."""
    name = f"{group_id}:{artifact_id}"
    service = get_service()
    pkg = await service.refresh_package("maven", name)

    if not pkg:
        raise HTTPException(status_code=404, detail=f"Package not found: maven/{name}")

    return {"message": "Package refreshed successfully", "package": pkg}


@router.post("/maven/{group_id}/{artifact_id}/{version}/source")
async def download_maven_source(
    group_id: str,
    artifact_id: str,
    version: str,
) -> dict[str, Any]:
    """Download Maven JAR and store in S3."""
    name = f"{group_id}:{artifact_id}"
    service = get_service()
    result = await service.download_source("maven", name, version)

    if not result.get("success"):
        raise HTTPException(
            status_code=404 if "not found" in result.get("error", "").lower() else 500,
            detail=result.get("error", "Unknown error"),
        )

    return result


@router.get("/maven/{group_id}/{artifact_id}/{version}/source")
async def get_maven_source_status(
    group_id: str,
    artifact_id: str,
    version: str,
) -> dict[str, Any]:
    """Check if Maven JAR exists in S3."""
    name = f"{group_id}:{artifact_id}"
    service = get_service()
    return await service.get_source_status("maven", name, version)


# -----------------------------------------------------------------------------
# Ecosystem-Specific Endpoints
# -----------------------------------------------------------------------------


@router.get("/{ecosystem}/{name}")
async def get_registry_package(
    ecosystem: str,
    name: str,
    auto_fetch: bool = Query(True, description="Fetch from registry if not in DB"),
) -> dict[str, Any]:
    """
    Get package summary with version list.

    This is the main entry point for package lookup.
    If the package is not in the database and auto_fetch is True,
    it will be fetched from the registry.
    """
    ecosystem = ecosystem.lower()
    if ecosystem not in ECOSYSTEMS:
        raise HTTPException(status_code=400, detail=f"Unknown ecosystem: {ecosystem}")

    service = get_service()
    package = await service.get_package(ecosystem, name, auto_fetch)

    if not package:
        raise HTTPException(status_code=404, detail=f"Package not found: {ecosystem}/{name}")

    return package


@router.get("/{ecosystem}/{name}/versions")
async def get_package_versions(
    ecosystem: str,
    name: str,
    auto_fetch: bool = Query(True, description="Fetch from registry if not in DB"),
) -> dict[str, Any]:
    """Get all versions of a package with metadata."""
    ecosystem = ecosystem.lower()
    if ecosystem not in ECOSYSTEMS:
        raise HTTPException(status_code=400, detail=f"Unknown ecosystem: {ecosystem}")

    service = get_service()
    versions = await service.get_package_versions(ecosystem, name, auto_fetch)

    if not versions:
        raise HTTPException(status_code=404, detail=f"Package not found: {ecosystem}/{name}")

    return {
        "ecosystem": ecosystem,
        "name": name,
        "count": len(versions),
        "versions": versions,
    }


@router.get("/{ecosystem}/{name}/{version}")
async def get_version(
    ecosystem: str,
    name: str,
    version: str,
    auto_fetch: bool = Query(True, description="Fetch from registry if not in DB"),
) -> dict[str, Any]:
    """Get a specific package version (MongoDB data only)."""
    ecosystem = ecosystem.lower()
    if ecosystem not in ECOSYSTEMS:
        raise HTTPException(status_code=400, detail=f"Unknown ecosystem: {ecosystem}")

    service = get_service()
    doc = await service.get_version(ecosystem, name, version, auto_fetch)

    if not doc:
        raise HTTPException(
            status_code=404,
            detail=f"Version not found: {ecosystem}/{name}@{version}",
        )

    return doc


@router.get("/{ecosystem}/{name}/{version}/full")
async def get_version_full(
    ecosystem: str,
    name: str,
    version: str,
    auto_fetch: bool = Query(True, description="Fetch from registry if not in DB"),
) -> dict[str, Any]:
    """Get a specific package version with extended data from S3."""
    ecosystem = ecosystem.lower()
    if ecosystem not in ECOSYSTEMS:
        raise HTTPException(status_code=400, detail=f"Unknown ecosystem: {ecosystem}")

    service = get_service()
    doc = await service.get_version_full(ecosystem, name, version, auto_fetch)

    if not doc:
        raise HTTPException(
            status_code=404,
            detail=f"Version not found: {ecosystem}/{name}@{version}",
        )

    return doc


@router.get("/{ecosystem}/{name}/{version}/normalized", response_model=NormalizedPackageVersion)
async def get_version_normalized(
    ecosystem: str,
    name: str,
    version: str,
    auto_fetch: bool = Query(True, description="Fetch from registry if not in DB"),
) -> NormalizedPackageVersion:
    """Get a specific package version in normalized format."""
    ecosystem = ecosystem.lower()
    if ecosystem not in ECOSYSTEMS:
        raise HTTPException(status_code=400, detail=f"Unknown ecosystem: {ecosystem}")

    service = get_service()
    normalized = await service.get_version_normalized(ecosystem, name, version, auto_fetch)

    if not normalized:
        raise HTTPException(
            status_code=404,
            detail=f"Version not found: {ecosystem}/{name}@{version}",
        )

    return normalized


# -----------------------------------------------------------------------------
# Refresh Endpoint
# -----------------------------------------------------------------------------


@router.post("/{ecosystem}/{name}/refresh")
async def refresh_package(
    ecosystem: str,
    name: str,
) -> dict[str, Any]:
    """Force refresh a package from the registry."""
    ecosystem = ecosystem.lower()
    if ecosystem not in ECOSYSTEMS:
        raise HTTPException(status_code=400, detail=f"Unknown ecosystem: {ecosystem}")

    service = get_service()
    package = await service.refresh_package(ecosystem, name)

    if not package:
        raise HTTPException(
            status_code=404,
            detail=f"Package not found in registry: {ecosystem}/{name}",
        )

    return {
        "message": "Package refreshed successfully",
        "package": package,
    }


# -----------------------------------------------------------------------------
# Source Files Endpoints
# -----------------------------------------------------------------------------


@router.post("/{ecosystem}/{name}/{version}/source")
async def download_source(
    ecosystem: str,
    name: str,
    version: str,
) -> dict[str, Any]:
    """
    Download source tarball and store in S3.

    Downloads the package tarball from the registry and stores it in S3
    under the sourceFiles/ prefix. This is an on-demand operation.

    Returns:
        Dict with success status, s3_key, and size_bytes
    """
    ecosystem = ecosystem.lower()
    if ecosystem not in ECOSYSTEMS:
        raise HTTPException(status_code=400, detail=f"Unknown ecosystem: {ecosystem}")

    service = get_service()
    result = await service.download_source(ecosystem, name, version)

    if not result.get("success"):
        raise HTTPException(
            status_code=404 if "not found" in result.get("error", "").lower() else 500,
            detail=result.get("error", "Unknown error"),
        )

    return result


@router.get("/{ecosystem}/{name}/{version}/source")
async def get_source_status(
    ecosystem: str,
    name: str,
    version: str,
) -> dict[str, Any]:
    """
    Check if source tarball exists in S3.

    Returns:
        Dict with exists status, s3_key, and size_bytes if exists
    """
    ecosystem = ecosystem.lower()
    if ecosystem not in ECOSYSTEMS:
        raise HTTPException(status_code=400, detail=f"Unknown ecosystem: {ecosystem}")

    service = get_service()
    return await service.get_source_status(ecosystem, name, version)


# -----------------------------------------------------------------------------
# Stats Endpoint
# -----------------------------------------------------------------------------


@router.get("/stats")
async def get_registry_stats() -> dict[str, Any]:
    """Get database statistics."""
    service = get_service()
    return await service.get_stats()
÷	 ÷	€
*cascade08€
‹‰ ‹‰”‰*cascade08”‰Ó¼ Ó¼Ü¼*cascade08Ü¼Ü½ 2=file:///c:/SCOUTNEW/scout_db/src/scout_registry/api/routes.py