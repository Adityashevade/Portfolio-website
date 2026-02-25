πimport logging
from contextlib import asynccontextmanager

from fastapi import FastAPI

from scout_db.api.alias_routes import router as alias_router
from scout_db.api.override_routes import router as override_router
from scout_db.api.vulnerability_routes import router as vulnerability_router
from scout_db.api.routes import router
from scout_db.services.vulnerability_db import vulnerability_db
from scout_db.config import settings
from scout_db.db.connection import database

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)





@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    logger.info("Starting Scout DB...")
    print(f"BACKEND_STARTING_ON_PORT_{settings.api_port}")
    try:
        await database.connect()
        logger.info("Connected to MongoDB")
        print("BACKEND_CONNECTED_TO_MONGO")
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        print(f"BACKEND_MONGO_CONNECTION_FAILED: {e}")
        # Build resilience: Don't exit, just run without DB
        pass
    
    # Initialize Vulnerability DB (Async/Lazy-ish)
    print("Initializing Vulnerability Database...")
    try:
        vulnerability_db.initialize()
    except Exception as e:
        logger.error(f"Failed to initialize Vulnerability DB: {e}")
    
    yield
    
    try:
        await database.disconnect()
        logger.info("Disconnected from MongoDB")
    except Exception:
        pass


app = FastAPI(
    title="Scout DB",
    description="Vulnerability database aggregator with multi-source ingestion",
    version="0.1.0",
    lifespan=lifespan,
)

app.include_router(vulnerability_router)
app.include_router(router)
app.include_router(override_router)
app.include_router(alias_router)

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check() -> dict:
    """Health check endpoint."""
    return {"status": "healthy", "database": database.db is not None}


def main():
    """Run the application."""
    import uvicorn

    uvicorn.run(
        "scout_db.main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=True,
    )


if __name__ == "__main__":
    import uvicorn
    print("Starting Scout DB Backend on Port 8000...")
    uvicorn.run("scout_db.main:app", host="127.0.0.1", port=8000, reload=True)
Í *cascade08Íã *cascade08ã˜ *cascade08˜¸ *cascade08¸ì	 *cascade08ì	ç*cascade08ç› *cascade08›Ü*cascade08Üπ *cascade0821file:///C:/SCOUTNEW/scout_db/src/scout_db/main.py