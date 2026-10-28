import uuid
from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import String, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.infrastructure.database.models.base import Base, UUIDPrimaryKeyMixin, TimestampMixin, TenantScopedMixin

if TYPE_CHECKING:
    from app.infrastructure.database.models.tenant import Tenant
    from app.infrastructure.database.models.catalogo import Instituicao
    from app.infrastructure.database.models.aluno import Aluno

class Turma(Base, UUIDPrimaryKeyMixin, TimestampMixin, TenantScopedMixin):
    __tablename__ = "turmas"

    tenant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("tenants.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    instituicao_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("instituicoes.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )
    codigo: Mapped[str] = mapped_column(String(50), nullable=False)
    nome: Mapped[str] = mapped_column(String(255), nullable=False)
    semestre_referencia: Mapped[str] = mapped_column(String(20), nullable=False)
    ativo: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    tenant: Mapped["Tenant"] = relationship(back_populates="turmas")
    instituicao: Mapped[Optional["Instituicao"]] = relationship(back_populates="turmas")
    alunos: Mapped[List["Aluno"]] = relationship(back_populates="turma")
