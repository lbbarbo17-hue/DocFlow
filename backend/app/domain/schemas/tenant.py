import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field
from app.domain.enums import TipoTenant

class TenantBase(BaseModel):
    nome: str = Field(min_length=2, max_length=255)
    cnpj: str = Field(min_length=14, max_length=18)
    tipo: TipoTenant

class TenantCreate(TenantBase):
    logo_path: Optional[str] = None

class TenantUpdate(BaseModel):
    nome: Optional[str] = Field(default=None, min_length=2, max_length=255)
    cnpj: Optional[str] = Field(default=None, min_length=14, max_length=18)
    tipo: Optional[TipoTenant] = None
    logo_path: Optional[str] = None
    ativo: Optional[bool] = None

class TenantRead(TenantBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    logo_path: Optional[str] = None
    ativo: bool
    created_at: datetime
    updated_at: datetime
