µfrom pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application configuration loaded from environment variables."""

    mongodb_uri: str = "mongodb://localhost:27017"
    mongodb_database: str = "scout_db"

    nvd_api_key: str | None = None
    nvd_api_base_url: str = "https://services.nvd.nist.gov/rest/json/cves/2.0"
    nvd_rate_limit_delay: float = 6.0  # seconds between requests without API key
    nvd_rate_limit_delay_with_key: float = 0.6  # seconds with API key

    ghsa_api_key: str | None = None
    ghsa_api_url: str = "https://api.github.com/graphql"
    ghsa_rate_limit_delay: float = 0.5  # seconds between requests

    # MSRC (Microsoft Security Response Center) settings
    msrc_api_base_url: str = "https://api.msrc.microsoft.com/cvrf/v3.0"
    msrc_rate_limit_delay: float = 1.0  # seconds between requests

    osv_gcs_base_url: str = "https://osv-vulnerabilities.storage.googleapis.com"
    osv_ecosystems: list[str] = [
        # Language ecosystems
        "PyPI",
        "npm",
        "Go",
        "Maven",
        "crates.io",
        "RubyGems",
        "NuGet",
        "Packagist",
        "Pub",
        "Hex",
        # OS package ecosystems
        "Debian",
        "Ubuntu",
        "Alpine",
        "Rocky Linux",
        "AlmaLinux",
        # Other
        "Linux",
        "OSS-Fuzz",
        "GIT",
    ]
    osv_rate_limit_delay: float = 0.5  # seconds between ecosystem downloads

    # EPSS settings
    epss_api_base_url: str = "https://api.first.org/data/v1/epss"
    epss_rate_limit_delay: float = 0.5  # seconds between paginated requests

    # KEV settings
    kev_feed_url: str = (
        "https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json"
    )

    # deps.dev settings for ecosystem resolution
    deps_dev_api_base_url: str = "https://api.deps.dev/v3alpha"
    deps_dev_rate_limit_delay: float = 0.1  # seconds between requests

    api_host: str = "0.0.0.0"
    api_port: int = 8000

    model_config = {"env_prefix": "SCOUT_", "env_file": ".env"}


settings = Settings()
µ*cascade0823file:///C:/SCOUTNEW/scout_db/src/scout_db/config.py