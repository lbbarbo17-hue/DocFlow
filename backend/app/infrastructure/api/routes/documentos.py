import uuid
from datetime import date
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from app.domain.enums import TipoDocumento, StatusDocumento
from app.domain.schemas.documento import DocumentoRead, DocumentoValidate
from app.application.services.file_validator import compute_file_hash_and_size
from app.infrastructure.database.models.documento import Documento
from app.infrastructure.repositories.documento_repository import SQLAlchemyDocumentoRepository
from app.infrastructure.repositories.aluno_repository import SQLAlchemyAlunoRepository
from app.infrastructure.api.dependencies import (
    get_current_tenant_id,
    get_documento_repository,
    get_aluno_repository
)

router = APIRouter(prefix="/documentos", tags=["Documentos"])

@router.post("/upload", response_model=DocumentoRead, status_code=status.HTTP_201_CREATED)
async def upload_documento(
    file: UploadFile = File(...),
    aluno_id: uuid.UUID = Form(...),
    tipo: TipoDocumento = Form(...),
    data_validade: Optional[date] = Form(None),
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    aluno_repo: SQLAlchemyAlunoRepository = Depends(get_aluno_repository),
    doc_repo: SQLAlchemyDocumentoRepository = Depends(get_documento_repository)
):
    aluno = await aluno_repo.get_by_id(entity_id=aluno_id, tenant_id=tenant_id)
    if not aluno:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Aluno nao encontrado neste Tenant."
        )

    content = await file.read()
    try:
        sha256_hash, tamanho_bytes, mime_type = compute_file_hash_and_size(content)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc)
        )

    existing_doc = await doc_repo.get_by_hash(file_hash=sha256_hash, tenant_id=tenant_id)
    if existing_doc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Este arquivo identico ja foi enviado anteriormente."
        )

    safe_filename = file.filename or "documento"
    storage_path = f"tenants/{tenant_id}/alunos/{aluno_id}/{sha256_hash[:16]}_{safe_filename}"

    novo_documento = Documento(
        tenant_id=tenant_id,
        aluno_id=aluno_id,
        tipo=tipo,
        storage_path=storage_path,
        file_hash=sha256_hash,
        mime_type=mime_type,
        tamanho_bytes=tamanho_bytes,
        status=StatusDocumento.PENDENTE,
        data_validade=data_validade
    )

    documento_salvo = await doc_repo.create(novo_documento)
    return documento_salvo

@router.get("/aluno/{aluno_id}", response_model=List[DocumentoRead], status_code=status.HTTP_200_OK)
async def list_documentos_aluno(
    aluno_id: uuid.UUID,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    doc_repo: SQLAlchemyDocumentoRepository = Depends(get_documento_repository)
):
    return await doc_repo.list_by_aluno(aluno_id=aluno_id, tenant_id=tenant_id)

@router.get("/{documento_id}", response_model=DocumentoRead, status_code=status.HTTP_200_OK)
async def get_documento(
    documento_id: uuid.UUID,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    doc_repo: SQLAlchemyDocumentoRepository = Depends(get_documento_repository)
):
    doc = await doc_repo.get_by_id(entity_id=documento_id, tenant_id=tenant_id)
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Documento nao encontrado."
        )
    return doc

@router.post("/{documento_id}/validate", response_model=DocumentoRead, status_code=status.HTTP_200_OK)
async def validate_documento(
    documento_id: uuid.UUID,
    payload: DocumentoValidate,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    doc_repo: SQLAlchemyDocumentoRepository = Depends(get_documento_repository)
):
    doc = await doc_repo.get_by_id(entity_id=documento_id, tenant_id=tenant_id)
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Documento nao encontrado."
        )

    if payload.status == StatusDocumento.RECUSADO and not payload.justificativa_recusa:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Justificativa e obrigatoria para recusa de documento."
        )

    doc.status = payload.status
    doc.justificativa_recusa = payload.justificativa_recusa
    doc.validado_por_user_id = payload.validado_por_user_id

    doc_atualizado = await doc_repo.update(doc)
    return doc_atualizado
