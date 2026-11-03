import pytest
from unittest.mock import AsyncMock, patch
import httpx

@pytest.mark.asyncio
async def test_health_check_healthy(async_client: httpx.AsyncClient):
    with patch("app.infrastructure.api.routes.health.check_database_connection", new_callable=AsyncMock) as mock_db:
        mock_db.return_value = True
        response = await async_client.get("/api/v1/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["database"] == "connected"

@pytest.mark.asyncio
async def test_health_check_unhealthy(async_client: httpx.AsyncClient):
    with patch("app.infrastructure.api.routes.health.check_database_connection", new_callable=AsyncMock) as mock_db:
        mock_db.return_value = False
        response = await async_client.get("/api/v1/health")
        assert response.status_code == 503
        data = response.json()
        assert data["detail"]["status"] == "unhealthy"

@pytest.mark.asyncio
async def test_root_redirect_to_docs(async_client: httpx.AsyncClient):
    response = await async_client.get("/", follow_redirects=False)
    assert response.status_code in [302, 307]
    assert response.headers["location"] == "/docs"
