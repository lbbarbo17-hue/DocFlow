from fastapi import APIRouter, status, HTTPException
from app.infrastructure.database.session import check_database_connection

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
