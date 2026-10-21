import uuid
from typing import List, Optional, Any, Dict
from datetime import datetime
from fastapi import APIRouter, Depends, Query, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.infrastructure.api.dependencies import get_db, get_current_tenant_id, get_current_user
from app.infrastructure.database.models.audit_log import AuditLog
from app.infrastructure.database.models.usuario import Usuario

router = APIRouter(prefix="/auditoria", tags=["Auditoria"])

class AuditLogCreate(BaseModel):
    action: str = Field(..., max_length=50)
    resource_id: Optional[uuid.UUID] = None
    resource_type: str = Field(..., max_length=100)
    user_id: Optional[uuid.UUID] = None
    ip_address: Optional[str] = Field(None, max_length=45)
    detalhes: Optional[Dict[str, Any]] = None

class AuditLogResponse(BaseModel):
    id: uuid.UUID
    tenant_id: uuid.UUID
    user_id: Optional[uuid.UUID] = None
    action: str
    resource_id: Optional[uuid.UUID] = None
    resource_type: str
    ip_address: Optional[str] = None
    detalhes: Optional[Dict[str, Any]] = None
    timestamp_utc: datetime

    class Config:
        from_attributes = True

@router.get("", response_model=List[AuditLogResponse], status_code=status.HTTP_200_OK)
async def list_audit_logs(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db)
):
    query = (
        select(AuditLog)
        .where(AuditLog.tenant_id == tenant_id)
        .order_by(desc(AuditLog.timestamp_utc))
        .offset(skip)
        .limit(limit)
    )
    result = await db.execute(query)
    logs = result.scalars().all()
    return logs

@router.post("", response_model=AuditLogResponse, status_code=status.HTTP_201_CREATED)
async def create_audit_log(
    payload: AuditLogCreate,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    current_user: Optional[Usuario] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    resolved_user_id = payload.user_id or (current_user.id if current_user else None)
    log_entry = AuditLog(
        tenant_id=tenant_id,
        user_id=resolved_user_id,
        action=payload.action,
        resource_id=payload.resource_id,
        resource_type=payload.resource_type,
        ip_address=payload.ip_address or "127.0.0.1",
        detalhes=payload.detalhes
    )
    db.add(log_entry)
    await db.commit()
    await db.refresh(log_entry)
    return log_entry
