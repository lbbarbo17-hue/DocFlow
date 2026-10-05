import uuid
from abc import ABC, abstractmethod
from typing import Generic, TypeVar, Optional, List

T = TypeVar("T")

class IRepository(ABC, Generic[T]):
    @abstractmethod
    async def get_by_id(self, entity_id: uuid.UUID, tenant_id: uuid.UUID) -> Optional[T]:
        pass

    @abstractmethod
    async def list_all(self, tenant_id: uuid.UUID, skip: int = 0, limit: int = 100) -> List[T]:
        pass

    @abstractmethod
    async def create(self, entity: T) -> T:
        pass

    @abstractmethod
    async def update(self, entity: T) -> T:
        pass

    @abstractmethod
    async def delete(self, entity_id: uuid.UUID, tenant_id: uuid.UUID) -> bool:
        pass
