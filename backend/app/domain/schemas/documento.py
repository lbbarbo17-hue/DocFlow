import uuid
from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field
from app.domain.enums import TipoDocumento, StatusDocumento

class DocumentoBase(BaseModel):
    tipo: TipoDocumento
    storage_path: str = Field(min_length=1, max_length=500)
    file_hash: str = Field(min_length=64, max_length=64)
    mime_type: str = Field(min_length=3, max_length=100)
    tamanho_bytes: int = Field(gt=0)
    data_validade: Optional[date] = None

class DocumentoCreate(DocumentoBase):
    aluno_id: uuid.UUID

class DocumentoUpdate(BaseModel):
    status: Optional[StatusDocumento] = None
    justificativa_recusa: Optional[str] = None
    validado_por_user_id: Optional[uuid.UUID] = None
    data_validade: Optional[date] = None

class DocumentoRead(DocumentoBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    tenant_id: uuid.UUID
    aluno_id: uuid.UUID
    status: StatusDocumento
    justificativa_recusa: Optional[str] = None
    validado_por_user_id: Optional[uuid.UUID] = None
    created_at: datetime
    updated_at: datetime
