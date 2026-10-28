import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.domain.schemas.tenant import TenantCreate, TenantRead
from app.infrastructure.database.models.tenant import Tenant
from app.infrastructure.api.dependencies import get_db, get_storage_service
from app.application.services.file_validator import compute_file_hash_and_size
from app.application.services.storage_service import R2StorageService

router = APIRouter(prefix="/tenants", tags=["Tenants"])

@router.post("", response_model=TenantRead, status_code=status.HTTP_201_CREATED)
async def create_tenant(
    tenant_in: TenantCreate,
    session: AsyncSession = Depends(get_db)
):
    query_existing = select(Tenant).where(Tenant.cnpj == tenant_in.cnpj)
    result = await session.execute(query_existing)
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ja existe um Tenant cadastrado com este CNPJ."
        )

    tenant = Tenant(
        nome=tenant_in.nome,
        cnpj=tenant_in.cnpj,
        tipo=tenant_in.tipo
    )
    session.add(tenant)
    await session.commit()
    await session.refresh(tenant)
    return tenant

@router.get("", response_model=List[TenantRead], status_code=status.HTTP_200_OK)
async def list_tenants(
    session: AsyncSession = Depends(get_db)
):
    query = select(Tenant).where(Tenant.ativo.is_(True)).order_by(Tenant.nome)
    result = await session.execute(query)
    return list(result.scalars().all())

@router.get("/{tenant_id}", response_model=TenantRead, status_code=status.HTTP_200_OK)
async def get_tenant_by_id(
    tenant_id: uuid.UUID,
    session: AsyncSession = Depends(get_db)
):
    query = select(Tenant).where(Tenant.id == tenant_id, Tenant.ativo.is_(True))
    result = await session.execute(query)
    tenant = result.scalar_one_or_none()
    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant nao encontrado."
        )
    return tenant

@router.post("/{tenant_id}/logo", response_model=TenantRead, status_code=status.HTTP_200_OK)
async def upload_tenant_logo(
    tenant_id: uuid.UUID,
    file: UploadFile = File(...),
    session: AsyncSession = Depends(get_db),
    storage_service: R2StorageService = Depends(get_storage_service)
):
    query = select(Tenant).where(Tenant.id == tenant_id, Tenant.ativo.is_(True))
    result = await session.execute(query)
    tenant = result.scalar_one_or_none()
    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant nao encontrado."
        )

    content = await file.read()
    try:
        sha256_hash, _, mime_type = compute_file_hash_and_size(content)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc)
        )

    if mime_type not in ["image/jpeg", "image/png"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Logotipo deve ser imagem JPEG ou PNG."
        )

    ext = "jpg" if mime_type == "image/jpeg" else "png"
    storage_path = f"tenants/{tenant_id}/logo_{sha256_hash[:8]}.{ext}"

    storage_service.upload_file(
        file_bytes=content,
        file_path=storage_path,
        content_type=mime_type
    )

    tenant.logo_path = storage_path
    await session.commit()
    await session.refresh(tenant)
    return tenant

@router.get("/{tenant_id}/logo-url", status_code=status.HTTP_200_OK)
async def get_tenant_logo_url(
    tenant_id: uuid.UUID,
    session: AsyncSession = Depends(get_db),
    storage_service: R2StorageService = Depends(get_storage_service)
):
    query = select(Tenant).where(Tenant.id == tenant_id, Tenant.ativo.is_(True))
    result = await session.execute(query)
    tenant = result.scalar_one_or_none()
    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant nao encontrado."
        )

    if not tenant.logo_path:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant nao possui logotipo cadastrado."
        )

    url = storage_service.generate_download_url(file_path=tenant.logo_path)
    return {"logo_url": url}
