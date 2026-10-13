import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field
from app.domain.enums import PerfilUsuario

class UsuarioBase(BaseModel):
    email: EmailStr
    nome: str = Field(min_length=2, max_length=255)
    perfil: PerfilUsuario

class UsuarioCreate(UsuarioBase):
    tenant_id: uuid.UUID
    supabase_user_id: Optional[uuid.UUID] = None
    senha: Optional[str] = Field(default=None, min_length=6)
    avatar_path: Optional[str] = None

class UsuarioRead(UsuarioBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    tenant_id: uuid.UUID
    supabase_user_id: Optional[uuid.UUID] = None
    avatar_path: Optional[str] = None
    ativo: bool
    created_at: datetime
    updated_at: datetime

class LoginRequest(BaseModel):
    email: EmailStr
    senha: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UsuarioRead
