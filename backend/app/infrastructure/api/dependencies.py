import os
import uuid
from typing import AsyncGenerator, Optional
import httpx
from fastapi import Depends, Header, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.infrastructure.database.session import get_db_session
from app.infrastructure.database.audit import set_audit_context
from app.infrastructure.database.models.usuario import Usuario
from app.infrastructure.repositories.aluno_repository import SQLAlchemyAlunoRepository
from app.infrastructure.repositories.documento_repository import SQLAlchemyDocumentoRepository
from app.infrastructure.repositories.turma_repository import SQLAlchemyTurmaRepository
from app.infrastructure.repositories.usuario_repository import SQLAlchemyUsuarioRepository
from app.application.services.storage_service import R2StorageService

SUPABASE_URL = os.getenv("SUPABASE_URL", "").rstrip("/")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "")

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async for session in get_db_session():
        yield session

async def get_current_tenant_id(
    x_tenant_id: Optional[str] = Header(None, alias="X-Tenant-ID")
) -> uuid.UUID:
    if not x_tenant_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Header X-Tenant-ID e obrigatorio para isolamento multi-tenant."
        )
    try:
        tenant_uuid = uuid.UUID(x_tenant_id)
        set_audit_context(tenant_id=tenant_uuid)
        return tenant_uuid
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Header X-Tenant-ID invalido. Deve ser um UUID valido."
        )

async def get_aluno_repository(
    session: AsyncSession = Depends(get_db)
) -> SQLAlchemyAlunoRepository:
    return SQLAlchemyAlunoRepository(session)

async def get_documento_repository(
    session: AsyncSession = Depends(get_db)
) -> SQLAlchemyDocumentoRepository:
    return SQLAlchemyDocumentoRepository(session)

async def get_turma_repository(
    session: AsyncSession = Depends(get_db)
) -> SQLAlchemyTurmaRepository:
    return SQLAlchemyTurmaRepository(session)

async def get_usuario_repository(
    session: AsyncSession = Depends(get_db)
) -> SQLAlchemyUsuarioRepository:
    return SQLAlchemyUsuarioRepository(session)

async def get_current_user(
    authorization: Optional[str] = Header(None),
    user_repo: SQLAlchemyUsuarioRepository = Depends(get_usuario_repository)
) -> Optional[Usuario]:
    if not authorization or not authorization.startswith("Bearer "):
        return None

    token = authorization.split(" ")[1]
    if not SUPABASE_URL or not SUPABASE_ANON_KEY:
        return None

    url = f"{SUPABASE_URL}/auth/v1/user"
    headers = {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": f"Bearer {token}"
    }

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            res = await client.get(url, headers=headers)
            if res.status_code == 200:
                user_data = res.json()
                supabase_uid = uuid.UUID(user_data["id"])
                user = await user_repo.get_by_supabase_id(supabase_uid)
                if not user and "email" in user_data:
                    user = await user_repo.get_by_email(user_data["email"])
                if user:
                    set_audit_context(tenant_id=user.tenant_id, user_id=user.id)
                return user
    except Exception:
        pass
    return None

def get_storage_service() -> R2StorageService:
    return R2StorageService()
