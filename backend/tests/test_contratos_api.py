import uuid
from datetime import date, datetime, timezone
from decimal import Decimal
from unittest.mock import AsyncMock
import pytest
import httpx
from app.main import app
from app.infrastructure.database.models.contrato import Contrato
from app.infrastructure.api.dependencies import get_contrato_repository

def create_mock_contrato(tenant_id: uuid.UUID, contrato_id: uuid.UUID = None, aluno_id: uuid.UUID = None) -> Contrato:
    contrato = Contrato()
    contrato.id = contrato_id or uuid.uuid4()
    contrato.tenant_id = tenant_id
    contrato.aluno_id = aluno_id or uuid.uuid4()
    contrato.empresa_id = None
    contrato.instituicao_id = None
    contrato.numero_contrato = "CTR-2026-TEST"
    contrato.data_inicio = date(2026, 1, 15)
    contrato.data_fim = date(2027, 1, 15)
    contrato.valor_bolsa = Decimal("1412.00")
    contrato.ativo = True
    contrato.created_at = datetime.now(timezone.utc)
    contrato.updated_at = datetime.now(timezone.utc)
    return contrato

@pytest.mark.asyncio
async def test_list_contratos_por_aluno(async_client: httpx.AsyncClient, sample_tenant_id: uuid.UUID, auth_headers: dict):
    aluno_id = uuid.uuid4()
    mock_contrato = create_mock_contrato(sample_tenant_id, aluno_id=aluno_id)
    mock_repo = AsyncMock()
    mock_repo.list_by_aluno.return_value = [mock_contrato]

    app.dependency_overrides[get_contrato_repository] = lambda: mock_repo
    try:
        response = await async_client.get(f"/api/v1/contratos/aluno/{aluno_id}", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["numero_contrato"] == "CTR-2026-TEST"
        assert float(data[0]["valor_bolsa"]) == 1412.00
    finally:
        app.dependency_overrides.pop(get_contrato_repository, None)

@pytest.mark.asyncio
async def test_patch_contrato_valor_e_periodo(async_client: httpx.AsyncClient, sample_tenant_id: uuid.UUID, auth_headers: dict):
    contrato_id = uuid.uuid4()
    mock_contrato = create_mock_contrato(sample_tenant_id, contrato_id=contrato_id)
    
    mock_repo = AsyncMock()
    mock_repo.get_by_id.return_value = mock_contrato
    
    updated_contrato = create_mock_contrato(sample_tenant_id, contrato_id=contrato_id)
    updated_contrato.valor_bolsa = Decimal("1800.00")
    updated_contrato.data_fim = date(2027, 6, 30)
    mock_repo.update.return_value = updated_contrato

    app.dependency_overrides[get_contrato_repository] = lambda: mock_repo
    try:
        payload = {
            "valor_bolsa": "1800.00",
            "data_fim": "2027-06-30"
        }
        response = await async_client.patch(f"/api/v1/contratos/{contrato_id}", json=payload, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert float(data["valor_bolsa"]) == 1800.00
        assert data["data_fim"] == "2027-06-30"
    finally:
        app.dependency_overrides.pop(get_contrato_repository, None)

@pytest.mark.asyncio
async def test_patch_contrato_not_found(async_client: httpx.AsyncClient, sample_tenant_id: uuid.UUID, auth_headers: dict):
    contrato_id = uuid.uuid4()
    mock_repo = AsyncMock()
    mock_repo.get_by_id.return_value = None

    app.dependency_overrides[get_contrato_repository] = lambda: mock_repo
    try:
        payload = {"valor_bolsa": "1500.00"}
        response = await async_client.patch(f"/api/v1/contratos/{contrato_id}", json=payload, headers=auth_headers)
        assert response.status_code == 404
        assert "Contrato nao encontrado" in response.json()["detail"]
    finally:
        app.dependency_overrides.pop(get_contrato_repository, None)

@pytest.mark.asyncio
async def test_delete_contrato_success(async_client: httpx.AsyncClient, sample_tenant_id: uuid.UUID, auth_headers: dict):
    contrato_id = uuid.uuid4()
    mock_repo = AsyncMock()
    mock_repo.delete.return_value = True

    app.dependency_overrides[get_contrato_repository] = lambda: mock_repo
    try:
        response = await async_client.delete(f"/api/v1/contratos/{contrato_id}", headers=auth_headers)
        assert response.status_code == 204
    finally:
        app.dependency_overrides.pop(get_contrato_repository, None)

@pytest.mark.asyncio
async def test_delete_contrato_not_found(async_client: httpx.AsyncClient, sample_tenant_id: uuid.UUID, auth_headers: dict):
    contrato_id = uuid.uuid4()
    mock_repo = AsyncMock()
    mock_repo.delete.return_value = False

    app.dependency_overrides[get_contrato_repository] = lambda: mock_repo
    try:
        response = await async_client.delete(f"/api/v1/contratos/{contrato_id}", headers=auth_headers)
        assert response.status_code == 404
    finally:
        app.dependency_overrides.pop(get_contrato_repository, None)
