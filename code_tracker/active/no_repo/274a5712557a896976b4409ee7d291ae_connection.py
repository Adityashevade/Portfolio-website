œ("""MongoDB connection manager for Scout Registry."""

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorCollection, AsyncIOMotorDatabase
from pymongo import ASCENDING, DESCENDING, IndexModel

from scout_registry.config import settings

# Supported ecosystems with their collection names
ECOSYSTEMS = [
    "npm",
    "pypi",
    "maven",
    "go",
    "cargo",
    "rubygems",
    "nuget",
    "packagist",
    "hex",
]


class Database:
    """MongoDB connection manager for Scout Registry."""

    client: AsyncIOMotorClient | None = None
    db: AsyncIOMotorDatabase | None = None

    async def connect(self) -> None:
        """Establish connection to MongoDB."""
        self.client = AsyncIOMotorClient(settings.mongodb_uri)
        self.db = self.client[settings.mongodb_database]
        await self._ensure_indexes()

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

        # Create indexes for each ecosystem collection
        for ecosystem in ECOSYSTEMS:
            await self._ensure_ecosystem_indexes(ecosystem)

        # Create indexes for _packages summary collection
        await self._ensure_packages_indexes()

    async def _ensure_ecosystem_indexes(self, ecosystem: str) -> None:
        """Create indexes for an ecosystem collection."""
        if self.db is None:
            return

        collection = self.db[ecosystem]

        # Common indexes for all ecosystems
        indexes = [
            # Primary lookups
            IndexModel([("name_lower", ASCENDING)]),
            IndexModel([("name_lower", ASCENDING), ("version", ASCENDING)], unique=True),
            # Common filters
            IndexModel([("license", ASCENDING)]),
            IndexModel([("release_date", DESCENDING)]),
            IndexModel([("deprecated", ASCENDING)]),
            IndexModel([("yanked", ASCENDING)]),
            # Maintainer analysis
            IndexModel([("maintainers", ASCENDING)]),
            # Dependency count (for risk/complexity filtering)
            IndexModel([("direct_dep_count", ASCENDING)]),
            # Audit
            IndexModel([("updated_at", DESCENDING)]),
            IndexModel([("created_at", DESCENDING)]),
        ]

        # npm-specific indexes
        if ecosystem == "npm":
            indexes.extend([
                IndexModel([("has_install_scripts", ASCENDING)]),
                IndexModel([("has_types", ASCENDING)]),
            ])

        # maven-specific indexes
        if ecosystem == "maven":
            indexes.extend([
                IndexModel([("group_id_lower", ASCENDING), ("artifact_id_lower", ASCENDING)]),
                IndexModel([
                    ("group_id_lower", ASCENDING),
                    ("artifact_id_lower", ASCENDING),
                    ("version", ASCENDING),
                ], unique=True),
            ])

        # go-specific indexes
        if ecosystem == "go":
            indexes.extend([
                IndexModel([("module_path_lower", ASCENDING)]),
                IndexModel([("module_path_lower", ASCENDING), ("version", ASCENDING)], unique=True),
            ])

        await collection.create_indexes(indexes)

    async def _ensure_packages_indexes(self) -> None:
        """Create indexes for the _packages summary collection."""
        if self.db is None:
            return

        collection = self.db["_packages"]
        indexes = [
            IndexModel([("ecosystem", ASCENDING), ("name_lower", ASCENDING)], unique=True),
            IndexModel([("ecosystem", ASCENDING)]),
            IndexModel([("name_lower", ASCENDING)]),
            IndexModel([("license", ASCENDING)]),
            IndexModel([("last_published", DESCENDING)]),
            IndexModel([("version_count", DESCENDING)]),
            IndexModel([("updated_at", DESCENDING)]),
        ]
        await collection.create_indexes(indexes)

    def get_ecosystem_collection(self, ecosystem: str) -> AsyncIOMotorCollection:
        """Get collection for a specific ecosystem."""
        if self.db is None:
            raise RuntimeError("Database not connected")
        ecosystem_lower = ecosystem.lower()
        if ecosystem_lower not in ECOSYSTEMS:
            raise ValueError(f"Unknown ecosystem: {ecosystem}")
        return self.db[ecosystem_lower]

    @property
    def packages(self) -> AsyncIOMotorCollection:
        """Get _packages summary collection."""
        if self.db is None:
            raise RuntimeError("Database not connected")
        return self.db["_packages"]

    def __getattr__(self, name: str) -> AsyncIOMotorCollection:
        """Allow accessing ecosystem collections as attributes: db.npm, db.pypi, etc."""
        if name in ECOSYSTEMS:
            return self.get_ecosystem_collection(name)
        raise AttributeError(f"'{type(self).__name__}' has no attribute '{name}'")


database = Database()
œ(2@file:///c:/SCOUTNEW/scout_db/src/scout_registry/db/connection.py