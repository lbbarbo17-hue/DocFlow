from app.domain.schemas.aluno import AlunoBase, AlunoCreate, AlunoUpdate, AlunoRead
from app.domain.schemas.documento import DocumentoBase, DocumentoCreate, DocumentoUpdate, DocumentoValidate, DocumentoRead
from app.domain.schemas.tenant import TenantBase, TenantCreate, TenantUpdate, TenantRead
from app.domain.schemas.turma import TurmaBase, TurmaCreate, TurmaUpdate, TurmaRead, TurmaConformidadeRead
from app.domain.schemas.usuario import UsuarioBase, UsuarioCreate, UsuarioRead, LoginRequest, TokenResponse
from app.domain.schemas.catalogo import (
    InstituicaoBase,
    InstituicaoCreate,
    InstituicaoUpdate,
    InstituicaoRead,
    EmpresaBase,
    EmpresaCreate,
    EmpresaUpdate,
    EmpresaRead
)
from app.domain.schemas.contrato import ContratoBase, ContratoCreate, ContratoUpdate, ContratoRead

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
    "TokenResponse",
    "InstituicaoBase",
    "InstituicaoCreate",
    "InstituicaoUpdate",
    "InstituicaoRead",
    "EmpresaBase",
    "EmpresaCreate",
    "EmpresaUpdate",
    "EmpresaRead",
    "ContratoBase",
    "ContratoCreate",
    "ContratoUpdate",
    "ContratoRead"
]
