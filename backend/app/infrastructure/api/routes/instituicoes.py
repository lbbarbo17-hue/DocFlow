import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from app.domain.schemas.catalogo import InstituicaoCreate, InstituicaoUpdate, InstituicaoRead
from app.infrastructure.database.models.catalogo import Instituicao
from app.infrastructure.repositories.catalogo_repository import SQLAlchemyInstituicaoRepository
from app.infrastructure.api.dependencies import get_current_tenant_id, get_instituicao_repository

router = APIRouter(prefix="/instituicoes", tags=["Instituições"])

@router.post("", response_model=InstituicaoRead, status_code=status.HTTP_201_CREATED)
async def create_instituicao(
    payload: InstituicaoCreate,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    repo: SQLAlchemyInstituicaoRepository = Depends(get_instituicao_repository)
):
    existing = await repo.get_by_cnpj(cnpj=payload.cnpj, tenant_id=tenant_id)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ja existe uma Instituicao com este CNPJ neste Tenant."
        )

    nova_instituicao = Instituicao(
        tenant_id=tenant_id,
        razao_social=payload.razao_social,
        nome_fantasia=payload.nome_fantasia,
        cnpj=payload.cnpj,
        codigo_mec=payload.codigo_mec
    )

    return await repo.create(nova_instituicao)

@router.get("", response_model=List[InstituicaoRead], status_code=status.HTTP_200_OK)
async def list_instituicoes(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    repo: SQLAlchemyInstituicaoRepository = Depends(get_instituicao_repository)
):
    return await repo.list_all(tenant_id=tenant_id, skip=skip, limit=limit)

@router.get("/{instituicao_id}", response_model=InstituicaoRead, status_code=status.HTTP_200_OK)
async def get_instituicao(
    instituicao_id: uuid.UUID,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    repo: SQLAlchemyInstituicaoRepository = Depends(get_instituicao_repository)
):
    inst = await repo.get_by_id(entity_id=instituicao_id, tenant_id=tenant_id)
    if not inst:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Instituicao nao encontrada."
        )
    return inst

@router.patch("/{instituicao_id}", response_model=InstituicaoRead, status_code=status.HTTP_200_OK)
async def update_instituicao(
    instituicao_id: uuid.UUID,
    payload: InstituicaoUpdate,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    repo: SQLAlchemyInstituicaoRepository = Depends(get_instituicao_repository)
):
    inst = await repo.get_by_id(entity_id=instituicao_id, tenant_id=tenant_id)
    if not inst:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Instituicao nao encontrada."
        )

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(inst, field, value)

    return await repo.update(inst)

@router.delete("/{instituicao_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_instituicao(
    instituicao_id: uuid.UUID,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    repo: SQLAlchemyInstituicaoRepository = Depends(get_instituicao_repository)
):
    removido = await repo.delete(entity_id=instituicao_id, tenant_id=tenant_id)
    if not removido:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Instituicao nao encontrada."
        )
    return None
