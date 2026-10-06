from app.domain.schemas.aluno import AlunoBase, AlunoCreate, AlunoUpdate, AlunoRead
from app.domain.schemas.documento import DocumentoBase, DocumentoCreate, DocumentoUpdate, DocumentoValidate, DocumentoRead
from app.domain.schemas.tenant import TenantBase, TenantCreate, TenantUpdate, TenantRead
from app.domain.schemas.turma import TurmaBase, TurmaCreate, TurmaUpdate, TurmaRead, TurmaConformidadeRead
from app.domain.schemas.usuario import UsuarioBase, UsuarioCreate, UsuarioRead, LoginRequest, TokenResponse

__all__ = [
    "AlunoBase",
    "AlunoCreate",
    "AlunoUpdate",
    "AlunoRead",
    "DocumentoBase",
    "DocumentoCreate",
    "DocumentoUpdate",
    "DocumentoValidate",
    "DocumentoRead",
    "TenantBase",
    "TenantCreate",
    "TenantUpdate",
    "TenantRead",
    "TurmaBase",
    "TurmaCreate",
    "TurmaUpdate",
    "TurmaRead",
    "TurmaConformidadeRead",
    "UsuarioBase",
    "UsuarioCreate",
    "UsuarioRead",
    "LoginRequest",
    "TokenResponse"
]
