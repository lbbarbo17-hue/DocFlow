import uuid
from typing import Optional, Dict, Any
from contextvars import ContextVar
from sqlalchemy.ext.asyncio import AsyncSession
from app.infrastructure.database.models.audit_log import AuditLog

current_tenant_id: ContextVar[Optional[uuid.UUID]] = ContextVar("current_tenant_id", default=None)
current_user_id: ContextVar[Optional[uuid.UUID]] = ContextVar("current_user_id", default=None)
current_ip_address: ContextVar[Optional[str]] = ContextVar("current_ip_address", default=None)

def set_audit_context(
    tenant_id: uuid.UUID,
    user_id: Optional[uuid.UUID] = None,
    ip_address: Optional[str] = None
) -> None:
    current_tenant_id.set(tenant_id)
    current_user_id.set(user_id)
    current_ip_address.set(ip_address)

async def create_audit_entry(
    session: AsyncSession,
    action: str,
    resource_type: str,
    resource_id: Optional[uuid.UUID] = None,
    tenant_id: Optional[uuid.UUID] = None,
    user_id: Optional[uuid.UUID] = None,
    ip_address: Optional[str] = None,
    detalhes: Optional[Dict[str, Any]] = None
) -> AuditLog:
    resolved_tenant_id = tenant_id or current_tenant_id.get()
    if not resolved_tenant_id:
        raise ValueError("tenant_id é obrigatório para registrar auditoria.")

    audit_entry = AuditLog(
        tenant_id=resolved_tenant_id,
        user_id=user_id or current_user_id.get(),
        action=action,
        resource_id=resource_id,
        resource_type=resource_type,
        ip_address=ip_address or current_ip_address.get(),
        detalhes=detalhes
    )
    session.add(audit_entry)
    return audit_entry
