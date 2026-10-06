import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from app.domain.schemas.turma import TurmaCreate, TurmaUpdate, TurmaRead, TurmaConformidadeRead
from app.infrastructure.database.models.turma import Turma
from app.infrastructure.repositories.turma_repository import SQLAlchemyTurmaRepository
from app.infrastructure.api.dependencies import get_current_tenant_id, get_turma_repository

router = APIRouter(prefix="/turmas", tags=["Turmas"])

@router.post("", response_model=TurmaRead, status_code=status.HTTP_201_CREATED)
async def create_turma(
    turma_in: TurmaCreate,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    repo: SQLAlchemyTurmaRepository = Depends(get_turma_repository)
):
    existing = await repo.get_by_codigo(codigo=turma_in.codigo, tenant_id=tenant_id)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ja existe uma Turma cadastrada com este codigo neste Tenant."
        )

    nova_turma = Turma(
        tenant_id=tenant_id,
        codigo=turma_in.codigo,
        nome=turma_in.nome,
        semestre_referencia=turma_in.semestre_referencia,
        instituicao_id=turma_in.instituicao_id
    )

    turma_criada = await repo.create(nova_turma)
    return turma_criada

@router.get("", response_model=List[TurmaRead], status_code=status.HTTP_200_OK)
async def list_turmas(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    repo: SQLAlchemyTurmaRepository = Depends(get_turma_repository)
):
    return await repo.list_all(tenant_id=tenant_id, skip=skip, limit=limit)

@router.get("/{turma_id}", response_model=TurmaRead, status_code=status.HTTP_200_OK)
async def get_turma(
    turma_id: uuid.UUID,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    repo: SQLAlchemyTurmaRepository = Depends(get_turma_repository)
):
    turma = await repo.get_by_id(entity_id=turma_id, tenant_id=tenant_id)
    if not turma:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Turma nao encontrada."
        )
    return turma

@router.patch("/{turma_id}", response_model=TurmaRead, status_code=status.HTTP_200_OK)
async def update_turma(
    turma_id: uuid.UUID,
    turma_in: TurmaUpdate,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    repo: SQLAlchemyTurmaRepository = Depends(get_turma_repository)
):
    turma = await repo.get_by_id(entity_id=turma_id, tenant_id=tenant_id)
    if not turma:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Turma nao encontrada."
        )

    update_data = turma_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(turma, field, value)

    turma_atualizada = await repo.update(turma)
    return turma_atualizada

@router.delete("/{turma_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_turma(
    turma_id: uuid.UUID,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    repo: SQLAlchemyTurmaRepository = Depends(get_turma_repository)
):
    removido = await repo.delete(entity_id=turma_id, tenant_id=tenant_id)
    if not removido:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Turma nao encontrada."
        )
    return None

@router.get("/{turma_id}/conformidade", response_model=TurmaConformidadeRead, status_code=status.HTTP_200_OK)
async def get_turma_conformidade(
    turma_id: uuid.UUID,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    repo: SQLAlchemyTurmaRepository = Depends(get_turma_repository)
):
    metricas = await repo.get_metricas_conformidade(turma_id=turma_id, tenant_id=tenant_id)
    if not metricas:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Turma nao encontrada."
        )
    return metricas
