from fastapi import APIRouter, Depends, HTTPException, status
from app.domain.schemas.usuario import UsuarioCreate, UsuarioRead, LoginRequest, TokenResponse
from app.infrastructure.database.models.usuario import Usuario
from app.infrastructure.repositories.usuario_repository import SQLAlchemyUsuarioRepository
from app.application.services.auth_service import SupabaseAuthService
from app.infrastructure.api.dependencies import get_usuario_repository, get_current_user

router = APIRouter(prefix="/auth", tags=["Autenticação"])

@router.post("/register", response_model=UsuarioRead, status_code=status.HTTP_201_CREATED)
async def register(
    user_in: UsuarioCreate,
    user_repo: SQLAlchemyUsuarioRepository = Depends(get_usuario_repository)
):
    existing = await user_repo.get_by_email(user_in.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ja existe um usuario cadastrado com este e-mail."
        )

    supabase_uid = None
    if user_in.senha:
        supabase_uid = await SupabaseAuthService.signup(user_in.email, user_in.senha)

    novo_usuario = Usuario(
        tenant_id=user_in.tenant_id,
        email=user_in.email,
        nome=user_in.nome,
        perfil=user_in.perfil,
        supabase_user_id=supabase_uid or user_in.supabase_user_id
    )

    return await user_repo.create(novo_usuario)

@router.post("/login", response_model=TokenResponse, status_code=status.HTTP_200_OK)
async def login(
    credentials: LoginRequest,
    user_repo: SQLAlchemyUsuarioRepository = Depends(get_usuario_repository)
):
    user = await user_repo.get_by_email(credentials.email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario nao encontrado no DocFlow."
        )

    auth_data = await SupabaseAuthService.login(credentials.email, credentials.senha)
    access_token = auth_data.get("access_token", "")

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=user
    )

@router.get("/me", response_model=UsuarioRead, status_code=status.HTTP_200_OK)
async def get_me(
    current_user: Usuario = Depends(get_current_user)
):
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de autenticacao invalido ou ausente."
        )
    return current_user
