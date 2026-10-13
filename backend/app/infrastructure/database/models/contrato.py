import uuid
from datetime import date
from typing import Optional, TYPE_CHECKING
from decimal import Decimal
from sqlalchemy import String, Boolean, Date, Numeric, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.infrastructure.database.models.base import Base, UUIDPrimaryKeyMixin, TimestampMixin, TenantScopedMixin

if TYPE_CHECKING:
    from app.infrastructure.database.models.tenant import Tenant
    from app.infrastructure.database.models.aluno import Aluno
    from app.infrastructure.database.models.catalogo import Empresa, Instituicao

class Contrato(Base, UUIDPrimaryKeyMixin, TimestampMixin, TenantScopedMixin):
    __tablename__ = "contratos"

    tenant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("tenants.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    aluno_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("alunos.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    empresa_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("empresas.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )
    instituicao_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("instituicoes.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )
    numero_contrato: Mapped[str] = mapped_column(String(100), nullable=False)
    data_inicio: Mapped[date] = mapped_column(Date, nullable=False)
    data_fim: Mapped[date] = mapped_column(Date, nullable=False)
    valor_bolsa: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 2), nullable=True)
    ativo: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    tenant: Mapped["Tenant"] = relationship(back_populates="contratos")
    aluno: Mapped["Aluno"] = relationship(back_populates="contratos")
    empresa: Mapped[Optional["Empresa"]] = relationship(back_populates="contratos")
    instituicao: Mapped[Optional["Instituicao"]] = relationship(back_populates="contratos")
