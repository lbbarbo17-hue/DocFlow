from app.domain.repositories.base import IRepository
from app.domain.repositories.aluno import IAlunoRepository
from app.domain.repositories.documento import IDocumentoRepository
from app.domain.repositories.turma import ITurmaRepository
from app.domain.repositories.usuario import IUsuarioRepository

__all__ = [
    "IRepository",
    "IAlunoRepository",
    "IDocumentoRepository",
    "ITurmaRepository",
    "IUsuarioRepository"
]
