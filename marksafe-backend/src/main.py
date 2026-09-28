from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.config import settings
from .api.endpoints import scripts, marks, alerts, admin, evaluation

app = FastAPI(
    title="BDEA Evaluation API",
    description="Bharat Digital Examination Authority — AI-Assisted Evaluation Infrastructure",
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(scripts.router, prefix=f"{settings.API_V1_STR}/scripts", tags=["Scripts"])
app.include_router(marks.router, prefix=f"{settings.API_V1_STR}/marks", tags=["Marks"])
app.include_router(alerts.router, prefix=f"{settings.API_V1_STR}/alerts", tags=["Alerts & Moderation"])
app.include_router(admin.router, prefix=f"{settings.API_V1_STR}/admin", tags=["Admin"])
app.include_router(evaluation.router, prefix=f"{settings.API_V1_STR}/evaluation", tags=["AI Evaluation"])


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "version": "1.0.0",
        "service": "BDEA Evaluation API",
    }
