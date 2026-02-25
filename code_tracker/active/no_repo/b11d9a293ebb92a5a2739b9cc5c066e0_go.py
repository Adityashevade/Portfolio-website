³"""Go module version model."""

from pydantic import Field

from scout_registry.models.base import PackageVersionBase


class GoPackageVersion(PackageVersionBase):
    """Go module version document."""

    # Go-specific fields
    module_path: str = Field(
        ..., description="Full module path (e.g., github.com/gin-gonic/gin)"
    )
    module_path_lower: str = Field(
        ..., description="Lowercase module path for queries"
    )
    go_version: str | None = Field(
        None, description="Minimum Go version from go.mod"
    )
    retracted: bool = Field(
        False, description="Whether this version is retracted"
    )
    retract_reason: str | None = Field(
        None, description="Reason for retraction if retracted"
    )
    has_go_mod: bool = Field(
        True, description="Whether module has go.mod file"
    )
    major_version: str | None = Field(
        None, description="Major version suffix (e.g., v2, v3) if present in path"
    )

    def get_id(self) -> str:
        """Generate document ID for Go module."""
        return f"{self.name}:{self.version}"


class GoPackageVersionCreate(GoPackageVersion):
    """Model for creating Go module version (without _id)."""

    pass


class GoPackageVersionInDB(GoPackageVersion):
    """Model for Go module version as stored in MongoDB."""

    id: str = Field(..., alias="_id", description="Document ID: module:version")

    model_config = {"populate_by_name": True}
³2<file:///c:/SCOUTNEW/scout_db/src/scout_registry/models/go.py