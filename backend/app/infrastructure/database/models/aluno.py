import uuid
from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import String, Boolean, ForeignKey, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.domain.enums import StatusAluno
from app.infrastructure.database.models.base import Base, UUIDPrimaryKeyMixin, TimestampMixin, TenantScopedMixin

if TYPE_CHECKING:
    from app.infrastructure.database.models.tenant import Tenant
    from app.infrastructure.database.models.catalogo import Instituicao, Empresa
    from app.infrastructure.database.models.turma import Turma
    from app.infrastructure.database.models.documento import Documento
    from app.infrastructure.database.models.contrato import Contrato

class Aluno(Base, UUIDPrimaryKeyMixin, TimestampMixin, TenantScopedMixin):
    __tablename__ = "alunos"

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
    empresa_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("empresas.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )
    turma_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("turmas.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )
    nome: Mapped[str] = mapped_column(String(255), nullable=False)
    cpf: Mapped[str] = mapped_column(String(14), nullable=False, index=True)
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    matricula: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    status: Mapped[StatusAluno] = mapped_column(
        SQLEnum(StatusAluno, name="status_aluno_enum", native_enum=True),
        default=StatusAluno.ATIVO,
        nullable=False
    )
    ativo: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    tenant: Mapped["Tenant"] = relationship(back_populates="alunos")
    instituicao: Mapped[Optional["Instituicao"]] = relationship(back_populates="alunos")
    empresa: Mapped[Optional["Empresa"]] = relationship(back_populates="alunos")
    turma: Mapped[Optional["Turma"]] = relationship(back_populates="alunos")
    documentos: Mapped[List["Documento"]] = relationship(back_populates="aluno", cascade="all, delete-orphan")
    contratos: Mapped[List["Contrato"]] = relationship(back_populates="aluno", cascade="all, delete-orphan")
