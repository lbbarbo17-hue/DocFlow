import uuid
from abc import abstractmethod
from typing import Optional, List
from app.domain.repositories.base import IRepository
from app.infrastructure.database.models.documento import Documento

class IDocumentoRepository(IRepository[Documento]):
    @abstractmethod
    async def get_by_id(self, entity_id: uuid.UUID, tenant_id: uuid.UUID) -> Optional[Documento]:
        pass

    @abstractmethod
    async def get_by_hash(self, file_hash: str, tenant_id: uuid.UUID) -> Optional[Documento]:
        pass

    @abstractmethod
    async def list_by_aluno(self, aluno_id: uuid.UUID, tenant_id: uuid.UUID) -> List[Documento]:
        pass

    @abstractmethod
    async def list_all(self, tenant_id: uuid.UUID, skip: int = 0, limit: int = 100) -> List[Documento]:
        pass

    @abstractmethod
    async def create(self, entity: Documento) -> Documento:
        pass

    @abstractmethod
    async def update(self, entity: Documento) -> Documento:
        pass

    @abstractmethod
    async def delete(self, entity_id: uuid.UUID, tenant_id: uuid.UUID) -> bool:
        pass
