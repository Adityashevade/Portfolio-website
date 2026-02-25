Šimport logging
from contextlib import asynccontextmanager

from fastapi import FastAPI

from scout_db.api.alias_routes import router as alias_router
from scout_db.api.override_routes import router as override_router
from scout_db.api.vulnerability_routes import router as vulnerability_router
from scout_db.api.routes import router
from scout_registry.api.routes import router as registry_router, init_service, close_service
from scout_registry.db.connection import database as registry_database
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
        logger.info("Connected to Scout DB MongoDB")
    except Exception as e:
        logger.error(f"Failed to connect to Scout DB MongoDB: {e}")
        pass
    
    # Connect to Registry DB
    try:
        await registry_database.connect()
        logger.info("Connected to Scout Registry MongoDB")
        await init_service()
    except Exception as e:
        logger.error(f"Failed to initialize Scout Registry: {e}")
        pass

    # Initialize Vulnerability DB (Async/Lazy-ish)
    print("Initializing Vulnerability Database...")
    try:
        vulnerability_db.initialize()
    except Exception as e:
        logger.error(f"Failed to initialize Vulnerability DB: {e}")
    
    yield
    
    # Shutdown registry first
    try:
        await close_service()
        await registry_database.disconnect()
        logger.info("Disconnected from Scout Registry MongoDB")
    except Exception:
        pass

    try:
        await database.disconnect()
        logger.info("Disconnected from Scout DB MongoDB")
    except Exception:
        pass


app = FastAPI(
    title="Scout DB",
    description="Vulnerability database aggregator with multi-source ingestion",
    version="0.1.0",
    lifespan=lifespan,
    docs_url=None,
    redoc_url=None,
)

app.include_router(vulnerability_router)
app.include_router(router)
app.include_router(override_router)
app.include_router(alias_router)
app.include_router(registry_router)

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
ê *cascade08êøøŒ *cascade08
Œ× ×û*cascade08
û¯ ¯¦ *cascade08¦¬ *cascade08¬­*cascade08­¿ *cascade08¿Á*cascade08ÁÇ *cascade08ÇÚ*cascade08Úî *cascade08î‡ *cascade08‡‹*cascade08‹© *cascade08©²*cascade08²À *cascade08Àƒ	 *cascade08ƒ	Œ	*cascade08Œ	¤	 *cascade08¤	Ä	*cascade08Ä	Å	 *cascade08Å	Ş	*cascade08Ş	ß	 *cascade08ß	õ	*cascade08õ	ö	 *cascade08ö	ù	*cascade08ù	û	 *cascade08û	
*cascade08

 *cascade08
‘
*cascade08‘
“
 *cascade08“
›
*cascade08›
œ
 *cascade08œ
¦
*cascade08¦
§
 *cascade08§
µ
*cascade08µ
·
 *cascade08·
À
 *cascade08À
Ã
*cascade08Ã
Ä
 *cascade08Ä
Å
*cascade08Å
Ç
 *cascade08Ç
È
*cascade08È
É
 *cascade08É
Ì
*cascade08Ì
Í
 *cascade08Í
Ğ
*cascade08Ğ
Ò
 *cascade08Ò
×
*cascade08×
Ø
 *cascade08Ø
ç
*cascade08ç
é
 *cascade08é
÷
*cascade08÷
ø
 *cascade08ø
ü
*cascade08ü
ı
 *cascade08ı
‰*cascade08‰Š *cascade08Š*cascade08 *cascade08*cascade08‘ *cascade08‘’*cascade08’• *cascade08•*cascade08¢ *cascade08¢±*cascade08±¾ *cascade08¾À *cascade08Àºº¾ *cascade08¾Ä *cascade08ÄÍ *cascade08Íë*cascade08ëô *cascade08ôş *cascade08ş¥*cascade08¥¿ *cascade08¿Ã*cascade08Ãá *cascade08áû*cascade08û… *cascade08…¨*cascade08¨Í *cascade08Íô*cascade08ôö *cascade08öŸŸ÷ *cascade08÷›*cascade08›• *cascade08•–*cascade08–— *cascade08—° *cascade08°´´õ *cascade08õö*cascade08ö÷ *cascade08÷‘‘’ *cascade08’”*cascade08”– *cascade08–ÊÊË *cascade08Ëˆ*cascade08ˆŠ *cascade0821file:///c:/SCOUTNEW/scout_db/src/scout_db/main.py