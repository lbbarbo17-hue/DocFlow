import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field

class TurmaBase(BaseModel):
    codigo: str = Field(min_length=1, max_length=50)
    nome: str = Field(min_length=2, max_length=255)
    semestre_referencia: str = Field(min_length=1, max_length=20)
    instituicao_id: Optional[uuid.UUID] = None

class TurmaCreate(TurmaBase):
    pass

class TurmaUpdate(BaseModel):
    codigo: Optional[str] = Field(default=None, min_length=1, max_length=50)
    nome: Optional[str] = Field(default=None, min_length=2, max_length=255)
    semestre_referencia: Optional[str] = Field(default=None, min_length=1, max_length=20)
    instituicao_id: Optional[uuid.UUID] = None
    ativo: Optional[bool] = None

class TurmaRead(TurmaBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    tenant_id: uuid.UUID
    ativo: bool
    created_at: datetime
    updated_at: datetime

class TurmaConformidadeRead(BaseModel):
    turma_id: uuid.UUID
    codigo: str
    nome: str
    total_alunos: int
    alunos_regulares: int
    alunos_em_risco: int
    percentual_conformidade: float
