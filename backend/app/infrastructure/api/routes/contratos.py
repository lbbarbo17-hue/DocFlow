import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from app.domain.schemas.contrato import ContratoCreate, ContratoUpdate, ContratoRead
from app.infrastructure.database.models.contrato import Contrato
from app.infrastructure.repositories.contrato_repository import SQLAlchemyContratoRepository
from app.infrastructure.repositories.aluno_repository import SQLAlchemyAlunoRepository
from app.infrastructure.api.dependencies import (
    get_current_tenant_id,
    get_contrato_repository,
    get_aluno_repository
)

router = APIRouter(prefix="/contratos", tags=["Contratos"])

@router.post("", response_model=ContratoRead, status_code=status.HTTP_201_CREATED)
async def create_contrato(
    payload: ContratoCreate,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    aluno_repo: SQLAlchemyAlunoRepository = Depends(get_aluno_repository),
    contrato_repo: SQLAlchemyContratoRepository = Depends(get_contrato_repository)
):
    aluno = await aluno_repo.get_by_id(entity_id=payload.aluno_id, tenant_id=tenant_id)
    if not aluno:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Aluno nao encontrado neste Tenant."
        )

    existing_numero = await contrato_repo.get_by_numero(numero_contrato=payload.numero_contrato, tenant_id=tenant_id)
    if existing_numero:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ja existe um Contrato com este numero neste Tenant."
        )

    novo_contrato = Contrato(
        tenant_id=tenant_id,
        aluno_id=payload.aluno_id,
        empresa_id=payload.empresa_id,
        instituicao_id=payload.instituicao_id,
        numero_contrato=payload.numero_contrato,
        data_inicio=payload.data_inicio,
        data_fim=payload.data_fim,
        valor_bolsa=payload.valor_bolsa
    )

    return await contrato_repo.create(novo_contrato)

@router.get("", response_model=List[ContratoRead], status_code=status.HTTP_200_OK)
async def list_contratos(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    contrato_repo: SQLAlchemyContratoRepository = Depends(get_contrato_repository)
):
    return await contrato_repo.list_all(tenant_id=tenant_id, skip=skip, limit=limit)

@router.get("/aluno/{aluno_id}", response_model=List[ContratoRead], status_code=status.HTTP_200_OK)
async def list_contratos_por_aluno(
    aluno_id: uuid.UUID,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    contrato_repo: SQLAlchemyContratoRepository = Depends(get_contrato_repository)
):
    return await contrato_repo.list_by_aluno(aluno_id=aluno_id, tenant_id=tenant_id)

@router.get("/{contrato_id}", response_model=ContratoRead, status_code=status.HTTP_200_OK)
async def get_contrato(
    contrato_id: uuid.UUID,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    contrato_repo: SQLAlchemyContratoRepository = Depends(get_contrato_repository)
):
    contrato = await contrato_repo.get_by_id(entity_id=contrato_id, tenant_id=tenant_id)
    if not contrato:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contrato nao encontrado."
        )
    return contrato

@router.patch("/{contrato_id}", response_model=ContratoRead, status_code=status.HTTP_200_OK)
async def update_contrato(
    contrato_id: uuid.UUID,
    payload: ContratoUpdate,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    contrato_repo: SQLAlchemyContratoRepository = Depends(get_contrato_repository)
):
    contrato = await contrato_repo.get_by_id(entity_id=contrato_id, tenant_id=tenant_id)
    if not contrato:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contrato nao encontrado."
        )

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(contrato, field, value)

    return await contrato_repo.update(contrato)

@router.delete("/{contrato_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_contrato(
    contrato_id: uuid.UUID,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    contrato_repo: SQLAlchemyContratoRepository = Depends(get_contrato_repository)
):
    removido = await contrato_repo.delete(entity_id=contrato_id, tenant_id=tenant_id)
    if not removido:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contrato nao encontrado."
        )
    return None
