from typing import List, TYPE_CHECKING
from sqlalchemy import String, Boolean, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.domain.enums import TipoTenant
from app.infrastructure.database.models.base import Base, UUIDPrimaryKeyMixin, TimestampMixin

if TYPE_CHECKING:
    from app.infrastructure.database.models.usuario import Usuario
    from app.infrastructure.database.models.catalogo import Instituicao, Empresa
    from app.infrastructure.database.models.turma import Turma
    from app.infrastructure.database.models.aluno import Aluno
    from app.infrastructure.database.models.contrato import Contrato
    from app.infrastructure.database.models.documento import Documento
    from app.infrastructure.database.models.audit_log import AuditLog

class Tenant(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "tenants"

    nome: Mapped[str] = mapped_column(String(255), nullable=False)
    cnpj: Mapped[str] = mapped_column(String(18), unique=True, nullable=False, index=True)
    tipo: Mapped[TipoTenant] = mapped_column(
        SQLEnum(TipoTenant, name="tipo_tenant_enum", native_enum=True),
        nullable=False
    )
    ativo: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    usuarios: Mapped[List["Usuario"]] = relationship(back_populates="tenant", cascade="all, delete-orphan")
    instituicoes: Mapped[List["Instituicao"]] = relationship(back_populates="tenant", cascade="all, delete-orphan")
    empresas: Mapped[List["Empresa"]] = relationship(back_populates="tenant", cascade="all, delete-orphan")
    turmas: Mapped[List["Turma"]] = relationship(back_populates="tenant", cascade="all, delete-orphan")
    alunos: Mapped[List["Aluno"]] = relationship(back_populates="tenant", cascade="all, delete-orphan")
    contratos: Mapped[List["Contrato"]] = relationship(back_populates="tenant", cascade="all, delete-orphan")
    documentos: Mapped[List["Documento"]] = relationship(back_populates="tenant", cascade="all, delete-orphan")
    audit_logs: Mapped[List["AuditLog"]] = relationship(back_populates="tenant", cascade="all, delete-orphan")
