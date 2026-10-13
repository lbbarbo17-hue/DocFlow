from app.infrastructure.repositories.aluno_repository import SQLAlchemyAlunoRepository
from app.infrastructure.repositories.documento_repository import SQLAlchemyDocumentoRepository
from app.infrastructure.repositories.turma_repository import SQLAlchemyTurmaRepository
from app.infrastructure.repositories.usuario_repository import SQLAlchemyUsuarioRepository
from app.infrastructure.repositories.catalogo_repository import SQLAlchemyInstituicaoRepository, SQLAlchemyEmpresaRepository
from app.infrastructure.repositories.contrato_repository import SQLAlchemyContratoRepository

__all__ = [
    "SQLAlchemyAlunoRepository",
    "SQLAlchemyDocumentoRepository",
    "SQLAlchemyTurmaRepository",
    "SQLAlchemyUsuarioRepository",
    "SQLAlchemyInstituicaoRepository",
    "SQLAlchemyEmpresaRepository",
    "SQLAlchemyContratoRepository"
]
