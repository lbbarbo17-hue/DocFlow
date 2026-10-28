import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, status
from app.domain.schemas.aluno import AlunoCreate, AlunoUpdate, AlunoRead
from app.infrastructure.database.models.aluno import Aluno
from app.infrastructure.repositories.aluno_repository import SQLAlchemyAlunoRepository
from app.infrastructure.api.dependencies import get_current_tenant_id, get_aluno_repository, get_storage_service
from app.application.services.file_validator import compute_file_hash_and_size
from app.application.services.storage_service import R2StorageService

router = APIRouter(prefix="/alunos", tags=["Alunos"])

@router.post("", response_model=AlunoRead, status_code=status.HTTP_201_CREATED)
async def create_aluno(
    aluno_in: AlunoCreate,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    repo: SQLAlchemyAlunoRepository = Depends(get_aluno_repository)
):
    existing_cpf = await repo.get_by_cpf(cpf=aluno_in.cpf, tenant_id=tenant_id)
    if existing_cpf:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ja existe um Aluno com este CPF neste Tenant."
        )

    existing_matricula = await repo.get_by_matricula(matricula=aluno_in.matricula, tenant_id=tenant_id)
    if existing_matricula:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ja existe um Aluno com esta Matricula neste Tenant."
        )

    novo_aluno = Aluno(
        tenant_id=tenant_id,
        nome=aluno_in.nome,
        cpf=aluno_in.cpf,
        email=aluno_in.email,
        matricula=aluno_in.matricula,
        status=aluno_in.status,
        instituicao_id=aluno_in.instituicao_id,
        empresa_id=aluno_in.empresa_id,
        turma_id=aluno_in.turma_id
    )

    aluno_criado = await repo.create(novo_aluno)
    return aluno_criado

@router.get("", response_model=List[AlunoRead], status_code=status.HTTP_200_OK)
async def list_alunos(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    repo: SQLAlchemyAlunoRepository = Depends(get_aluno_repository)
):
    return await repo.list_all(tenant_id=tenant_id, skip=skip, limit=limit)

@router.get("/{aluno_id}", response_model=AlunoRead, status_code=status.HTTP_200_OK)
async def get_aluno(
    aluno_id: uuid.UUID,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    repo: SQLAlchemyAlunoRepository = Depends(get_aluno_repository)
):
    aluno = await repo.get_by_id(entity_id=aluno_id, tenant_id=tenant_id)
    if not aluno:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Aluno nao encontrado."
        )
    return aluno

@router.patch("/{aluno_id}", response_model=AlunoRead, status_code=status.HTTP_200_OK)
async def update_aluno(
    aluno_id: uuid.UUID,
    aluno_in: AlunoUpdate,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    repo: SQLAlchemyAlunoRepository = Depends(get_aluno_repository)
):
    aluno = await repo.get_by_id(entity_id=aluno_id, tenant_id=tenant_id)
    if not aluno:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Aluno nao encontrado."
        )

    update_data = aluno_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(aluno, field, value)

    aluno_atualizado = await repo.update(aluno)
    return aluno_atualizado

@router.delete("/{aluno_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_aluno(
    aluno_id: uuid.UUID,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    repo: SQLAlchemyAlunoRepository = Depends(get_aluno_repository)
):
    removido = await repo.delete(entity_id=aluno_id, tenant_id=tenant_id)
    if not removido:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Aluno nao encontrado."
        )
    return None

@router.post("/{aluno_id}/avatar", response_model=AlunoRead, status_code=status.HTTP_200_OK)
async def upload_aluno_avatar(
    aluno_id: uuid.UUID,
    file: UploadFile = File(...),
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    repo: SQLAlchemyAlunoRepository = Depends(get_aluno_repository),
    storage_service: R2StorageService = Depends(get_storage_service)
):
    aluno = await repo.get_by_id(entity_id=aluno_id, tenant_id=tenant_id)
    if not aluno:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Aluno nao encontrado."
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
            detail="Foto de perfil deve ser imagem JPEG ou PNG."
        )

    ext = "jpg" if mime_type == "image/jpeg" else "png"
    storage_path = f"tenants/{tenant_id}/alunos/{aluno_id}/avatar_{sha256_hash[:8]}.{ext}"

    storage_service.upload_file(
        file_bytes=content,
        file_path=storage_path,
        content_type=mime_type
    )

    aluno.avatar_path = storage_path
    aluno_atualizado = await repo.update(aluno)
    return aluno_atualizado

@router.get("/{aluno_id}/avatar-url", status_code=status.HTTP_200_OK)
async def get_aluno_avatar_url(
    aluno_id: uuid.UUID,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    repo: SQLAlchemyAlunoRepository = Depends(get_aluno_repository),
    storage_service: R2StorageService = Depends(get_storage_service)
):
    aluno = await repo.get_by_id(entity_id=aluno_id, tenant_id=tenant_id)
    if not aluno:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Aluno nao encontrado."
        )

    if not aluno.avatar_path:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Aluno nao possui foto de perfil."
        )

    url = storage_service.generate_download_url(file_path=aluno.avatar_path)
    return {"avatar_url": url}
