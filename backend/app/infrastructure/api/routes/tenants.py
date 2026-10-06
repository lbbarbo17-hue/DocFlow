import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.domain.schemas.tenant import TenantCreate, TenantRead
from app.infrastructure.database.models.tenant import Tenant
from app.infrastructure.api.dependencies import get_db

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
