import uuid
from abc import abstractmethod
from typing import Optional, List
from app.domain.repositories.base import IRepository
from app.infrastructure.database.models.usuario import Usuario

class IUsuarioRepository(IRepository[Usuario]):
    @abstractmethod
    async def get_by_id(self, entity_id: uuid.UUID, tenant_id: Optional[uuid.UUID] = None) -> Optional[Usuario]:
        pass

    @abstractmethod
    async def get_by_email(self, email: str) -> Optional[Usuario]:
        pass

    @abstractmethod
    async def get_by_supabase_id(self, supabase_user_id: uuid.UUID) -> Optional[Usuario]:
        pass

    @abstractmethod
    async def list_all(self, tenant_id: uuid.UUID, skip: int = 0, limit: int = 100) -> List[Usuario]:
        pass

    @abstractmethod
    async def create(self, entity: Usuario) -> Usuario:
        pass

    @abstractmethod
    async def update(self, entity: Usuario) -> Usuario:
        pass

    @abstractmethod
    async def delete(self, entity_id: uuid.UUID, tenant_id: uuid.UUID) -> bool:
        pass
