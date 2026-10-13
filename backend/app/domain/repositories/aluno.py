import uuid
from abc import abstractmethod
from typing import Optional, List
from app.domain.repositories.base import IRepository
from app.infrastructure.database.models.aluno import Aluno

class IAlunoRepository(IRepository[Aluno]):
    @abstractmethod
    async def get_by_id(self, entity_id: uuid.UUID, tenant_id: uuid.UUID) -> Optional[Aluno]:
        pass

    @abstractmethod
    async def get_by_cpf(self, cpf: str, tenant_id: uuid.UUID) -> Optional[Aluno]:
        pass

    @abstractmethod
    async def get_by_matricula(self, matricula: str, tenant_id: uuid.UUID) -> Optional[Aluno]:
        pass

    @abstractmethod
    async def list_by_turma(self, turma_id: uuid.UUID, tenant_id: uuid.UUID, skip: int = 0, limit: int = 100) -> List[Aluno]:
        pass

    @abstractmethod
    async def list_all(self, tenant_id: uuid.UUID, skip: int = 0, limit: int = 100) -> List[Aluno]:
        pass

    @abstractmethod
    async def create(self, entity: Aluno) -> Aluno:
        pass

    @abstractmethod
    async def update(self, entity: Aluno) -> Aluno:
        pass

    @abstractmethod
    async def delete(self, entity_id: uuid.UUID, tenant_id: uuid.UUID) -> bool:
        pass
