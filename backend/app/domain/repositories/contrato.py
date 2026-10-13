import uuid
from abc import abstractmethod
from typing import List, Optional
from app.domain.repositories.base import IRepository
from app.infrastructure.database.models.contrato import Contrato

class IContratoRepository(IRepository[Contrato]):
    @abstractmethod
    async def list_by_aluno(self, aluno_id: uuid.UUID, tenant_id: uuid.UUID) -> List[Contrato]:
        pass

    @abstractmethod
    async def get_by_numero(self, numero_contrato: str, tenant_id: uuid.UUID) -> Optional[Contrato]:
        pass
