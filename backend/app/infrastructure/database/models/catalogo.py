import uuid
from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import String, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.infrastructure.database.models.base import Base, UUIDPrimaryKeyMixin, TimestampMixin, TenantScopedMixin

if TYPE_CHECKING:
    from app.infrastructure.database.models.tenant import Tenant
    from app.infrastructure.database.models.turma import Turma
    from app.infrastructure.database.models.aluno import Aluno
    from app.infrastructure.database.models.contrato import Contrato

class Instituicao(Base, UUIDPrimaryKeyMixin, TimestampMixin, TenantScopedMixin):
    __tablename__ = "instituicoes"

    tenant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("tenants.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    razao_social: Mapped[str] = mapped_column(String(255), nullable=False)
    nome_fantasia: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    cnpj: Mapped[str] = mapped_column(String(18), nullable=False, index=True)
    codigo_mec: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    ativo: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    tenant: Mapped["Tenant"] = relationship(back_populates="instituicoes")
    turmas: Mapped[List["Turma"]] = relationship(back_populates="instituicao")
    alunos: Mapped[List["Aluno"]] = relationship(back_populates="instituicao")
    contratos: Mapped[List["Contrato"]] = relationship(back_populates="instituicao")

class Empresa(Base, UUIDPrimaryKeyMixin, TimestampMixin, TenantScopedMixin):
    __tablename__ = "empresas"

    tenant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("tenants.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    razao_social: Mapped[str] = mapped_column(String(255), nullable=False)
    nome_fantasia: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    cnpj: Mapped[str] = mapped_column(String(18), nullable=False, index=True)
    ramo_atividade: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    ativo: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    tenant: Mapped["Tenant"] = relationship(back_populates="empresas")
    alunos: Mapped[List["Aluno"]] = relationship(back_populates="empresa")
    contratos: Mapped[List["Contrato"]] = relationship(back_populates="empresa")
