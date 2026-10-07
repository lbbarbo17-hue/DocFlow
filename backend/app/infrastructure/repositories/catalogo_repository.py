import uuid
from typing import Optional, List
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from app.domain.repositories.catalogo import IInstituicaoRepository, IEmpresaRepository
from app.infrastructure.database.models.catalogo import Instituicao, Empresa

class SQLAlchemyInstituicaoRepository(IInstituicaoRepository):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_by_id(self, entity_id: uuid.UUID, tenant_id: uuid.UUID) -> Optional[Instituicao]:
        query = select(Instituicao).where(
            and_(
                Instituicao.id == entity_id,
                Instituicao.tenant_id == tenant_id,
                Instituicao.ativo.is_(True)
            )
        )
        result = await self._session.execute(query)
        return result.scalar_one_or_none()

    async def get_by_cnpj(self, cnpj: str, tenant_id: uuid.UUID) -> Optional[Instituicao]:
        query = select(Instituicao).where(
            and_(
                Instituicao.cnpj == cnpj,
                Instituicao.tenant_id == tenant_id,
                Instituicao.ativo.is_(True)
            )
        )
        result = await self._session.execute(query)
        return result.scalar_one_or_none()

    async def list_all(self, tenant_id: uuid.UUID, skip: int = 0, limit: int = 100) -> List[Instituicao]:
        query = (
            select(Instituicao)
            .where(
                and_(
                    Instituicao.tenant_id == tenant_id,
                    Instituicao.ativo.is_(True)
                )
            )
            .offset(skip)
            .limit(limit)
            .order_by(Instituicao.razao_social)
        )
        result = await self._session.execute(query)
        return list(result.scalars().all())

    async def create(self, entity: Instituicao) -> Instituicao:
        self._session.add(entity)
        await self._session.commit()
        await self._session.refresh(entity)
        return entity

    async def update(self, entity: Instituicao) -> Instituicao:
        await self._session.commit()
        await self._session.refresh(entity)
        return entity

    async def delete(self, entity_id: uuid.UUID, tenant_id: uuid.UUID) -> bool:
        entity = await self.get_by_id(entity_id=entity_id, tenant_id=tenant_id)
        if not entity:
            return False
        entity.ativo = False
        await self._session.commit()
        return True

class SQLAlchemyEmpresaRepository(IEmpresaRepository):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_by_id(self, entity_id: uuid.UUID, tenant_id: uuid.UUID) -> Optional[Empresa]:
        query = select(Empresa).where(
            and_(
                Empresa.id == entity_id,
                Empresa.tenant_id == tenant_id,
                Empresa.ativo.is_(True)
            )
        )
        result = await self._session.execute(query)
        return result.scalar_one_or_none()

    async def get_by_cnpj(self, cnpj: str, tenant_id: uuid.UUID) -> Optional[Empresa]:
        query = select(Empresa).where(
            and_(
                Empresa.cnpj == cnpj,
                Empresa.tenant_id == tenant_id,
                Empresa.ativo.is_(True)
            )
        )
        result = await self._session.execute(query)
        return result.scalar_one_or_none()

    async def list_all(self, tenant_id: uuid.UUID, skip: int = 0, limit: int = 100) -> List[Empresa]:
        query = (
            select(Empresa)
            .where(
                and_(
                    Empresa.tenant_id == tenant_id,
                    Empresa.ativo.is_(True)
                )
            )
            .offset(skip)
            .limit(limit)
            .order_by(Empresa.razao_social)
        )
        result = await self._session.execute(query)
        return list(result.scalars().all())

    async def create(self, entity: Empresa) -> Empresa:
        self._session.add(entity)
        await self._session.commit()
        await self._session.refresh(entity)
        return entity

    async def update(self, entity: Empresa) -> Empresa:
        await self._session.commit()
        await self._session.refresh(entity)
        return entity

    async def delete(self, entity_id: uuid.UUID, tenant_id: uuid.UUID) -> bool:
        entity = await self.get_by_id(entity_id=entity_id, tenant_id=tenant_id)
        if not entity:
            return False
        entity.ativo = False
        await self._session.commit()
        return True
