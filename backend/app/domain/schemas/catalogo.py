import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field

class InstituicaoBase(BaseModel):
    razao_social: str = Field(min_length=2, max_length=255)
    nome_fantasia: Optional[str] = Field(default=None, max_length=255)
    cnpj: str = Field(min_length=14, max_length=18)
    codigo_mec: Optional[str] = Field(default=None, max_length=50)

class InstituicaoCreate(InstituicaoBase):
    pass

class InstituicaoUpdate(BaseModel):
    razao_social: Optional[str] = Field(default=None, min_length=2, max_length=255)
    nome_fantasia: Optional[str] = Field(default=None, max_length=255)
    cnpj: Optional[str] = Field(default=None, min_length=14, max_length=18)
    codigo_mec: Optional[str] = Field(default=None, max_length=50)
    ativo: Optional[bool] = None

class InstituicaoRead(InstituicaoBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    tenant_id: uuid.UUID
    ativo: bool
    created_at: datetime
    updated_at: datetime

class EmpresaBase(BaseModel):
    razao_social: str = Field(min_length=2, max_length=255)
    nome_fantasia: Optional[str] = Field(default=None, max_length=255)
    cnpj: str = Field(min_length=14, max_length=18)
    ramo_atividade: Optional[str] = Field(default=None, max_length=100)

class EmpresaCreate(EmpresaBase):
    pass

class EmpresaUpdate(BaseModel):
    razao_social: Optional[str] = Field(default=None, min_length=2, max_length=255)
    nome_fantasia: Optional[str] = Field(default=None, max_length=255)
    cnpj: Optional[str] = Field(default=None, min_length=14, max_length=18)
    ramo_atividade: Optional[str] = Field(default=None, max_length=100)
    ativo: Optional[bool] = None

class EmpresaRead(EmpresaBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    tenant_id: uuid.UUID
    ativo: bool
    created_at: datetime
    updated_at: datetime
