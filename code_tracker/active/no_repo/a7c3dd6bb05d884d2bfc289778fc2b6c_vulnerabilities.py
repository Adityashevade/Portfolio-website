ìfrom fastapi import APIRouter, Query, HTTPException
from typing import List, Optional
from scout_db.services.vulnerability_db import vulnerability_db

router = APIRouter(
    prefix="/vulnerabilities",
    tags=["vulnerabilities"],
    responses={404: {"description": "Not found"}},
)

@router.get("/search")
async def search_vulnerabilities(q: str = Query(..., min_length=2), limit: int = 10):
    """
    Search for vulnerabilities by ID, CVE, or Package Name.
    """
    results = vulnerability_db.search(q, limit)
    return results

@router.get("/{vuln_id}")
async def get_vulnerability(vuln_id: str):
    """
    Get a single vulnerability by ID (GHSA-... or CVE-...).
    """
    result = vulnerability_db.get_by_id(vuln_id)
    if not result:
        raise HTTPException(status_code=404, detail="Vulnerability not found")
    return result
ì*cascade0827file:///C:/SCOUTNEW/scout_db/routers/vulnerabilities.py