import uuid
from abc import abstractmethod
from typing import Optional
from app.domain.repositories.base import IRepository
from app.infrastructure.database.models.catalogo import Instituicao, Empresa

class IInstituicaoRepository(IRepository[Instituicao]):
    @abstractmethod
    async def get_by_cnpj(self, cnpj: str, tenant_id: uuid.UUID) -> Optional[Instituicao]:
        pass

class IEmpresaRepository(IRepository[Empresa]):
    @abstractmethod
    async def get_by_cnpj(self, cnpj: str, tenant_id: uuid.UUID) -> Optional[Empresa]:
        pass
