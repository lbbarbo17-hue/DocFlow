import uuid
from typing import Optional, List
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from app.domain.repositories.aluno import IAlunoRepository
from app.infrastructure.database.models.aluno import Aluno

class SQLAlchemyAlunoRepository(IAlunoRepository):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_by_id(self, entity_id: uuid.UUID, tenant_id: uuid.UUID) -> Optional[Aluno]:
        query = select(Aluno).where(
            and_(
                Aluno.id == entity_id,
                Aluno.tenant_id == tenant_id,
                Aluno.ativo.is_(True)
            )
        )
        result = await self._session.execute(query)
        return result.scalar_one_or_none()

    async def get_by_cpf(self, cpf: str, tenant_id: uuid.UUID) -> Optional[Aluno]:
        query = select(Aluno).where(
            and_(
                Aluno.cpf == cpf,
                Aluno.tenant_id == tenant_id,
                Aluno.ativo.is_(True)
            )
        )
        result = await self._session.execute(query)
        return result.scalar_one_or_none()

    async def get_by_matricula(self, matricula: str, tenant_id: uuid.UUID) -> Optional[Aluno]:
        query = select(Aluno).where(
            and_(
                Aluno.matricula == matricula,
                Aluno.tenant_id == tenant_id,
                Aluno.ativo.is_(True)
            )
        )
        result = await self._session.execute(query)
        return result.scalar_one_or_none()

    async def list_by_turma(
        self,
        turma_id: uuid.UUID,
        tenant_id: uuid.UUID,
        skip: int = 0,
        limit: int = 100
    ) -> List[Aluno]:
        query = (
            select(Aluno)
            .where(
                and_(
                    Aluno.turma_id == turma_id,
                    Aluno.tenant_id == tenant_id,
                    Aluno.ativo.is_(True)
                )
            )
            .offset(skip)
            .limit(limit)
        )
        result = await self._session.execute(query)
        return list(result.scalars().all())

    async def list_all(
        self,
        tenant_id: uuid.UUID,
        skip: int = 0,
        limit: int = 100
    ) -> List[Aluno]:
        query = (
            select(Aluno)
            .where(
                and_(
                    Aluno.tenant_id == tenant_id,
                    Aluno.ativo.is_(True)
                )
            )
            .offset(skip)
            .limit(limit)
        )
        result = await self._session.execute(query)
        return list(result.scalars().all())

    async def create(self, entity: Aluno) -> Aluno:
        self._session.add(entity)
        await self._session.flush()
        await self._session.refresh(entity)
        return entity

    async def update(self, entity: Aluno) -> Aluno:
        merged = await self._session.merge(entity)
        await self._session.flush()
        return merged

    async def delete(self, entity_id: uuid.UUID, tenant_id: uuid.UUID) -> bool:
        aluno = await self.get_by_id(entity_id=entity_id, tenant_id=tenant_id)
        if not aluno:
            return False
        aluno.ativo = False
        await self._session.flush()
        return True
