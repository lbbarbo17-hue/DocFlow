import uuid
from typing import Optional, List
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from app.domain.repositories.usuario import IUsuarioRepository
from app.infrastructure.database.models.usuario import Usuario

class SQLAlchemyUsuarioRepository(IUsuarioRepository):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_by_id(self, entity_id: uuid.UUID, tenant_id: Optional[uuid.UUID] = None) -> Optional[Usuario]:
        conditions = [Usuario.id == entity_id, Usuario.ativo.is_(True)]
        if tenant_id:
            conditions.append(Usuario.tenant_id == tenant_id)
        query = select(Usuario).where(and_(*conditions))
        result = await self._session.execute(query)
        return result.scalar_one_or_none()

    async def get_by_email(self, email: str) -> Optional[Usuario]:
        query = select(Usuario).where(
            and_(
                Usuario.email == email,
                Usuario.ativo.is_(True)
            )
        )
        result = await self._session.execute(query)
        return result.scalar_one_or_none()

    async def get_by_supabase_id(self, supabase_user_id: uuid.UUID) -> Optional[Usuario]:
        query = select(Usuario).where(
            and_(
                Usuario.supabase_user_id == supabase_user_id,
                Usuario.ativo.is_(True)
            )
        )
        result = await self._session.execute(query)
        return result.scalar_one_or_none()

    async def list_all(
        self,
        tenant_id: uuid.UUID,
        skip: int = 0,
        limit: int = 100
    ) -> List[Usuario]:
        query = (
            select(Usuario)
            .where(
                and_(
                    Usuario.tenant_id == tenant_id,
                    Usuario.ativo.is_(True)
                )
            )
            .order_by(Usuario.nome)
            .offset(skip)
            .limit(limit)
        )
        result = await self._session.execute(query)
        return list(result.scalars().all())

    async def create(self, entity: Usuario) -> Usuario:
        self._session.add(entity)
        await self._session.flush()
        await self._session.refresh(entity)
        return entity

    async def update(self, entity: Usuario) -> Usuario:
        merged = await self._session.merge(entity)
        await self._session.flush()
        return merged

    async def delete(self, entity_id: uuid.UUID, tenant_id: uuid.UUID) -> bool:
        user = await self.get_by_id(entity_id=entity_id, tenant_id=tenant_id)
        if not user:
            return False
        user.ativo = False
        await self._session.flush()
        return True
