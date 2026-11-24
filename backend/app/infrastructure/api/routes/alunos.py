import uuid
import csv
import io
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, status, Response
from app.domain.enums import TipoVinculo, TipoDocumento
from app.domain.schemas.aluno import AlunoCreate, AlunoUpdate, AlunoRead
from app.infrastructure.database.models.aluno import Aluno, DadosAprendiz, DadosEstagiario
from app.infrastructure.repositories.aluno_repository import SQLAlchemyAlunoRepository
from app.infrastructure.repositories.usuario_repository import SQLAlchemyUsuarioRepository
from app.infrastructure.api.dependencies import get_current_tenant_id, get_aluno_repository, get_storage_service, get_usuario_repository
from app.application.services.file_validator import compute_file_hash_and_size
from app.application.services.storage_service import R2StorageService

router = APIRouter(prefix="/alunos", tags=["Alunos"])


def get_required_documents_by_vinculo(tipo_vinculo: TipoVinculo) -> List[dict]:
    base_docs = [
        {"tipo": TipoDocumento.RG.value, "nome": "RG"},
        {"tipo": TipoDocumento.CPF.value, "nome": "CPF"},
        {"tipo": TipoDocumento.COMPROVANTE_RESIDENCIA.value, "nome": "Comprovante de Residência"},
    ]
    if tipo_vinculo == TipoVinculo.ESTAGIARIO:
        return base_docs + [
            {"tipo": TipoDocumento.COMPROVANTE_MATRICULA.value, "nome": "Declaração de Matrícula"},
            {"tipo": TipoDocumento.TERMO_COMPROMISSO_ESTAGIO.value, "nome": "Termo de Compromisso de Estágio (TCE)"},
            {"tipo": TipoDocumento.APOLICE_SEGURO.value, "nome": "Apólice de Seguro"},
        ]
    return base_docs + [
        {"tipo": TipoDocumento.COMPROVANTE_MATRICULA.value, "nome": "Frequência Escolar"},
        {"tipo": TipoDocumento.CONTRATO_APRENDIZAGEM.value, "nome": "Contrato de Aprendizagem (CTPS)"},
    ]

@router.post("", response_model=AlunoRead, status_code=status.HTTP_201_CREATED)
async def create_aluno(
    aluno_in: AlunoCreate,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    repo: SQLAlchemyAlunoRepository = Depends(get_aluno_repository),
    usuario_repo: SQLAlchemyUsuarioRepository = Depends(get_usuario_repository)
):
    usuario_existente = await usuario_repo.get_by_email(str(aluno_in.email))
    if usuario_existente:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Este e-mail ja esta registrado como usuario coordenador ou administrador. Um mesmo e-mail nao pode pertencer a aluno e usuario simultaneamente."
        )

    existing_email = await repo.get_by_email(email=str(aluno_in.email), tenant_id=tenant_id)
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ja existe um Aluno com este e-mail neste Tenant."
        )

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
        tipo_vinculo=aluno_in.tipo_vinculo,
        status=aluno_in.status,
        instituicao_id=aluno_in.instituicao_id,
        empresa_id=aluno_in.empresa_id,
        turma_id=aluno_in.turma_id
    )

    if aluno_in.tipo_vinculo == TipoVinculo.APRENDIZ:
        ap_data = aluno_in.dados_aprendiz.model_dump() if aluno_in.dados_aprendiz else {}
        novo_aluno.dados_aprendiz = DadosAprendiz(tenant_id=tenant_id, **ap_data)
    elif aluno_in.tipo_vinculo == TipoVinculo.ESTAGIARIO:
        est_data = aluno_in.dados_estagiario.model_dump() if aluno_in.dados_estagiario else {}
        novo_aluno.dados_estagiario = DadosEstagiario(tenant_id=tenant_id, **est_data)

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

@router.get("/export", status_code=status.HTTP_200_OK)
async def export_alunos_csv(
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    repo: SQLAlchemyAlunoRepository = Depends(get_aluno_repository)
):
    alunos = await repo.list_all(tenant_id=tenant_id, skip=0, limit=1000)
    output = io.StringIO()
    output.write("\ufeff")
    writer = csv.writer(output, delimiter=";")
    writer.writerow(["Nome", "Matricula", "CPF", "Email", "Status", "Ativo"])
    for aluno in alunos:
        writer.writerow([
            aluno.nome,
            aluno.matricula,
            aluno.cpf,
            aluno.email,
            aluno.status.value if hasattr(aluno.status, "value") else str(aluno.status),
            "Sim" if aluno.ativo else "Nao"
        ])
    content = output.getvalue()
    return Response(
        content=content,
        media_type="text/csv",
        headers={
            "Content-Disposition": "attachment; filename=relatorio_estudantes.csv"
        }
    )

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

@router.get("/{aluno_id}/documentos-obrigatorios", status_code=status.HTTP_200_OK)
async def get_aluno_required_documents(
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
    vinculo = getattr(aluno, "tipo_vinculo", None) or TipoVinculo.APRENDIZ
    return {
        "aluno_id": str(aluno.id),
        "tipo_vinculo": vinculo.value if hasattr(vinculo, "value") else str(vinculo),
        "documentos": get_required_documents_by_vinculo(vinculo),
    }


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
    dados_aprendiz_in = update_data.pop("dados_aprendiz", None)
    dados_estagiario_in = update_data.pop("dados_estagiario", None)

    for field, value in update_data.items():
        setattr(aluno, field, value)

    if dados_aprendiz_in is not None:
        if aluno.dados_aprendiz is not None:
            for k, v in dados_aprendiz_in.items():
                setattr(aluno.dados_aprendiz, k, v)
        else:
            aluno.dados_aprendiz = DadosAprendiz(tenant_id=tenant_id, **dados_aprendiz_in)

    if dados_estagiario_in is not None:
        if aluno.dados_estagiario is not None:
            for k, v in dados_estagiario_in.items():
                setattr(aluno.dados_estagiario, k, v)
        else:
            aluno.dados_estagiario = DadosEstagiario(tenant_id=tenant_id, **dados_estagiario_in)

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
