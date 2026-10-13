import uuid
from typing import Optional, List, Dict, Any
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.domain.repositories.turma import ITurmaRepository
from app.domain.enums import StatusDocumento
from app.infrastructure.database.models.turma import Turma
from app.infrastructure.database.models.aluno import Aluno

class SQLAlchemyTurmaRepository(ITurmaRepository):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_by_id(self, entity_id: uuid.UUID, tenant_id: uuid.UUID) -> Optional[Turma]:
        query = select(Turma).where(
            and_(
                Turma.id == entity_id,
                Turma.tenant_id == tenant_id,
                Turma.ativo.is_(True)
            )
        )
        result = await self._session.execute(query)
        return result.scalar_one_or_none()

    async def get_by_codigo(self, codigo: str, tenant_id: uuid.UUID) -> Optional[Turma]:
        query = select(Turma).where(
            and_(
                Turma.codigo == codigo,
                Turma.tenant_id == tenant_id,
                Turma.ativo.is_(True)
            )
        )
        result = await self._session.execute(query)
        return result.scalar_one_or_none()

    async def list_all(
        self,
        tenant_id: uuid.UUID,
        skip: int = 0,
        limit: int = 100
    ) -> List[Turma]:
        query = (
            select(Turma)
            .where(
                and_(
                    Turma.tenant_id == tenant_id,
                    Turma.ativo.is_(True)
                )
            )
            .order_by(Turma.nome)
            .offset(skip)
            .limit(limit)
        )
        result = await self._session.execute(query)
        return list(result.scalars().all())

    async def create(self, entity: Turma) -> Turma:
        self._session.add(entity)
        await self._session.flush()
        await self._session.refresh(entity)
        return entity

    async def update(self, entity: Turma) -> Turma:
        merged = await self._session.merge(entity)
        await self._session.flush()
        return merged

    async def delete(self, entity_id: uuid.UUID, tenant_id: uuid.UUID) -> bool:
        turma = await self.get_by_id(entity_id=entity_id, tenant_id=tenant_id)
        if not turma:
            return False
        turma.ativo = False
        await self._session.flush()
        return True

    async def get_metricas_conformidade(
        self,
        turma_id: uuid.UUID,
        tenant_id: uuid.UUID
    ) -> Optional[Dict[str, Any]]:
        turma = await self.get_by_id(entity_id=turma_id, tenant_id=tenant_id)
        if not turma:
            return None

        query_alunos = (
            select(Aluno)
            .options(selectinload(Aluno.documentos))
            .where(
                and_(
                    Aluno.turma_id == turma_id,
                    Aluno.tenant_id == tenant_id,
                    Aluno.ativo.is_(True)
                )
            )
        )
        result = await self._session.execute(query_alunos)
        alunos = list(result.scalars().all())

        total_alunos = len(alunos)
        alunos_regulares = 0
        alunos_em_risco = 0

        for aluno in alunos:
            docs = aluno.documentos
            tem_recusado = any(d.status == StatusDocumento.RECUSADO for d in docs)
            tem_expirado = any(d.status == StatusDocumento.EXPIRADO for d in docs)
            tem_aprovado = any(d.status == StatusDocumento.APROVADO for d in docs)

            if tem_recusado or tem_expirado or not tem_aprovado:
                alunos_em_risco += 1
            else:
                alunos_regulares += 1

        percentual = round((alunos_regulares / total_alunos * 100), 2) if total_alunos > 0 else 100.0

        return {
            "turma_id": turma.id,
            "codigo": turma.codigo,
            "nome": turma.nome,
            "total_alunos": total_alunos,
            "alunos_regulares": alunos_regulares,
            "alunos_em_risco": alunos_em_risco,
            "percentual_conformidade": percentual
        }
