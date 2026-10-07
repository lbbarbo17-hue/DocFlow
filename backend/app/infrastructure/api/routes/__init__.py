from fastapi import APIRouter
from app.infrastructure.api.routes.health import router as health_router
from app.infrastructure.api.routes.auth import router as auth_router
from app.infrastructure.api.routes.tenants import router as tenants_router
from app.infrastructure.api.routes.alunos import router as alunos_router
from app.infrastructure.api.routes.documentos import router as documentos_router
from app.infrastructure.api.routes.turmas import router as turmas_router
from app.infrastructure.api.routes.instituicoes import router as instituicoes_router
from app.infrastructure.api.routes.empresas import router as empresas_router
from app.infrastructure.api.routes.contratos import router as contratos_router

api_router = APIRouter()
api_router.include_router(health_router)
api_router.include_router(auth_router)
api_router.include_router(tenants_router)
api_router.include_router(alunos_router)
api_router.include_router(documentos_router)
api_router.include_router(turmas_router)
api_router.include_router(instituicoes_router)
api_router.include_router(empresas_router)
api_router.include_router(contratos_router)

__all__ = ["api_router"]
