import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from app.domain.schemas.catalogo import EmpresaCreate, EmpresaUpdate, EmpresaRead
from app.infrastructure.database.models.catalogo import Empresa
from app.infrastructure.repositories.catalogo_repository import SQLAlchemyEmpresaRepository
from app.infrastructure.api.dependencies import get_current_tenant_id, get_empresa_repository

router = APIRouter(prefix="/empresas", tags=["Empresas"])

@router.post("", response_model=EmpresaRead, status_code=status.HTTP_201_CREATED)
async def create_empresa(
    payload: EmpresaCreate,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    repo: SQLAlchemyEmpresaRepository = Depends(get_empresa_repository)
):
    existing = await repo.get_by_cnpj(cnpj=payload.cnpj, tenant_id=tenant_id)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ja existe uma Empresa com este CNPJ neste Tenant."
        )

    nova_empresa = Empresa(
        tenant_id=tenant_id,
        razao_social=payload.razao_social,
        nome_fantasia=payload.nome_fantasia,
        cnpj=payload.cnpj,
        ramo_atividade=payload.ramo_atividade
    )

    return await repo.create(nova_empresa)

@router.get("", response_model=List[EmpresaRead], status_code=status.HTTP_200_OK)
async def list_empresas(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    repo: SQLAlchemyEmpresaRepository = Depends(get_empresa_repository)
):
    return await repo.list_all(tenant_id=tenant_id, skip=skip, limit=limit)

@router.get("/{empresa_id}", response_model=EmpresaRead, status_code=status.HTTP_200_OK)
async def get_empresa(
    empresa_id: uuid.UUID,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    repo: SQLAlchemyEmpresaRepository = Depends(get_empresa_repository)
):
    emp = await repo.get_by_id(entity_id=empresa_id, tenant_id=tenant_id)
    if not emp:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Empresa nao encontrada."
        )
    return emp

@router.patch("/{empresa_id}", response_model=EmpresaRead, status_code=status.HTTP_200_OK)
async def update_empresa(
    empresa_id: uuid.UUID,
    payload: EmpresaUpdate,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    repo: SQLAlchemyEmpresaRepository = Depends(get_empresa_repository)
):
    emp = await repo.get_by_id(entity_id=empresa_id, tenant_id=tenant_id)
    if not emp:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Empresa nao encontrada."
        )

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(emp, field, value)

    return await repo.update(emp)

@router.delete("/{empresa_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_empresa(
    empresa_id: uuid.UUID,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    repo: SQLAlchemyEmpresaRepository = Depends(get_empresa_repository)
):
    removido = await repo.delete(entity_id=empresa_id, tenant_id=tenant_id)
    if not removido:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Empresa nao encontrada."
        )
    return None
