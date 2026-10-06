import uuid
from abc import abstractmethod
from typing import Optional, List, Dict, Any
from app.domain.repositories.base import IRepository
from app.infrastructure.database.models.turma import Turma

class ITurmaRepository(IRepository[Turma]):
    @abstractmethod
    async def get_by_id(self, entity_id: uuid.UUID, tenant_id: uuid.UUID) -> Optional[Turma]:
        pass

    @abstractmethod
    async def get_by_codigo(self, codigo: str, tenant_id: uuid.UUID) -> Optional[Turma]:
        pass

    @abstractmethod
    async def list_all(self, tenant_id: uuid.UUID, skip: int = 0, limit: int = 100) -> List[Turma]:
        pass

    @abstractmethod
    async def create(self, entity: Turma) -> Turma:
        pass

    @abstractmethod
    async def update(self, entity: Turma) -> Turma:
        pass

    @abstractmethod
    async def delete(self, entity_id: uuid.UUID, tenant_id: uuid.UUID) -> bool:
        pass

    @abstractmethod
    async def get_metricas_conformidade(self, turma_id: uuid.UUID, tenant_id: uuid.UUID) -> Optional[Dict[str, Any]]:
        pass
