‚Šimport asyncio
import logging
from collections import defaultdict
from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, HTTPException, Query, Response

from scout_db.db.connection import database
from scout_db.models.override import OverrideStatus
from scout_db.models.vulnerability import (
    BulkScanFilters,
    BulkScanRequest,
    BulkScanResponse,
    BulkScanStats,
    PackageScanResult,
    PackageSpec,
    SeverityType,
    Vulnerability,
    VulnerabilitySummary,
)
from scout_db.services.alias_service import alias_service
from scout_db.services.override_service import apply_overrides, override_service
from scout_db.version import version_matcher
from scout_db.version.ecosystems import is_ecosystem_supported, parse_compound_ecosystem

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1", tags=["vulnerabilities"])


SEVERITY_ORDER = {
    SeverityType.NONE: 0,
    SeverityType.LOW: 1,
    SeverityType.MEDIUM: 2,
    SeverityType.HIGH: 3,
    SeverityType.CRITICAL: 4,
}


def get_min_cvss_for_severity(severity: SeverityType) -> float:
    """Map severity level to minimum CVSS score."""
    mapping = {
        SeverityType.NONE: 0.0,
        SeverityType.LOW: 0.1,
        SeverityType.MEDIUM: 4.0,
        SeverityType.HIGH: 7.0,
        SeverityType.CRITICAL: 9.0,
    }
    return mapping.get(severity, 0.0)


def _cpe_version_matches(cpe: dict, version: str) -> bool:
    """
    Check if a version matches a CPE version range.

    Simple string comparison - CPE versions are typically semantic-ish
    but this provides basic range matching.
    """
    # If specific version is set, check exact match
    if cpe.get("version"):
        return version == cpe["version"]

    # Check version range bounds
    start_incl = cpe.get("version_start_including")
    start_excl = cpe.get("version_start_excluding")
    end_incl = cpe.get("version_end_including")
    end_excl = cpe.get("version_end_excluding")

    # If no bounds specified, assume all versions affected
    if not any([start_incl, start_excl, end_incl, end_excl]):
        return True

    # Simple string comparison for version bounds
    # This works for many versioning schemes but isn't perfect
    if start_incl and version < start_incl:
        return False
    if start_excl and version <= start_excl:
        return False
    if end_incl and version > end_incl:
        return False
    if end_excl and version >= end_excl:
        return False

    return True


# NOTE: Specific routes must be defined BEFORE parameterized routes
# to prevent {vuln_id} from matching "by-severity" or "by-cpe"


@router.get("/vulnerabilities/by-severity/{severity}", response_model=list[Vulnerability])
async def list_by_severity(
    severity: SeverityType,
    apply_overrides: Annotated[
        bool, Query(description="Apply manual corrections to the returned data")
    ] = True,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=500)] = 50,
) -> list[Vulnerability]:
    """
    List vulnerabilities by exact severity level.

    Returns vulnerabilities matching the specified CVSS v3 severity rating.
    When apply_overrides=True (default), manual corrections are applied.
    """
    severity_ranges = {
        SeverityType.NONE: (0.0, 0.0),
        SeverityType.LOW: (0.1, 3.9),
        SeverityType.MEDIUM: (4.0, 6.9),
        SeverityType.HIGH: (7.0, 8.9),
        SeverityType.CRITICAL: (9.0, 10.0),
    }

    min_score, max_score = severity_ranges[severity]
    query = {
        "severity.cvss_v3_score": {"$gte": min_score, "$lte": max_score}
    }

    cursor = (
        database.vulnerabilities.find(query)
        .sort("severity.cvss_v3_score", -1)
        .skip(skip)
        .limit(limit)
    )

    results = []
    async for doc in cursor:
        doc.pop("_id", None)
        if apply_overrides:
            vuln_id = doc.get("id") or doc.get("cve_id")
            if vuln_id:
                effective = await override_service.get_effective_vulnerability(vuln_id)
                if effective:
                    doc = effective
        results.append(Vulnerability(**doc))

    return results


@router.get("/vulnerabilities/by-cpe", response_model=list[Vulnerability])
async def list_by_cpe(
    vendor: Annotated[str, Query(description="CPE vendor name (e.g., 'apache', 'microsoft')")],
    product: Annotated[str, Query(description="CPE product name (e.g., 'log4j', 'windows')")],
    version: Annotated[
        str | None,
        Query(description="Optional version to filter. Checks against version ranges."),
    ] = None,
    apply_overrides: Annotated[
        bool, Query(description="Apply manual corrections to the returned data")
    ] = True,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=500)] = 50,
) -> list[Vulnerability]:
    """
    List vulnerabilities by CPE (Common Platform Enumeration) criteria.

    Searches the cpe_affected array for matching vendor/product combinations.
    This is useful for infrastructure-level queries where you know the CPE
    vendor and product names but not the package ecosystem.

    When version is provided, filters to CVEs affecting that version based on
    the CPE version ranges (application-level filtering).

    When apply_overrides=True (default), manual corrections are applied.
    """
    # Query using normalized lowercase fields for efficiency
    query = {
        "cpe_affected": {
            "$elemMatch": {
                "vendor_lower": vendor.lower(),
                "product_lower": product.lower(),
            }
        }
    }

    cursor = (
        database.vulnerabilities.find(query)
        .sort("modified", -1)
        .skip(skip)
        .limit(limit if not version else 0)  # Fetch all if version filtering needed
    )

    results = []
    async for doc in cursor:
        doc.pop("_id", None)

        # Version filtering in application code
        if version:
            version_matches = False
            for cpe in doc.get("cpe_affected", []):
                if (
                    cpe.get("vendor_lower") != vendor.lower()
                    or cpe.get("product_lower") != product.lower()
                ):
                    continue

                # Check if version falls within the CPE range
                if _cpe_version_matches(cpe, version):
                    version_matches = True
                    break

            if not version_matches:
                continue

        if apply_overrides:
            vuln_id = doc.get("id") or doc.get("cve_id")
            if vuln_id:
                effective = await override_service.get_effective_vulnerability(vuln_id)
                if effective:
                    doc = effective

        results.append(Vulnerability(**doc))

        # Apply limit after version filtering
        if version and len(results) >= limit:
            break

    # Apply skip/limit for version-filtered results
    if version:
        results = results[skip : skip + limit]

    return results


@router.get("/vulnerabilities/{vuln_id}", response_model=Vulnerability)
async def get_vulnerability_by_id(
    vuln_id: str,
    apply_overrides: Annotated[
        bool, Query(description="Apply manual corrections to the returned data")
    ] = True,
) -> Vulnerability:
    """
    Get a vulnerability by its ID (CVE, GHSA, or other identifier).

    Searches by primary ID, CVE ID, and aliases.
    When apply_overrides=True (default), manual corrections are applied.
    """
    if apply_overrides:
        doc = await override_service.get_effective_vulnerability(vuln_id)
        if not doc:
            raise HTTPException(status_code=404, detail=f"Vulnerability {vuln_id} not found")
        return Vulnerability(**doc)

    doc = await database.vulnerabilities.find_one(
        {"$or": [{"id": vuln_id}, {"cve_id": vuln_id}, {"aliases": vuln_id}]}
    )
    if not doc:
        raise HTTPException(status_code=404, detail=f"Vulnerability {vuln_id} not found")

    doc.pop("_id", None)
    return Vulnerability(**doc)


@router.get("/vulnerabilities")
async def search_vulnerabilities_advanced(
    response: Response,
    package: Annotated[str | None, Query(description="Package name to search")] = None,
    ecosystem: Annotated[
        str | None, Query(description="Ecosystem (npm, pypi, maven, debian, etc.)")
    ] = None,
    distro_release: Annotated[
        str | None,
        Query(
            description="OS release version (e.g., 'bookworm', '22.04'). "
            "Combines with ecosystem to query compound ecosystem:release format."
        ),
    ] = None,
    version: Annotated[
        str | None,
        Query(description="Specific version to check. Requires package and ecosystem."),
    ] = None,
    min_severity: Annotated[
        SeverityType | None, Query(description="Minimum severity level")
    ] = None,
    min_cvss: Annotated[
        float | None, Query(ge=0.0, le=10.0, description="Minimum CVSS v3 score")
    ] = None,
    min_epss: Annotated[
        float | None, Query(ge=0.0, le=1.0, description="Minimum EPSS score")
    ] = None,
    in_kev: Annotated[
        bool | None, Query(description="Filter to CISA KEV entries only")
    ] = None,
    modified_after: Annotated[
        datetime | None, Query(description="Only vulns modified after this date")
    ] = None,
    apply_overrides: Annotated[
        bool, Query(description="Apply manual corrections to the returned data")
    ] = True,
    expand_aliases: Annotated[
        bool, Query(description="Expand package name to include known aliases")
    ] = True,
    skip: Annotated[int, Query(ge=0, description="Number of results to skip")] = 0,
    limit: Annotated[
        int, Query(ge=1, le=500, description="Maximum results to return")
    ] = 50,
) -> dict:
    """
    Search vulnerabilities with filters.

    Supports filtering by package, ecosystem, version, severity, CVSS/EPSS scores,
    KEV status, and modification date.

    For OS packages (Debian, Ubuntu, Alpine, etc.), use distro_release to specify
    the release version. This combines with ecosystem to query compound format
    (e.g., ecosystem=debian&distro_release=bookworm queries "Debian:bookworm").

    When version is provided, only vulnerabilities affecting that specific version
    are returned. Requires package and ecosystem parameters.

    When apply_overrides=True (default), manual corrections are applied.
    """
    # Validate version parameter requires package and ecosystem
    if version is not None and (package is None or ecosystem is None):
        raise HTTPException(
            status_code=400,
            detail="Version filtering requires both 'package' and 'ecosystem' parameters",
        )

    query: dict = {}

    # Build ecosystem regex pattern
    # When distro_release is provided, match compound format (e.g., "Debian:bookworm")
    ecosystem_pattern = (
        f"^{ecosystem}:{distro_release}$" if distro_release else ecosystem
    ) if ecosystem else None

    # Expand package aliases if requested
    expanded_packages: list[str] = []
    alias_expanded = False
    if package and ecosystem and expand_aliases:
        alias_result = await alias_service.resolve(ecosystem, package)
        expanded_packages = alias_result.expanded_packages
        alias_expanded = len(expanded_packages) > 1
        if alias_expanded:
            response.headers["X-Scout-Alias-Expanded"] = ",".join(expanded_packages)
    elif package:
        expanded_packages = [package]

    # Package + ecosystem search
    # When both are provided, use $elemMatch to ensure they match in the same affected entry
    if expanded_packages and ecosystem_pattern:
        if len(expanded_packages) == 1:
            # Single package - use regex for flexibility
            query["affected"] = {
                "$elemMatch": {
                    "package": {"$regex": f"^{expanded_packages[0]}$", "$options": "i"},
                    "ecosystem": {"$regex": ecosystem_pattern, "$options": "i"},
                }
            }
        else:
            # Multiple packages from alias expansion - use $in with lowercase
            query["affected"] = {
                "$elemMatch": {
                    "package_lower": {"$in": [p.lower() for p in expanded_packages]},
                    "ecosystem": {"$regex": ecosystem_pattern, "$options": "i"},
                }
            }
    elif expanded_packages or ecosystem_pattern:
        affected_query: dict = {}
        if expanded_packages:
            if len(expanded_packages) == 1:
                pkg_pattern = f"^{expanded_packages[0]}$"
                affected_query["affected.package"] = {"$regex": pkg_pattern, "$options": "i"}
            else:
                pkg_list = [p.lower() for p in expanded_packages]
                affected_query["affected.package_lower"] = {"$in": pkg_list}
        if ecosystem_pattern:
            affected_query["affected.ecosystem"] = {"$regex": ecosystem_pattern, "$options": "i"}
        query.update(affected_query)

    # Severity filters
    if min_severity:
        min_score = get_min_cvss_for_severity(min_severity)
        query["severity.cvss_v3_score"] = {"$gte": min_score}
    elif min_cvss is not None:
        query["severity.cvss_v3_score"] = {"$gte": min_cvss}

    # EPSS filter
    if min_epss is not None:
        query["severity.epss_score"] = {"$gte": min_epss}

    # KEV filter
    if in_kev is not None:
        query["kev.in_kev"] = in_kev

    # Modified date filter
    if modified_after:
        query["modified"] = {"$gte": modified_after}

    # When version filtering, fetch all matching documents since we need to
    # filter in Python. Use 0 (no limit) for accurate version matching.
    # Without version, respect the user's limit for pagination.
    fetch_limit = 0 if version else limit

    cursor = database.vulnerabilities.find(query).sort("modified", -1)
    if not version:
        cursor = cursor.skip(skip).limit(fetch_limit)
    else:
        # Skip is not applied when version filtering - we filter then paginate
        cursor = cursor.limit(fetch_limit) if fetch_limit > 0 else cursor

    docs = []
    async for doc in cursor:
        doc.pop("_id", None)
        if apply_overrides:
            vuln_id = doc.get("id") or doc.get("cve_id")
            if vuln_id:
                effective = await override_service.get_effective_vulnerability(vuln_id)
                if effective:
                    doc = effective
        docs.append(doc)

    # Apply version filtering if specified
    if version and package and ecosystem:
        filtered_docs, ecosystem_supported = version_matcher.filter_vulnerabilities_by_version(
            docs, package, ecosystem, version
        )
        docs = filtered_docs

        # Add warning header if ecosystem not supported for version matching
        if not ecosystem_supported:
            response.headers["X-Scout-Version-Match-Warning"] = (
                f"Version matching not supported for ecosystem '{ecosystem}'. "
                "Returning all vulnerabilities for this package."
            )

        # Filter out withdrawn vulnerabilities (used for false positive suppression)
        docs = [doc for doc in docs if not doc.get("withdrawn")]

        # Apply skip and limit after version filtering
        docs = docs[skip : skip + limit]
    else:
        # Without version filtering, skip/limit already applied at DB level
        docs = docs[:limit]

    items = [Vulnerability(**doc) for doc in docs]
    return {"items": items, "total": len(items)}


@router.get("/kev")
async def list_kev_vulnerabilities(
    apply_overrides: Annotated[
        bool, Query(description="Apply manual corrections to the returned data")
    ] = True,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=500)] = 50,
) -> dict:
    """
    List vulnerabilities in CISA's Known Exploited Vulnerabilities catalog.

    Sorted by date added to KEV (most recent first).
    When apply_overrides=True (default), manual corrections are applied.
    """
    cursor = (
        database.vulnerabilities.find({"kev.in_kev": True})
        .sort("kev.date_added", -1)
        .skip(skip)
        .limit(limit)
    )

    results = []
    async for doc in cursor:
        doc.pop("_id", None)
        if apply_overrides:
            vuln_id = doc.get("id") or doc.get("cve_id")
            if vuln_id:
                effective = await override_service.get_effective_vulnerability(vuln_id)
                if effective:
                    doc = effective
        results.append(Vulnerability(**doc))

    return {"items": results, "total": len(results)}


@router.get("/stats")
async def get_vulnerability_stats() -> dict:
    """
    Get database statistics.

    Returns counts by severity, source, and KEV status.
    """
    total = await database.vulnerabilities.count_documents({})

    # Count by severity
    severity_pipeline = [
        {"$group": {"_id": "$severity.cvss_v3_severity", "count": {"$sum": 1}}},
    ]
    severity_counts = {}
    async for doc in database.vulnerabilities.aggregate(severity_pipeline):
        severity_counts[doc["_id"] or "UNKNOWN"] = doc["count"]

    # Count KEV
    kev_count = await database.vulnerabilities.count_documents({"kev.in_kev": True})

    # Count by source
    source_pipeline = [
        {"$unwind": "$sources"},
        {"$group": {"_id": "$sources.name", "count": {"$sum": 1}}},
    ]
    source_counts = {}
    async for doc in database.vulnerabilities.aggregate(source_pipeline):
        source_counts[doc["_id"]] = doc["count"]

    return {
        "total_vulnerabilities": total,
        "by_severity": severity_counts,
        "by_source": source_counts,
        "in_kev": kev_count,
    }


# Bulk scan constants
BATCH_SIZE = 500  # Max packages per MongoDB $in query
MAX_CONCURRENT_BATCHES = 10  # Limit concurrent queries


def _build_severity_filter(filters: BulkScanFilters | None) -> dict:
    """Build MongoDB filter for severity/CVSS/EPSS/KEV."""
    if not filters:
        return {}

    query: dict = {}

    if filters.min_severity:
        min_score = get_min_cvss_for_severity(filters.min_severity)
        query["severity.cvss_v3_score"] = {"$gte": min_score}
    elif filters.min_cvss is not None:
        query["severity.cvss_v3_score"] = {"$gte": filters.min_cvss}

    if filters.min_epss is not None:
        query["severity.epss_score"] = {"$gte": filters.min_epss}

    if filters.in_kev is not None:
        query["kev.in_kev"] = filters.in_kev

    return query


def _extract_fixed_version(affected_entry: dict, version: str | None) -> str | None:
    """Extract the fixed version from the affected entry."""
    return affected_entry.get("fixed")


def _vuln_to_summary(vuln: dict, affected_entry: dict, version: str | None) -> VulnerabilitySummary:
    """Convert vulnerability document to summary."""
    severity = vuln.get("severity", {})
    kev = vuln.get("kev", {})

    return VulnerabilitySummary(
        id=vuln.get("id", ""),
        cve_id=vuln.get("cve_id"),
        summary=vuln.get("summary"),
        cvss_v3_score=severity.get("cvss_v3_score"),
        cvss_v3_severity=severity.get("cvss_v3_severity"),
        epss_score=severity.get("epss_score"),
        in_kev=kev.get("in_kev", False),
        published=vuln.get("published"),
        fixed_version=_extract_fixed_version(affected_entry, version),
    )


def _get_max_severity(vulns: list[VulnerabilitySummary]) -> SeverityType | None:
    """Get the highest severity from a list of vulnerabilities."""
    if not vulns:
        return None

    max_sev = None
    max_order = -1

    for v in vulns:
        if v.cvss_v3_severity:
            order = SEVERITY_ORDER.get(v.cvss_v3_severity, 0)
            if order > max_order:
                max_order = order
                max_sev = v.cvss_v3_severity

    return max_sev


async def _query_batch(
    ecosystem: str,
    packages: list[str],
    severity_filter: dict,
    distro_release: str | None = None,
) -> list[dict]:
    """
    Query vulnerabilities for a batch of packages in the same ecosystem.

    Args:
        ecosystem: Base ecosystem name (e.g., "debian", "npm")
        packages: List of package names to query
        severity_filter: MongoDB filter for severity/CVSS/EPSS/KEV
        distro_release: OS release version (e.g., "bookworm", "22.04") for compound ecosystems
    """
    # Build ecosystem pattern for querying
    if distro_release:
        # Match compound ecosystem:release format (e.g., "Debian:bookworm")
        ecosystem_pattern = f"^{ecosystem}:{distro_release}$"
        ecosystem_lower = f"{ecosystem.lower()}:{distro_release.lower()}"
    else:
        # Match ecosystem exactly (may also match as prefix for compound ecosystems)
        ecosystem_pattern = f"^{ecosystem}$"
        ecosystem_lower = ecosystem.lower()

    # Try normalized fields first (exact match, uses index)
    # Fall back to case-insensitive match for non-normalized data
    query: dict = {
        "$or": [
            # Normalized path (efficient)
            {
                "affected": {
                    "$elemMatch": {
                        "ecosystem_lower": {"$regex": f"^{ecosystem_lower}$", "$options": "i"}
                        if distro_release
                        else ecosystem_lower,
                        "package_lower": {"$in": [p.lower() for p in packages]},
                    }
                }
            },
            # Fallback for non-normalized data (less efficient but complete)
            {
                "affected": {
                    "$elemMatch": {
                        "ecosystem": {"$regex": ecosystem_pattern, "$options": "i"},
                        "package": {"$in": packages},
                    }
                }
            },
        ]
    }

    if severity_filter:
        query = {"$and": [query, severity_filter]}

    results = []
    async for doc in database.vulnerabilities.find(query):
        doc.pop("_id", None)
        results.append(doc)

    return results


async def _fetch_overrides_for_vulns(vuln_ids: list[str]) -> dict[str, list]:
    """Batch-fetch active overrides for a list of vulnerability IDs."""
    if not vuln_ids:
        return {}

    overrides_by_vuln: dict[str, list] = defaultdict(list)

    # Query all overrides for these vulnerability IDs
    query = {
        "vulnerability_id": {"$in": vuln_ids},
        "status": OverrideStatus.ACTIVE.value,
    }

    async for doc in database.vulnerability_overrides.find(query):
        doc.pop("_id", None)
        overrides_by_vuln[doc["vulnerability_id"]].append(doc)

    return overrides_by_vuln


async def _process_ecosystem_packages(
    ecosystem: str,
    packages_with_versions: list[PackageSpec],
    severity_filter: dict,
    should_apply_overrides: bool = True,
    distro_release: str | None = None,
    should_expand_aliases: bool = True,
) -> dict[tuple[str, str, str], list[tuple[dict, dict, bool]]]:
    """
    Process all packages for one ecosystem.

    Args:
        ecosystem: Base ecosystem name (e.g., "debian", "npm")
        packages_with_versions: List of packages to check
        severity_filter: MongoDB filter for severity/CVSS/EPSS/KEV
        should_apply_overrides: Whether to apply manual corrections
        distro_release: OS release version for compound ecosystems

    Returns:
        dict mapping (package, version, distro_release) to list of
        (vuln, affected_entry, ecosystem_supported)
    """
    # Extract unique package names
    package_names = list({p.package for p in packages_with_versions})

    # Expand aliases if requested
    alias_map: dict[str, list[str]] = {}  # original -> expanded list
    expanded_package_names: set[str] = set()

    if should_expand_aliases:
        alias_results = await alias_service.resolve_batch(ecosystem, package_names)
        for pkg, result in alias_results.items():
            alias_map[pkg.lower()] = [p.lower() for p in result.expanded_packages]
            expanded_package_names.update(result.expanded_packages)
    else:
        for pkg in package_names:
            alias_map[pkg.lower()] = [pkg.lower()]
            expanded_package_names.add(pkg)

    # Use expanded names for querying
    query_package_names = list(expanded_package_names)

    # Build lookup for versions
    pkg_versions: dict[str, list[str | None]] = defaultdict(list)
    for p in packages_with_versions:
        pkg_versions[p.package.lower()].append(p.version)

    # Query in batches using expanded package names
    all_vulns: list[dict] = []
    for i in range(0, len(query_package_names), BATCH_SIZE):
        batch = query_package_names[i : i + BATCH_SIZE]
        batch_results = await _query_batch(ecosystem, batch, severity_filter, distro_release)
        all_vulns.extend(batch_results)

    # Apply overrides if requested
    if should_apply_overrides and all_vulns:
        # Collect all vulnerability IDs (id and cve_id)
        vuln_ids = []
        for v in all_vulns:
            if v.get("id"):
                vuln_ids.append(v["id"])
            if v.get("cve_id"):
                vuln_ids.append(v["cve_id"])

        # Batch-fetch overrides
        overrides_map = await _fetch_overrides_for_vulns(vuln_ids)

        # Apply overrides to each vulnerability
        for i, vuln in enumerate(all_vulns):
            vuln_id = vuln.get("id") or vuln.get("cve_id")
            cve_id = vuln.get("cve_id")

            # Collect overrides from both id and cve_id
            vuln_overrides = []
            if vuln_id and vuln_id in overrides_map:
                vuln_overrides.extend(overrides_map[vuln_id])
            if cve_id and cve_id in overrides_map and cve_id != vuln_id:
                vuln_overrides.extend(overrides_map[cve_id])

            if vuln_overrides:
                # Convert dicts to VulnerabilityOverride objects for apply_overrides
                from scout_db.models.override import VulnerabilityOverride
                override_objs = [VulnerabilityOverride(**o) for o in vuln_overrides]
                all_vulns[i] = apply_overrides(vuln, override_objs)

    # Group results by (package, version, distro_release)
    results: dict[tuple[str, str, str], list[tuple[dict, dict, bool]]] = defaultdict(list)
    ecosystem_supported = is_ecosystem_supported(ecosystem)

    # Build expected ecosystem pattern for matching
    if distro_release:
        expected_eco_pattern = f"{ecosystem.lower()}:{distro_release.lower()}"
    else:
        expected_eco_pattern = ecosystem.lower()

    for vuln in all_vulns:
        # Skip withdrawn vulnerabilities
        if vuln.get("withdrawn"):
            continue

        for affected in vuln.get("affected", []):
            aff_pkg = affected.get("package", "").lower()
            aff_eco = affected.get("ecosystem", "").lower()

            # Match ecosystem: exact match or compound format
            eco_matches = False
            if distro_release:
                # With distro_release, require exact compound match
                eco_matches = aff_eco == expected_eco_pattern
            else:
                # Without distro_release, match base ecosystem (or exact)
                base_eco, _ = parse_compound_ecosystem(aff_eco)
                eco_matches = base_eco == ecosystem.lower() or aff_eco == ecosystem.lower()

            if not eco_matches:
                continue

            # Check which requested packages match (including via aliases)
            for pkg_spec in packages_with_versions:
                # Check if affected package matches any of the expanded aliases
                expanded_names = alias_map.get(pkg_spec.package.lower(), [pkg_spec.package.lower()])
                if aff_pkg not in expanded_names:
                    continue

                version = pkg_spec.version
                key = (pkg_spec.package, version or "", pkg_spec.distro_release or "")

                # If version specified, check if it's affected
                if version and ecosystem_supported:
                    affected_pkg = version_matcher._dict_to_affected_package(affected)
                    match_result = version_matcher.is_version_affected(
                        version, ecosystem, affected_pkg
                    )
                    if not match_result.is_affected:
                        continue

                results[key].append((vuln, affected, ecosystem_supported))

    return results


@router.post("/vulnerabilities/bulk-scan", response_model=BulkScanResponse)
async def bulk_scan_vulnerabilities(request: BulkScanRequest) -> BulkScanResponse:
    """
    Scan multiple packages for vulnerabilities in a single request.

    Efficiently queries vulnerabilities for up to 10,000 packages at once.
    Packages are grouped by ecosystem and queried in batches using indexed lookups.

    For OS packages (Debian, Ubuntu, Alpine, etc.), use distro_release to specify
    the release version. This enables precise matching of compound ecosystem format.

    When version is provided for a package, only vulnerabilities affecting that
    specific version are returned (requires ecosystem support for version matching).

    Returns aggregated results with statistics and per-package vulnerability lists.
    """
    # Group packages by (ecosystem, distro_release) for efficient querying
    # Key: (base_ecosystem, distro_release or "")
    packages_by_eco_release: dict[tuple[str, str], list[PackageSpec]] = defaultdict(list)
    for pkg in request.packages:
        eco_key = (pkg.ecosystem.lower(), pkg.distro_release or "")
        packages_by_eco_release[eco_key].append(pkg)

    # Build severity filter
    severity_filter = _build_severity_filter(request.filters)

    # Process each ecosystem+release concurrently (with limit)
    semaphore = asyncio.Semaphore(MAX_CONCURRENT_BATCHES)
    should_apply_overrides = request.apply_overrides
    should_expand_aliases = request.expand_aliases

    async def process_with_semaphore(
        eco: str, distro_rel: str, pkgs: list[PackageSpec]
    ) -> tuple[tuple[str, str], dict]:
        async with semaphore:
            result = await _process_ecosystem_packages(
                eco, pkgs, severity_filter, should_apply_overrides,
                distro_release=distro_rel if distro_rel else None,
                should_expand_aliases=should_expand_aliases,
            )
            return ((eco, distro_rel), result)

    tasks = [
        process_with_semaphore(eco, distro_rel, pkgs)
        for (eco, distro_rel), pkgs in packages_by_eco_release.items()
    ]
    ecosystem_results = await asyncio.gather(*tasks)

    # Merge results from all ecosystems
    # Key: (ecosystem, package, version, distro_release)
    all_matches: dict[tuple[str, str, str, str], list[tuple[dict, dict, bool]]] = {}
    for (eco, _distro_rel), eco_result in ecosystem_results:
        for (pkg, ver, pkg_distro), matches in eco_result.items():
            all_matches[(eco, pkg, ver, pkg_distro)] = matches

    # Build response
    results: list[PackageScanResult] = []
    warnings: list[str] = []
    seen_vuln_ids: set[str] = set()
    total_vuln_count = 0
    severity_counts: dict[str, int] = defaultdict(int)
    kev_count = 0
    affected_pkg_count = 0

    # Track unsupported ecosystems for warning
    unsupported_ecosystems: set[str] = set()

    for pkg_spec in request.packages:
        pkg_key = (
            pkg_spec.ecosystem.lower(),
            pkg_spec.package,
            pkg_spec.version or "",
            pkg_spec.distro_release or "",
        )
        matches = all_matches.get(pkg_key, [])

        vulns: list[VulnerabilitySummary] = []
        eco_supported = True

        for vuln, affected_entry, supported in matches:
            vuln_id = vuln.get("id", "")
            # Deduplicate within this package
            if vuln_id not in {v.id for v in vulns}:
                summary = _vuln_to_summary(vuln, affected_entry, pkg_spec.version)
                vulns.append(summary)
                seen_vuln_ids.add(vuln_id)
                total_vuln_count += 1

                if summary.cvss_v3_severity:
                    severity_counts[summary.cvss_v3_severity.value] += 1
                if summary.in_kev:
                    kev_count += 1

            eco_supported = eco_supported and supported

        if not eco_supported:
            unsupported_ecosystems.add(pkg_spec.ecosystem)

        if vulns:
            affected_pkg_count += 1

        # Include result if has vulnerabilities or include_unaffected is True
        if vulns or request.include_unaffected:
            results.append(
                PackageScanResult(
                    ecosystem=pkg_spec.ecosystem,
                    package=pkg_spec.package,
                    version=pkg_spec.version,
                    distro_release=pkg_spec.distro_release,
                    vulnerabilities=vulns,
                    vulnerability_count=len(vulns),
                    max_severity=_get_max_severity(vulns),
                    ecosystem_supported=eco_supported,
                )
            )

    # Add warnings for unsupported ecosystems
    if unsupported_ecosystems:
        eco_list = ", ".join(sorted(unsupported_ecosystems))
        warnings.append(
            f"Version matching not fully supported for ecosystems: {eco_list}. "
            "Results for these may include vulnerabilities not affecting the specified version."
        )

    stats = BulkScanStats(
        total_packages=len(request.packages),
        affected_packages=affected_pkg_count,
        total_vulnerabilities=total_vuln_count,
        unique_vulnerabilities=len(seen_vuln_ids),
        by_severity=dict(severity_counts),
        in_kev=kev_count,
    )

    return BulkScanResponse(results=results, stats=stats, warnings=warnings)
ž8 *cascade08ž8¤8*cascade08¤8€@ *cascade08€@‰@*cascade08‰@¶ƒ *cascade08¶ƒÄƒ*cascade08Äƒ‚Š *cascade0827file:///c:/SCOUTNEW/scout_db/src/scout_db/api/routes.py