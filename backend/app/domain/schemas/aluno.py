import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field
from app.domain.enums import StatusAluno

class AlunoBase(BaseModel):
    nome: str = Field(min_length=2, max_length=255)
    cpf: str = Field(min_length=11, max_length=14)
    email: EmailStr
    matricula: str = Field(min_length=1, max_length=50)
    status: StatusAluno = StatusAluno.ATIVO

class AlunoCreate(AlunoBase):
    instituicao_id: Optional[uuid.UUID] = None
    empresa_id: Optional[uuid.UUID] = None
    turma_id: Optional[uuid.UUID] = None

class AlunoUpdate(BaseModel):
    nome: Optional[str] = Field(default=None, min_length=2, max_length=255)
    cpf: Optional[str] = Field(default=None, min_length=11, max_length=14)
    email: Optional[EmailStr] = None
    matricula: Optional[str] = Field(default=None, min_length=1, max_length=50)
    status: Optional[StatusAluno] = None
    instituicao_id: Optional[uuid.UUID] = None
    empresa_id: Optional[uuid.UUID] = None
    turma_id: Optional[uuid.UUID] = None
    ativo: Optional[bool] = None

class AlunoRead(AlunoBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    tenant_id: uuid.UUID
    instituicao_id: Optional[uuid.UUID] = None
    empresa_id: Optional[uuid.UUID] = None
    turma_id: Optional[uuid.UUID] = None
    ativo: bool
    created_at: datetime
    updated_at: datetime
