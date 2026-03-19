from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.api.routes import assets, findings, scans, enrich
from backend.config import settings
from backend.core.plugin_manager import plugin_manager
from backend.db.mongodb import MongoDB


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 Starting Sentinel-Scan API...")
    await MongoDB.connect()
    await plugin_manager.initialize_all_plugins()
    print(f"✅ Sentinel-Scan API v{settings.APP_VERSION} is ready!")
    print("📚 API Documentation: http://localhost:8000/docs")
    yield
    print("🛑 Shutting down Sentinel-Scan API...")
    await MongoDB.disconnect()


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Unified Threat Intelligence & Vulnerability Scanning Platform",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(scans.router, prefix=settings.API_V1_PREFIX)
app.include_router(findings.router, prefix=settings.API_V1_PREFIX)
app.include_router(assets.router, prefix=settings.API_V1_PREFIX)
app.include_router(enrich.router, prefix=settings.API_V1_PREFIX)


@app.get("/")
async def root():
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "operational",
        "docs": "/docs",
        "api_prefix": settings.API_V1_PREFIX,
    }


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "database": "connected" if MongoDB.db is not None else "disconnected",
        "plugins": len(plugin_manager.plugins),
    }


@app.get(f"{settings.API_V1_PREFIX}/plugins")
async def list_plugins():
    return {"plugins": plugin_manager.list_plugins()}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=settings.DEBUG)
