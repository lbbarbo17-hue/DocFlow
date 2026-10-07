from app.domain.repositories.base import IRepository
from app.domain.repositories.aluno import IAlunoRepository
from app.domain.repositories.documento import IDocumentoRepository
from app.domain.repositories.turma import ITurmaRepository
from app.domain.repositories.usuario import IUsuarioRepository
from app.domain.repositories.catalogo import IInstituicaoRepository, IEmpresaRepository
from app.domain.repositories.contrato import IContratoRepository

__all__ = [
    "IRepository",
    "IAlunoRepository",
    "IDocumentoRepository",
    "ITurmaRepository",
    "IUsuarioRepository",
    "IInstituicaoRepository",
    "IEmpresaRepository",
    "IContratoRepository"
]
