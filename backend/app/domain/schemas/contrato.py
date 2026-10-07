import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field

class ContratoBase(BaseModel):
    aluno_id: uuid.UUID
    empresa_id: Optional[uuid.UUID] = None
    instituicao_id: Optional[uuid.UUID] = None
    numero_contrato: str = Field(min_length=1, max_length=100)
    data_inicio: date
    data_fim: date
    valor_bolsa: Optional[Decimal] = Field(default=None, ge=0)

class ContratoCreate(ContratoBase):
    pass

class ContratoUpdate(BaseModel):
    empresa_id: Optional[uuid.UUID] = None
    instituicao_id: Optional[uuid.UUID] = None
    numero_contrato: Optional[str] = Field(default=None, min_length=1, max_length=100)
    data_inicio: Optional[date] = None
    data_fim: Optional[date] = None
    valor_bolsa: Optional[Decimal] = Field(default=None, ge=0)
    ativo: Optional[bool] = None

class ContratoRead(ContratoBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    tenant_id: uuid.UUID
    ativo: bool
    created_at: datetime
    updated_at: datetime
