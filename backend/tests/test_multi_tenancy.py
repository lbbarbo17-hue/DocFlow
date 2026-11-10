import pytest
import httpx

@pytest.mark.asyncio
async def test_endpoint_missing_tenant_header(async_client: httpx.AsyncClient):
    response = await async_client.get("/api/v1/alunos")
    assert response.status_code == 400
    data = response.json()
    assert "X-Tenant-ID" in data.get("detail", "")

@pytest.mark.asyncio
async def test_endpoint_invalid_tenant_uuid(async_client: httpx.AsyncClient):
    headers = {"X-Tenant-ID": "invalid-uuid-format"}
    response = await async_client.get("/api/v1/alunos", headers=headers)
    assert response.status_code == 400
    data = response.json()
    assert "UUID valido" in data.get("detail", "")
