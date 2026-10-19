import os
import time
import httpx
from fastapi import APIRouter, status, HTTPException
from app.infrastructure.database.session import check_database_connection
from app.application.services.storage_service import R2StorageService

router = APIRouter(tags=["Health"])

@router.get("/health", status_code=status.HTTP_200_OK)
async def health_check():
    is_db_connected = await check_database_connection()
    if not is_db_connected:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={"status": "unhealthy", "database": "disconnected"}
        )
    return {"status": "healthy", "database": "connected"}

@router.get("/health/connections", status_code=status.HTTP_200_OK)
async def connections_check():
    start_time = time.time()
    is_db_connected = await check_database_connection()
    db_latency_ms = round((time.time() - start_time) * 1000, 2)

    supabase_url = os.getenv("SUPABASE_URL", "")
    supabase_auth_connected = False
    if supabase_url:
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                res = await client.get(f"{supabase_url.rstrip('/')}/auth/v1/health")
                supabase_auth_connected = res.status_code in [200, 404, 401]
        except Exception:
            supabase_auth_connected = False

    r2_connected = False
    r2_bucket = os.getenv("CLOUDFLARE_R2_BUCKET", "docflow-documents")
    try:
        storage = R2StorageService()
        r2_connected = storage.check_connection()
    except Exception:
        r2_connected = False

    overall_status = "healthy" if (is_db_connected and supabase_auth_connected and r2_connected) else "degraded"

    return {
        "status": overall_status,
        "database": {
            "connected": is_db_connected,
            "latency_ms": db_latency_ms,
            "provider": "Supabase PostgreSQL"
        },
        "auth": {
            "connected": supabase_auth_connected,
            "provider": "Supabase Auth"
        },
        "storage": {
            "connected": r2_connected,
            "bucket": r2_bucket,
            "provider": "Cloudflare R2"
        }
    }
