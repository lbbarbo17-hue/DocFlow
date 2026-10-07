import uuid
from typing import Optional, List
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from app.domain.repositories.contrato import IContratoRepository
from app.infrastructure.database.models.contrato import Contrato

class SQLAlchemyContratoRepository(IContratoRepository):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_by_id(self, entity_id: uuid.UUID, tenant_id: uuid.UUID) -> Optional[Contrato]:
        query = select(Contrato).where(
            and_(
                Contrato.id == entity_id,
                Contrato.tenant_id == tenant_id,
                Contrato.ativo.is_(True)
            )
        )
        result = await self._session.execute(query)
        return result.scalar_one_or_none()

    async def get_by_numero(self, numero_contrato: str, tenant_id: uuid.UUID) -> Optional[Contrato]:
        query = select(Contrato).where(
            and_(
                Contrato.numero_contrato == numero_contrato,
                Contrato.tenant_id == tenant_id,
                Contrato.ativo.is_(True)
            )
        )
        result = await self._session.execute(query)
        return result.scalar_one_or_none()

    async def list_by_aluno(self, aluno_id: uuid.UUID, tenant_id: uuid.UUID) -> List[Contrato]:
        query = (
            select(Contrato)
            .where(
                and_(
                    Contrato.aluno_id == aluno_id,
                    Contrato.tenant_id == tenant_id,
                    Contrato.ativo.is_(True)
                )
            )
            .order_by(Contrato.data_inicio.desc())
        )
        result = await self._session.execute(query)
        return list(result.scalars().all())

    async def list_all(self, tenant_id: uuid.UUID, skip: int = 0, limit: int = 100) -> List[Contrato]:
        query = (
            select(Contrato)
            .where(
                and_(
                    Contrato.tenant_id == tenant_id,
                    Contrato.ativo.is_(True)
                )
            )
            .offset(skip)
            .limit(limit)
            .order_by(Contrato.created_at.desc())
        )
        result = await self._session.execute(query)
        return list(result.scalars().all())

    async def create(self, entity: Contrato) -> Contrato:
        self._session.add(entity)
        await self._session.commit()
        await self._session.refresh(entity)
        return entity

    async def update(self, entity: Contrato) -> Contrato:
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
