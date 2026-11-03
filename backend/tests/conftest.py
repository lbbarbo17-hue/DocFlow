import uuid
from typing import AsyncGenerator
import pytest
import pytest_asyncio
import httpx
from app.main import app
from app.infrastructure.api.dependencies import get_current_tenant_id

@pytest.fixture
def sample_tenant_id() -> uuid.UUID:
    return uuid.UUID("11111111-1111-1111-1111-111111111111")

@pytest.fixture
def auth_headers(sample_tenant_id: uuid.UUID) -> dict:
    return {
        "X-Tenant-ID": str(sample_tenant_id),
        "Content-Type": "application/json"
    }

@pytest_asyncio.fixture
async def async_client() -> AsyncGenerator[httpx.AsyncClient, None]:
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as client:
        yield client
