import uuid
from typing import Optional, List
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from app.domain.repositories.documento import IDocumentoRepository
from app.infrastructure.database.models.documento import Documento

class SQLAlchemyDocumentoRepository(IDocumentoRepository):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_by_id(self, entity_id: uuid.UUID, tenant_id: uuid.UUID) -> Optional[Documento]:
        query = select(Documento).where(
            and_(
                Documento.id == entity_id,
                Documento.tenant_id == tenant_id
            )
        )
        result = await self._session.execute(query)
        return result.scalar_one_or_none()

    async def get_by_hash(self, file_hash: str, tenant_id: uuid.UUID) -> Optional[Documento]:
        query = select(Documento).where(
            and_(
                Documento.file_hash == file_hash,
                Documento.tenant_id == tenant_id
            )
        )
        result = await self._session.execute(query)
        return result.scalar_one_or_none()

    async def list_by_aluno(self, aluno_id: uuid.UUID, tenant_id: uuid.UUID) -> List[Documento]:
        query = select(Documento).where(
            and_(
                Documento.aluno_id == aluno_id,
                Documento.tenant_id == tenant_id
            )
        ).order_by(Documento.created_at.desc())
        result = await self._session.execute(query)
        return list(result.scalars().all())

    async def list_all(
        self,
        tenant_id: uuid.UUID,
        skip: int = 0,
        limit: int = 100
    ) -> List[Documento]:
        query = (
            select(Documento)
            .where(Documento.tenant_id == tenant_id)
            .order_by(Documento.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        result = await self._session.execute(query)
        return list(result.scalars().all())

    async def create(self, entity: Documento) -> Documento:
        self._session.add(entity)
        await self._session.flush()
        await self._session.refresh(entity)
        return entity

    async def update(self, entity: Documento) -> Documento:
        merged = await self._session.merge(entity)
        await self._session.flush()
        return merged

    async def delete(self, entity_id: uuid.UUID, tenant_id: uuid.UUID) -> bool:
        documento = await self.get_by_id(entity_id=entity_id, tenant_id=tenant_id)
        if not documento:
            return False
        await self._session.delete(documento)
        await self._session.flush()
        return True
