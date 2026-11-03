import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator
from app.application.services.document_validators import validate_and_sanitize_cnpj

class InstituicaoBase(BaseModel):
    razao_social: str = Field(min_length=2, max_length=255)
    nome_fantasia: Optional[str] = Field(default=None, max_length=255)
    cnpj: str = Field(min_length=14, max_length=18)
    codigo_mec: Optional[str] = Field(default=None, max_length=50)

    @field_validator("cnpj", mode="before")
    @classmethod
    def check_cnpj(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            return validate_and_sanitize_cnpj(v)
        return v

class InstituicaoCreate(InstituicaoBase):
    pass

class InstituicaoUpdate(BaseModel):
    razao_social: Optional[str] = Field(default=None, min_length=2, max_length=255)
    nome_fantasia: Optional[str] = Field(default=None, max_length=255)
    cnpj: Optional[str] = Field(default=None, min_length=14, max_length=18)
    codigo_mec: Optional[str] = Field(default=None, max_length=50)
    ativo: Optional[bool] = None

    @field_validator("cnpj", mode="before")
    @classmethod
    def check_cnpj(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            return validate_and_sanitize_cnpj(v)
        return v

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

    @field_validator("cnpj", mode="before")
    @classmethod
    def check_cnpj(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            return validate_and_sanitize_cnpj(v)
        return v

class EmpresaCreate(EmpresaBase):
    pass

class EmpresaUpdate(BaseModel):
    razao_social: Optional[str] = Field(default=None, min_length=2, max_length=255)
    nome_fantasia: Optional[str] = Field(default=None, max_length=255)
    cnpj: Optional[str] = Field(default=None, min_length=14, max_length=18)
    ramo_atividade: Optional[str] = Field(default=None, max_length=100)
    ativo: Optional[bool] = None

    @field_validator("cnpj", mode="before")
    @classmethod
    def check_cnpj(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            return validate_and_sanitize_cnpj(v)
        return v

class EmpresaRead(EmpresaBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    tenant_id: uuid.UUID
    ativo: bool
    created_at: datetime
    updated_at: datetime
