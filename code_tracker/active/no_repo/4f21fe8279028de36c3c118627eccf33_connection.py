›-from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from pymongo import ASCENDING, DESCENDING, IndexModel

from scout_db.config import settings


class Database:
    """MongoDB connection manager."""

    client: AsyncIOMotorClient | None = None
    db: AsyncIOMotorDatabase | None = None

    async def connect(self) -> None:
        """Establish connection to MongoDB."""
        try:
            self.client = AsyncIOMotorClient(settings.mongodb_uri, serverSelectionTimeoutMS=2000)
            self.db = self.client[settings.mongodb_database]
            # Try to ping to verify connection
            await self.client.admin.command('ping')
            await self._ensure_indexes()
        except Exception as e:
            print(f"WARNING: MongoDB connection failed: {e}. Running in degraded mode.")
            # We DON'T raise here, so the app can start and use mocks
            pass

    async def disconnect(self) -> None:
        """Close MongoDB connection."""
        if self.client:
            self.client.close()
            self.client = None
            self.db = None

    async def _ensure_indexes(self) -> None:
        """Create indexes for all collections."""
        if self.db is None:
            return

        await self._ensure_vulnerability_indexes()
        await self._ensure_override_indexes()
        await self._ensure_audit_indexes()
        await self._ensure_alias_indexes()

    async def _ensure_vulnerability_indexes(self) -> None:
        """Create indexes for the vulnerabilities collection."""
        if self.db is None:
            return

        collection = self.db.vulnerabilities
        indexes = [
            IndexModel([("cve_id", ASCENDING)], unique=True, sparse=True),
            IndexModel([("aliases", ASCENDING)]),
            IndexModel([("affected.ecosystem", ASCENDING), ("affected.package", ASCENDING)]),
            # Normalized fields for efficient bulk queries (exact match, no regex)
            IndexModel(
                [("affected.ecosystem_lower", ASCENDING), ("affected.package_lower", ASCENDING)]
            ),
            # CPE indexes for NVD-style queries
            IndexModel([
                ("cpe_affected.vendor_lower", ASCENDING),
                ("cpe_affected.product_lower", ASCENDING),
            ]),
            IndexModel([("cpe_affected.cpe_uri", ASCENDING)]),
            IndexModel([("severity.cvss_v3_score", DESCENDING)]),
            IndexModel([("severity.epss_score", DESCENDING)]),
            IndexModel([("modified", DESCENDING)]),
            IndexModel([("kev.in_kev", ASCENDING)]),
            IndexModel([("id", ASCENDING)], unique=True),
        ]
        await collection.create_indexes(indexes)

    async def _ensure_override_indexes(self) -> None:
        """Create indexes for the vulnerability_overrides collection."""
        if self.db is None:
            return

        collection = self.db.vulnerability_overrides
        indexes = [
            IndexModel([("id", ASCENDING)], unique=True),
            IndexModel([("vulnerability_id", ASCENDING)]),
            IndexModel([("status", ASCENDING)]),
            IndexModel([("created_by", ASCENDING)]),
            IndexModel([("created_at", DESCENDING)]),
            IndexModel([("vulnerability_id", ASCENDING), ("status", ASCENDING)]),
        ]
        await collection.create_indexes(indexes)

    async def _ensure_audit_indexes(self) -> None:
        """Create indexes for the override_audit_log collection."""
        if self.db is None:
            return

        collection = self.db.override_audit_log
        indexes = [
            IndexModel([("id", ASCENDING)], unique=True),
            IndexModel([("override_id", ASCENDING)]),
            IndexModel([("vulnerability_id", ASCENDING)]),
            IndexModel([("actor", ASCENDING)]),
            IndexModel([("action", ASCENDING)]),
            IndexModel([("timestamp", DESCENDING)]),
        ]
        await collection.create_indexes(indexes)

    async def _ensure_alias_indexes(self) -> None:
        """Create indexes for the package_aliases collection."""
        if self.db is None:
            return

        collection = self.db.package_aliases
        indexes = [
            IndexModel([("id", ASCENDING)], unique=True),
            # Unique constraint: one alias mapping per ecosystem+canonical_name
            IndexModel(
                [("ecosystem", ASCENDING), ("canonical_name_lower", ASCENDING)],
                unique=True,
            ),
            # For reverse lookups: find by alias name
            IndexModel([("ecosystem", ASCENDING), ("aliases_lower", ASCENDING)]),
            # For listing/filtering
            IndexModel([("created_by", ASCENDING)]),
            IndexModel([("created_at", DESCENDING)]),
        ]
        await collection.create_indexes(indexes)

    @property
    def vulnerabilities(self):
        """Get vulnerabilities collection."""
        if self.db is None:
            raise RuntimeError("Database not connected")
        return self.db.vulnerabilities

    @property
    def vulnerability_overrides(self):
        """Get vulnerability_overrides collection."""
        if self.db is None:
            raise RuntimeError("Database not connected")
        return self.db.vulnerability_overrides

    @property
    def override_audit_log(self):
        """Get override_audit_log collection."""
        if self.db is None:
            raise RuntimeError("Database not connected")
        return self.db.override_audit_log

    @property
    def package_aliases(self):
        """Get package_aliases collection."""
        if self.db is None:
            raise RuntimeError("Database not connected")
        return self.db.package_aliases


database = Database()
“ *cascade08“¤*cascade08¤ú *cascade08úþ*cascade08þ¿ *cascade08¿¦*cascade08¦Â *cascade08Â‘*cascade08‘›- *cascade082:file:///c:/SCOUTNEW/scout_db/src/scout_db/db/connection.py