import uuid
from datetime import date
from typing import Optional, TYPE_CHECKING
from sqlalchemy import String, BigInteger, Date, Text, ForeignKey, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.domain.enums import TipoDocumento, StatusDocumento
from app.infrastructure.database.models.base import Base, UUIDPrimaryKeyMixin, TimestampMixin, TenantScopedMixin

if TYPE_CHECKING:
    from app.infrastructure.database.models.tenant import Tenant
    from app.infrastructure.database.models.aluno import Aluno

class Documento(Base, UUIDPrimaryKeyMixin, TimestampMixin, TenantScopedMixin):
    __tablename__ = "documentos"

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
    tipo: Mapped[TipoDocumento] = mapped_column(
        SQLEnum(TipoDocumento, name="tipo_documento_enum", native_enum=True),
        nullable=False
    )
    storage_path: Mapped[str] = mapped_column(String(500), nullable=False)
    file_hash: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    mime_type: Mapped[str] = mapped_column(String(100), nullable=False)
    tamanho_bytes: Mapped[int] = mapped_column(BigInteger, nullable=False)
    status: Mapped[StatusDocumento] = mapped_column(
        SQLEnum(StatusDocumento, name="status_documento_enum", native_enum=True),
        default=StatusDocumento.PENDENTE,
        nullable=False
    )
    data_validade: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    justificativa_recusa: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    validado_por_user_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), nullable=True)

    tenant: Mapped["Tenant"] = relationship(back_populates="documentos")
    aluno: Mapped["Aluno"] = relationship(back_populates="documentos")
