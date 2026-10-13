from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from app.infrastructure.api.routes import api_router

app = FastAPI(
    title="DocFlow API",
    description="API RESTful corporativa para guarda e gestao de documentos de aprendizes e estagiarios sob padrao DDD Lite e Supabase.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

import os

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000"
]

extra_origins = os.getenv("CORS_ORIGINS")
if extra_origins:
    origins.extend([origin.strip() for origin in extra_origins.split(",") if origin.strip()])

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")

@app.get("/", include_in_schema=False)
async def root():
    return RedirectResponse(url="/docs")
