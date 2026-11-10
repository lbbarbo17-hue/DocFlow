import uuid
from datetime import datetime, timezone
from unittest.mock import AsyncMock
import pytest
import httpx
from app.main import app
from app.domain.enums import StatusAluno
from app.infrastructure.database.models.aluno import Aluno
from app.infrastructure.api.dependencies import get_aluno_repository, get_usuario_repository

def create_mock_aluno(tenant_id: uuid.UUID, aluno_id: uuid.UUID = None) -> Aluno:
    aluno = Aluno()
    aluno.id = aluno_id or uuid.uuid4()
    aluno.tenant_id = tenant_id
    aluno.nome = "Beatriz Helena"
    aluno.cpf = "11144477735"
    aluno.email = "beatriz@escola.sp.gov.br"
    aluno.matricula = "20261042"
    aluno.status = StatusAluno.ATIVO
    aluno.instituicao_id = None
    aluno.empresa_id = None
    aluno.turma_id = None
    aluno.ativo = True
    aluno.avatar_path = None
    aluno.created_at = datetime.now(timezone.utc)
    aluno.updated_at = datetime.now(timezone.utc)
    return aluno

@pytest.mark.asyncio
async def test_list_alunos_success(async_client: httpx.AsyncClient, sample_tenant_id: uuid.UUID, auth_headers: dict):
    mock_repo = AsyncMock()
    mock_repo.list_all.return_value = [create_mock_aluno(sample_tenant_id)]

    app.dependency_overrides[get_aluno_repository] = lambda: mock_repo
    try:
        response = await async_client.get("/api/v1/alunos", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["nome"] == "Beatriz Helena"
        assert data[0]["matricula"] == "20261042"
    finally:
        app.dependency_overrides.pop(get_aluno_repository, None)

@pytest.mark.asyncio
async def test_export_alunos_csv(async_client: httpx.AsyncClient, sample_tenant_id: uuid.UUID, auth_headers: dict):
    mock_repo = AsyncMock()
    mock_repo.list_all.return_value = [create_mock_aluno(sample_tenant_id)]

    app.dependency_overrides[get_aluno_repository] = lambda: mock_repo
    try:
        response = await async_client.get("/api/v1/alunos/export", headers=auth_headers)
        assert response.status_code == 200
        assert response.headers["content-type"].startswith("text/csv")
        assert "filename=relatorio_estudantes.csv" in response.headers["content-disposition"]
        text = response.text
        assert "Nome;Matricula;CPF;Email;Status;Ativo" in text
        assert "Beatriz Helena" in text
        assert "20261042" in text
    finally:
        app.dependency_overrides.pop(get_aluno_repository, None)

@pytest.mark.asyncio
async def test_get_aluno_by_id_success(async_client: httpx.AsyncClient, sample_tenant_id: uuid.UUID, auth_headers: dict):
    target_id = uuid.uuid4()
    mock_repo = AsyncMock()
    mock_repo.get_by_id.return_value = create_mock_aluno(sample_tenant_id, target_id)

    app.dependency_overrides[get_aluno_repository] = lambda: mock_repo
    try:
        response = await async_client.get(f"/api/v1/alunos/{target_id}", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == str(target_id)
        assert data["nome"] == "Beatriz Helena"
    finally:
        app.dependency_overrides.pop(get_aluno_repository, None)

@pytest.mark.asyncio
async def test_get_aluno_by_id_not_found(async_client: httpx.AsyncClient, sample_tenant_id: uuid.UUID, auth_headers: dict):
    target_id = uuid.uuid4()
    mock_repo = AsyncMock()
    mock_repo.get_by_id.return_value = None

    app.dependency_overrides[get_aluno_repository] = lambda: mock_repo
    try:
        response = await async_client.get(f"/api/v1/alunos/{target_id}", headers=auth_headers)
        assert response.status_code == 404
        assert "Aluno nao encontrado" in response.json()["detail"]
    finally:
        app.dependency_overrides.pop(get_aluno_repository, None)

@pytest.mark.asyncio
async def test_create_aluno_success(async_client: httpx.AsyncClient, sample_tenant_id: uuid.UUID, auth_headers: dict):
    payload = {
        "nome": "Beatriz Helena",
        "cpf": "11144477735",
        "email": "beatriz@escola.sp.gov.br",
        "matricula": "20261042",
        "status": "ATIVO"
    }
    mock_repo = AsyncMock()
    mock_repo.get_by_cpf.return_value = None
    mock_repo.get_by_email.return_value = None
    mock_repo.get_by_matricula.return_value = None
    mock_repo.create.return_value = create_mock_aluno(sample_tenant_id)

    mock_user_repo = AsyncMock()
    mock_user_repo.get_by_email.return_value = None

    app.dependency_overrides[get_aluno_repository] = lambda: mock_repo
    app.dependency_overrides[get_usuario_repository] = lambda: mock_user_repo
    try:
        response = await async_client.post("/api/v1/alunos", json=payload, headers=auth_headers)
        assert response.status_code == 201
        data = response.json()
        assert data["nome"] == "Beatriz Helena"
    finally:
        app.dependency_overrides.pop(get_aluno_repository, None)
        app.dependency_overrides.pop(get_usuario_repository, None)

@pytest.mark.asyncio
async def test_create_aluno_conflict_cpf(async_client: httpx.AsyncClient, sample_tenant_id: uuid.UUID, auth_headers: dict):
    payload = {
        "nome": "Beatriz Helena",
        "cpf": "11144477735",
        "email": "beatriz@escola.sp.gov.br",
        "matricula": "20261042",
        "status": "ATIVO"
    }
    mock_repo = AsyncMock()
    mock_repo.get_by_cpf.return_value = create_mock_aluno(sample_tenant_id)
    mock_repo.get_by_email.return_value = None

    mock_user_repo = AsyncMock()
    mock_user_repo.get_by_email.return_value = None

    app.dependency_overrides[get_aluno_repository] = lambda: mock_repo
    app.dependency_overrides[get_usuario_repository] = lambda: mock_user_repo
    try:
        response = await async_client.post("/api/v1/alunos", json=payload, headers=auth_headers)
        assert response.status_code == 409
        assert "CPF" in response.json()["detail"]
    finally:
        app.dependency_overrides.pop(get_aluno_repository, None)
        app.dependency_overrides.pop(get_usuario_repository, None)

@pytest.mark.asyncio
async def test_create_aluno_conflict_usuario_email(async_client: httpx.AsyncClient, sample_tenant_id: uuid.UUID, auth_headers: dict):
    payload = {
        "nome": "Beatriz Helena",
        "cpf": "11144477735",
        "email": "beatriz@escola.sp.gov.br",
        "matricula": "20261042",
        "status": "ATIVO"
    }
    mock_repo = AsyncMock()
    mock_user_repo = AsyncMock()
    mock_user_repo.get_by_email.return_value = object()

    app.dependency_overrides[get_aluno_repository] = lambda: mock_repo
    app.dependency_overrides[get_usuario_repository] = lambda: mock_user_repo
    try:
        response = await async_client.post("/api/v1/alunos", json=payload, headers=auth_headers)
        assert response.status_code == 409
        assert "coordenador ou administrador" in response.json()["detail"]
    finally:
        app.dependency_overrides.pop(get_aluno_repository, None)
        app.dependency_overrides.pop(get_usuario_repository, None)

@pytest.mark.asyncio
async def test_create_aluno_conflict_aluno_email(async_client: httpx.AsyncClient, sample_tenant_id: uuid.UUID, auth_headers: dict):
    payload = {
        "nome": "Beatriz Helena",
        "cpf": "11144477735",
        "email": "beatriz@escola.sp.gov.br",
        "matricula": "20261042",
        "status": "ATIVO"
    }
    mock_repo = AsyncMock()
    mock_repo.get_by_cpf.return_value = None
    mock_repo.get_by_email.return_value = create_mock_aluno(sample_tenant_id)

    mock_user_repo = AsyncMock()
    mock_user_repo.get_by_email.return_value = None

    app.dependency_overrides[get_aluno_repository] = lambda: mock_repo
    app.dependency_overrides[get_usuario_repository] = lambda: mock_user_repo
    try:
        response = await async_client.post("/api/v1/alunos", json=payload, headers=auth_headers)
        assert response.status_code == 409
        assert "e-mail neste Tenant" in response.json()["detail"]
    finally:
        app.dependency_overrides.pop(get_aluno_repository, None)
        app.dependency_overrides.pop(get_usuario_repository, None)

@pytest.mark.asyncio
async def test_delete_aluno_success(async_client: httpx.AsyncClient, sample_tenant_id: uuid.UUID, auth_headers: dict):
    target_id = uuid.uuid4()
    mock_repo = AsyncMock()
    mock_repo.delete.return_value = True

    app.dependency_overrides[get_aluno_repository] = lambda: mock_repo
    try:
        response = await async_client.delete(f"/api/v1/alunos/{target_id}", headers=auth_headers)
        assert response.status_code == 204
    finally:
        app.dependency_overrides.pop(get_aluno_repository, None)

@pytest.mark.asyncio
async def test_delete_aluno_not_found(async_client: httpx.AsyncClient, sample_tenant_id: uuid.UUID, auth_headers: dict):
    target_id = uuid.uuid4()
    mock_repo = AsyncMock()
    mock_repo.delete.return_value = False

    app.dependency_overrides[get_aluno_repository] = lambda: mock_repo
    try:
        response = await async_client.delete(f"/api/v1/alunos/{target_id}", headers=auth_headers)
        assert response.status_code == 404
    finally:
        app.dependency_overrides.pop(get_aluno_repository, None)
