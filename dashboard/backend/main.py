from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from dashboard.config.settings import settings
from dashboard.backend.database import MongoDB
from dashboard.backend.routes import router as dashboard_router
import uvicorn

@asynccontextmanager
async def lifespan(app: FastAPI):
    print('Starting Dashboard API...')
    await MongoDB.connect()
    yield
    print('Shutting down Dashboard API...')
    await MongoDB.disconnect()
app = FastAPI(title=settings.APP_NAME, version=settings.APP_VERSION, lifespan=lifespan, docs_url='/docs')
app.add_middleware(CORSMiddleware, allow_origins=settings.CORS_ORIGINS, allow_credentials=True, allow_methods=['*'], allow_headers=['*'])
app.include_router(dashboard_router, prefix=settings.API_V1_PREFIX)

@app.get('/')
async def root():
    return {'status': 'operational', 'service': 'Sentinel-Scan Dashboard API'}
if __name__ == '__main__':
    uvicorn.run('dashboard.backend.main:app', host='0.0.0.0', port=8001, reload=True)