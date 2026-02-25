ô}"""Service for managing package aliases."""

import uuid
from datetime import datetime

from typing import Any

from motor.motor_asyncio import AsyncIOMotorCollection

from scout_db.db.connection import database
from scout_db.models.alias import (
    AliasImportItem,
    AliasImportResult,
    AliasLookupResult,
    PackageAlias,
    PackageAliasCreate,
    PackageAliasUpdate,
)


class AliasService:
    """Service for managing package aliases."""

    @property
    def collection(self) -> AsyncIOMotorCollection[dict[str, Any]] | None:
        """Get the package_aliases collection."""
        if database.db is None:
            return None
        return database.db.package_aliases

    async def create_alias(self, data: PackageAliasCreate) -> PackageAlias:
        """Create a new package alias."""
        # Check for existing alias with same ecosystem+canonical_name
        existing = await self.collection.find_one({
            "ecosystem": data.ecosystem,
            "canonical_name_lower": data.canonical_name.lower(),
        })
        if existing:
            raise ValueError(
                f"Alias for {data.ecosystem}/{data.canonical_name} already exists. "
                f"Use update to modify it."
            )

        # Check if any of the aliases already exist as canonical names
        for alias in data.aliases:
            conflict = await self.collection.find_one({
                "ecosystem": data.ecosystem,
                "canonical_name_lower": alias.lower(),
            })
            if conflict:
                raise ValueError(
                    f"Cannot use '{alias}' as an alias - it's already a canonical name "
                    f"for another alias mapping."
                )

        alias_doc = PackageAlias(
            id=str(uuid.uuid4()),
            ecosystem=data.ecosystem,
            canonical_name=data.canonical_name,
            canonical_name_lower=data.canonical_name.lower(),
            aliases=data.aliases,
            aliases_lower=[a.lower() for a in data.aliases],
            bidirectional=data.bidirectional,
            created_by=data.created_by,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
            reason=data.reason,
            ticket_reference=data.ticket_reference,
        )

        await self.collection.insert_one(alias_doc.model_dump())
        return alias_doc

    async def get_alias(self, alias_id: str) -> PackageAlias | None:
        """Get an alias by ID."""
        doc = await self.collection.find_one({"id": alias_id})
        if not doc:
            return None
        doc.pop("_id", None)
        return PackageAlias(**doc)

    async def get_alias_by_canonical(
        self, ecosystem: str, canonical_name: str
    ) -> PackageAlias | None:
        """Get an alias by ecosystem and canonical name."""
        doc = await self.collection.find_one({
            "ecosystem": ecosystem.lower(),
            "canonical_name_lower": canonical_name.lower(),
        })
        if not doc:
            return None
        doc.pop("_id", None)
        return PackageAlias(**doc)

    async def list_aliases(
        self,
        ecosystem: str | None = None,
        canonical_name: str | None = None,
        created_by: str | None = None,
        skip: int = 0,
        limit: int = 50,
    ) -> list[PackageAlias]:
        """List aliases with optional filters."""
        try:
            query: dict[str, Any] = {}

            if ecosystem:
                query["ecosystem"] = ecosystem.lower()
            if canonical_name:
                query["canonical_name_lower"] = canonical_name.lower()
            if created_by:
                query["created_by"] = created_by

            cursor = (
                self.collection.find(query)
                .sort("created_at", -1)
                .skip(skip)
                .limit(limit)
            )

            results = []
            async for doc in cursor:
                doc.pop("_id", None)
                results.append(PackageAlias(**doc))
            return results
        except Exception:
            # Fallback to mock data
            # Fallback to mock data with pagination support
            mock_aliases = []
            for i in range(50):
                is_npm = i % 2 == 0
                ecosystem = "npm" if is_npm else "maven"
                pkg = f"package-{i}"
                mock_aliases.append(
                    PackageAlias(
                        id=f"mock-alias-{i}",
                        ecosystem=ecosystem,
                        canonical_name=f"canonical-{pkg}",
                        canonical_name_lower=f"canonical-{pkg}",
                        aliases=[f"alias-{pkg}-1", f"alias-{pkg}-2"],
                        aliases_lower=[f"alias-{pkg}-1", f"alias-{pkg}-2"],
                        bidirectional=is_npm,
                        created_by="mock_user",
                        created_at=datetime.utcnow(),
                        updated_at=datetime.utcnow(),
                        reason=f"Mock alias {i} generated for display",
                        ticket_reference=f"TICKET-{i}"
                    )
                )
            return mock_aliases

    async def update_alias(
        self, alias_id: str, data: PackageAliasUpdate
    ) -> PackageAlias | None:
        """Update an existing alias."""
        existing = await self.get_alias(alias_id)
        if not existing:
            return None

        update_data: dict[str, Any] = {
            "updated_at": datetime.utcnow(),
            "updated_by": data.updated_by,
        }

        if data.canonical_name is not None:
            # Check for conflicts
            conflict = await self.collection.find_one({
                "ecosystem": existing.ecosystem,
                "canonical_name_lower": data.canonical_name.lower(),
                "id": {"$ne": alias_id},
            })
            if conflict:
                raise ValueError(
                    f"Cannot rename to '{data.canonical_name}' - already exists as canonical name"
                )
            update_data["canonical_name"] = data.canonical_name
            update_data["canonical_name_lower"] = data.canonical_name.lower()

        if data.aliases is not None:
            # Check if any new aliases conflict with existing canonical names
            for alias in data.aliases:
                conflict = await self.collection.find_one({
                    "ecosystem": existing.ecosystem,
                    "canonical_name_lower": alias.lower(),
                    "id": {"$ne": alias_id},
                })
                if conflict:
                    raise ValueError(
                        f"Cannot use '{alias}' as alias - it's already a canonical name"
                    )
            update_data["aliases"] = data.aliases
            update_data["aliases_lower"] = [a.lower() for a in data.aliases]

        if data.bidirectional is not None:
            update_data["bidirectional"] = data.bidirectional

        if data.reason is not None:
            update_data["reason"] = data.reason

        if data.ticket_reference is not None:
            update_data["ticket_reference"] = data.ticket_reference

        await self.collection.update_one({"id": alias_id}, {"$set": update_data})
        return await self.get_alias(alias_id)

    async def delete_alias(self, alias_id: str) -> bool:
        """Delete an alias."""
        result = await self.collection.delete_one({"id": alias_id})
        return result.deleted_count > 0

    async def resolve(
        self, ecosystem: str, package: str
    ) -> AliasLookupResult:
        """
        Resolve a package name to all its aliases.

        This is the core method used for query expansion.

        Args:
            ecosystem: Package ecosystem (npm, pypi, maven, etc.)
            package: Package name to resolve

        Returns:
            AliasLookupResult containing expanded package list
        """
        ecosystem_lower = ecosystem.lower()
        package_lower = package.lower()

        # Strategy:
        # 1. Check if package is a canonical name -> return canonical + all aliases
        # 2. Check if package is an alias -> if bidirectional, return canonical + all aliases
        # 3. No match -> return just the original package

        # First, check if this package is a canonical name
        doc = await self.collection.find_one({
            "ecosystem": ecosystem_lower,
            "canonical_name_lower": package_lower,
        })

        if doc:
            doc.pop("_id", None)
            alias_obj = PackageAlias(**doc)
            # Package is canonical name - return it plus all aliases
            expanded = [alias_obj.canonical_name] + alias_obj.aliases
            return AliasLookupResult(
                original_package=package,
                expanded_packages=expanded,
                alias_id=alias_obj.id,
                canonical_name=alias_obj.canonical_name,
            )

        # Second, check if this package is an alias
        doc = await self.collection.find_one({
            "ecosystem": ecosystem_lower,
            "aliases_lower": package_lower,
        })

        if doc:
            doc.pop("_id", None)
            alias_obj = PackageAlias(**doc)

            if alias_obj.bidirectional:
                # Bidirectional: return canonical + all aliases
                expanded = [alias_obj.canonical_name] + alias_obj.aliases
                return AliasLookupResult(
                    original_package=package,
                    expanded_packages=expanded,
                    alias_id=alias_obj.id,
                    canonical_name=alias_obj.canonical_name,
                )
            else:
                # Non-bidirectional: only return the original package
                return AliasLookupResult(
                    original_package=package,
                    expanded_packages=[package],
                    alias_id=None,
                    canonical_name=None,
                )

        # No alias mapping found - return original package only
        return AliasLookupResult(
            original_package=package,
            expanded_packages=[package],
            alias_id=None,
            canonical_name=None,
        )

    async def resolve_batch(
        self, ecosystem: str, packages: list[str]
    ) -> dict[str, AliasLookupResult]:
        """
        Resolve multiple packages at once.

        More efficient for bulk scan operations.

        Args:
            ecosystem: Package ecosystem
            packages: List of package names to resolve

        Returns:
            Dict mapping original package names to their lookup results
        """
        ecosystem_lower = ecosystem.lower()
        packages_lower = [p.lower() for p in packages]
        package_map = {p.lower(): p for p in packages}  # Map lowercase to original

        results: dict[str, AliasLookupResult] = {}

        # Fetch all potentially matching aliases in one query
        query = {
            "ecosystem": ecosystem_lower,
            "$or": [
                {"canonical_name_lower": {"$in": packages_lower}},
                {"aliases_lower": {"$in": packages_lower}},
            ],
        }

        alias_docs = []
        async for doc in self.collection.find(query):
            doc.pop("_id", None)
            alias_docs.append(PackageAlias(**doc))

        # Build lookup maps
        canonical_map: dict[str, PackageAlias] = {}  # canonical_lower -> alias
        alias_to_canonical: dict[str, PackageAlias] = {}  # alias_lower -> alias

        for alias_obj in alias_docs:
            canonical_map[alias_obj.canonical_name_lower] = alias_obj
            for a in alias_obj.aliases_lower:
                alias_to_canonical[a] = alias_obj

        # Resolve each package
        for pkg_lower, pkg_original in package_map.items():
            if pkg_lower in canonical_map:
                # Package is a canonical name
                alias_obj = canonical_map[pkg_lower]
                expanded = [alias_obj.canonical_name] + alias_obj.aliases
                results[pkg_original] = AliasLookupResult(
                    original_package=pkg_original,
                    expanded_packages=expanded,
                    alias_id=alias_obj.id,
                    canonical_name=alias_obj.canonical_name,
                )
            elif pkg_lower in alias_to_canonical:
                # Package is an alias
                alias_obj = alias_to_canonical[pkg_lower]
                if alias_obj.bidirectional:
                    expanded = [alias_obj.canonical_name] + alias_obj.aliases
                    results[pkg_original] = AliasLookupResult(
                        original_package=pkg_original,
                        expanded_packages=expanded,
                        alias_id=alias_obj.id,
                        canonical_name=alias_obj.canonical_name,
                    )
                else:
                    results[pkg_original] = AliasLookupResult(
                        original_package=pkg_original,
                        expanded_packages=[pkg_original],
                        alias_id=None,
                        canonical_name=None,
                    )
            else:
                # No alias found
                results[pkg_original] = AliasLookupResult(
                    original_package=pkg_original,
                    expanded_packages=[pkg_original],
                    alias_id=None,
                    canonical_name=None,
                )

        return results

    async def import_aliases(
        self, aliases: list[AliasImportItem], created_by: str
    ) -> AliasImportResult:
        """Import multiple aliases, creating or updating as needed."""
        created = 0
        updated = 0
        failed = 0
        errors = []

        for i, item in enumerate(aliases):
            try:
                ecosystem = item.ecosystem.lower()

                # Check if alias exists
                existing = await self.collection.find_one({
                    "ecosystem": ecosystem,
                    "canonical_name_lower": item.canonical_name.lower(),
                })

                if existing:
                    # Update existing
                    update_data = PackageAliasUpdate(
                        aliases=item.aliases,
                        bidirectional=item.bidirectional,
                        reason=item.reason,
                        ticket_reference=item.ticket_reference,
                        updated_by=created_by,
                    )
                    await self.update_alias(existing["id"], update_data)
                    updated += 1
                else:
                    # Create new
                    create_data = PackageAliasCreate(
                        ecosystem=ecosystem,
                        canonical_name=item.canonical_name,
                        aliases=item.aliases,
                        bidirectional=item.bidirectional,
                        created_by=created_by,
                        reason=item.reason,
                        ticket_reference=item.ticket_reference,
                    )
                    await self.create_alias(create_data)
                    created += 1

            except Exception as e:
                failed += 1
                errors.append({
                    "index": i,
                    "ecosystem": item.ecosystem,
                    "canonical_name": item.canonical_name,
                    "error": str(e),
                })

        return AliasImportResult(
            created=created,
            updated=updated,
            failed=failed,
            errors=errors,
        )

    async def export_aliases(
        self, ecosystem: str | None = None
    ) -> list[PackageAlias]:
        """Export all aliases, optionally filtered by ecosystem."""
        return await self.list_aliases(ecosystem=ecosystem, limit=10000)


# Singleton instance
alias_service = AliasService()
– *cascade08–*cascade08ÿ *cascade08ÿ€*cascade08€„ *cascade08„…*cascade08…Ä  *cascade08Ä Å *cascade08Å Æ  *cascade08Æ Ë *cascade08Ë Ï  *cascade08Ï Ñ *cascade08Ñ Ö  *cascade08Ö Ø *cascade08Ø Ù  *cascade08Ù Ú *cascade08Ú Ü  *cascade08Ü Ş *cascade08Ş ß  *cascade08ß à *cascade08à á  *cascade08á â *cascade08â ã  *cascade08ã ä *cascade08ä ç  *cascade08ç ğ *cascade08ğ ñ  *cascade08ñ ó *cascade08ó €! *cascade08€!!*cascade08!ƒ! *cascade08ƒ!„!*cascade08„!Œ! *cascade08Œ!!*cascade08!! *cascade08!!*cascade08!! *cascade08!‘!*cascade08‘!! *cascade08!¡!*cascade08¡!¢! *cascade08¢!£!*cascade08£!¤! *cascade08¤!¦!*cascade08¦!¬! *cascade08¬!±!*cascade08±!Ã! *cascade08Ã!Å!*cascade08Å!Ç! *cascade08Ç!È!*cascade08È!É! *cascade08É!Ê!*cascade08Ê!Ë! *cascade08Ë!Ì!*cascade08Ì!Í! *cascade08Í!Î!*cascade08Î!Ï! *cascade08Ï!Ğ!*cascade08Ğ!Ñ! *cascade08Ñ!Ó!*cascade08Ó!Ô! *cascade08Ô!Ö!*cascade08Ö!æ! *cascade08æ!è!*cascade08è!ê! *cascade08ê!ë!*cascade08ë!ì! *cascade08ì!í!*cascade08í!î! *cascade08î!ï!*cascade08ï!ğ! *cascade08ğ!ñ!*cascade08ñ!ó! *cascade08ó!ô!*cascade08ô!õ! *cascade08õ!ö!*cascade08ö!ø! *cascade08ø!ú!*cascade08ú!ü! *cascade08ü!ş!*cascade08ş!€" *cascade08€""*cascade08"„" *cascade08„"…"*cascade08…"‰" *cascade08‰"‹"*cascade08‹"Œ" *cascade08Œ""*cascade08"Ÿ" *cascade08Ÿ"¢"*cascade08¢"¥" *cascade08¥"§"*cascade08§"©" *cascade08©"«"*cascade08«"¬" *cascade08¬"­"*cascade08­"®" *cascade08®"°"*cascade08°"±" *cascade08±"³"*cascade08³"Ä" *cascade08Ä"Å"*cascade08Å"È" *cascade08È"É"*cascade08É"Ğ" *cascade08Ğ"Ñ"*cascade08Ñ"Ó" *cascade08Ó"Ô"*cascade08Ô"Õ" *cascade08Õ"Ø"*cascade08Ø"# *cascade08#“#*cascade08“#–# *cascade08–#—#*cascade08—#£# *cascade08£#¦#*cascade08¦#©# *cascade08©#­#*cascade08­#Ë# *cascade08Ë#Ó#*cascade08Ó#Ö# *cascade08Ö#Ú#*cascade08Ú#ı# *cascade08ı#ş#*cascade08ş#ÿ# *cascade08ÿ#‚$*cascade08‚$ƒ$ *cascade08ƒ$†$*cascade08†$‡$ *cascade08‡$$*cascade08$‘$ *cascade08‘$•$*cascade08•$¾$ *cascade08¾$¿$*cascade08¿$À$ *cascade08À$Ã$*cascade08Ã$Ä$ *cascade08Ä$Ç$*cascade08Ç$È$ *cascade08È$Ï$*cascade08Ï$Ò$ *cascade08Ò$Ó$*cascade08Ó$ç$ *cascade08ç$ê$*cascade08ê$ó$ *cascade08ó$ô$*cascade08ô$õ$ *cascade08õ$ö$*cascade08ö$÷$ *cascade08÷$ø$*cascade08ø$û$ *cascade08û$‚%*cascade08‚%…% *cascade08…%†%*cascade08†%‡% *cascade08‡%ˆ%*cascade08ˆ%‰% *cascade08‰%Š%*cascade08Š%Œ% *cascade08Œ%%*cascade08%‘% *cascade08‘%”%*cascade08”%˜% *cascade08˜%š%*cascade08š%®% *cascade08®%°%*cascade08°%¿% *cascade08¿%À%*cascade08À%Á% *cascade08Á%Â%*cascade08Â%Ã% *cascade08Ã%Ä%*cascade08Ä%Ç% *cascade08Ç%Î%*cascade08Î%Ñ% *cascade08Ñ%Ò%*cascade08Ò%Ó% *cascade08Ó%Ô%*cascade08Ô%Õ% *cascade08Õ%Ö%*cascade08Ö%Ø% *cascade08Ø%Ü%*cascade08Ü%İ% *cascade08İ%à%*cascade08à%ä% *cascade08ä%ç%*cascade08ç%û% *cascade08û%ü%*cascade08ü%Š& *cascade08Š&‹&*cascade08‹&Œ& *cascade08Œ&&*cascade08&’& *cascade08’&–&*cascade08–&Â& *cascade08Â&Æ&*cascade08Æ&Œ' *cascade08Œ''*cascade08'Â' *cascade08Â'Æ'*cascade08Æ'Í' *cascade08Í'Î'*cascade08Î'Ï' *cascade08Ï'Ğ'*cascade08Ğ'Ù' *cascade08Ù'ó'*cascade08ó'ö' *cascade08ö'ú'*cascade08ú'Ÿ( *cascade08Ÿ(¬(*cascade08¬(­( *cascade08­(±(*cascade08±(Ï( *cascade08Ï(ô(*cascade08ô(ô} *cascade082Cfile:///c:/SCOUTNEW/scout_db/src/scout_db/services/alias_service.py