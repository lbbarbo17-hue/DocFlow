import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator
from app.domain.enums import StatusAluno, TipoVinculo
from app.application.services.document_validators import validate_and_sanitize_cpf


class DadosAprendizSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    numero_ctps: Optional[str] = Field(default=None, max_length=50)
    serie_ctps: Optional[str] = Field(default=None, max_length=20)
    cbo: Optional[str] = Field(default=None, max_length=20)
    curso_aprendizagem: Optional[str] = Field(default=None, max_length=255)
    numero_contrato_aprendizagem: Optional[str] = Field(default=None, max_length=100)


class DadosEstagiarioSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    numero_tce: Optional[str] = Field(default=None, max_length=100)
    apolice_seguro: Optional[str] = Field(default=None, max_length=100)
    seguradora: Optional[str] = Field(default=None, max_length=255)
    supervisor_empresa: Optional[str] = Field(default=None, max_length=255)
    curso_superior_tecnico: Optional[str] = Field(default=None, max_length=255)
    semestre_atual: Optional[str] = Field(default=None, max_length=50)


class AlunoBase(BaseModel):
    nome: str = Field(min_length=2, max_length=255)
    cpf: str = Field(min_length=11, max_length=14)
    email: EmailStr
    matricula: str = Field(min_length=1, max_length=50)
    tipo_vinculo: TipoVinculo = TipoVinculo.APRENDIZ
    status: StatusAluno = StatusAluno.ATIVO

    @field_validator("cpf", mode="before")
    @classmethod
    def check_cpf(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            return validate_and_sanitize_cpf(v)
        return v

    @field_validator("tipo_vinculo", mode="before")
    @classmethod
    def default_tipo_vinculo(cls, v: Optional[TipoVinculo]) -> TipoVinculo:
        return v or TipoVinculo.APRENDIZ


class AlunoCreate(AlunoBase):
    instituicao_id: Optional[uuid.UUID] = None
    empresa_id: Optional[uuid.UUID] = None
    turma_id: Optional[uuid.UUID] = None
    dados_aprendiz: Optional[DadosAprendizSchema] = None
    dados_estagiario: Optional[DadosEstagiarioSchema] = None


class AlunoUpdate(BaseModel):
    nome: Optional[str] = Field(default=None, min_length=2, max_length=255)
    cpf: Optional[str] = Field(default=None, min_length=11, max_length=14)
    email: Optional[EmailStr] = None
    matricula: Optional[str] = Field(default=None, min_length=1, max_length=50)
    tipo_vinculo: Optional[TipoVinculo] = None
    status: Optional[StatusAluno] = None
    instituicao_id: Optional[uuid.UUID] = None
    empresa_id: Optional[uuid.UUID] = None
    turma_id: Optional[uuid.UUID] = None
    ativo: Optional[bool] = None
    avatar_path: Optional[str] = None
    dados_aprendiz: Optional[DadosAprendizSchema] = None
    dados_estagiario: Optional[DadosEstagiarioSchema] = None

    @field_validator("cpf", mode="before")
    @classmethod
    def check_cpf(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            return validate_and_sanitize_cpf(v)
        return v


class AlunoRead(AlunoBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    tenant_id: uuid.UUID
    instituicao_id: Optional[uuid.UUID] = None
    empresa_id: Optional[uuid.UUID] = None
    turma_id: Optional[uuid.UUID] = None
    ativo: bool
    avatar_path: Optional[str] = None
    dados_aprendiz: Optional[DadosAprendizSchema] = None
    dados_estagiario: Optional[DadosEstagiarioSchema] = None
    created_at: datetime
    updated_at: datetime
