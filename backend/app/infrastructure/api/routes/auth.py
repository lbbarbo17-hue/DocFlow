from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from app.domain.schemas.usuario import UsuarioCreate, UsuarioRead, LoginRequest, TokenResponse
from app.infrastructure.database.models.usuario import Usuario
from app.infrastructure.repositories.usuario_repository import SQLAlchemyUsuarioRepository
from app.application.services.auth_service import SupabaseAuthService
from app.infrastructure.api.dependencies import get_usuario_repository, get_current_user, get_storage_service
from app.application.services.file_validator import compute_file_hash_and_size
from app.application.services.storage_service import R2StorageService

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

@router.post("/me/avatar", response_model=UsuarioRead, status_code=status.HTTP_200_OK)
async def upload_my_avatar(
    file: UploadFile = File(...),
    current_user: Usuario = Depends(get_current_user),
    user_repo: SQLAlchemyUsuarioRepository = Depends(get_usuario_repository),
    storage_service: R2StorageService = Depends(get_storage_service)
):
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de autenticacao invalido ou ausente."
        )

    content = await file.read()
    try:
        sha256_hash, _, mime_type = compute_file_hash_and_size(content)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc)
        )

    if mime_type not in ["image/jpeg", "image/png"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Foto de perfil deve ser imagem JPEG ou PNG."
        )

    ext = "jpg" if mime_type == "image/jpeg" else "png"
    storage_path = f"tenants/{current_user.tenant_id}/usuarios/{current_user.id}/avatar_{sha256_hash[:8]}.{ext}"

    storage_service.upload_file(
        file_bytes=content,
        file_path=storage_path,
        content_type=mime_type
    )

    current_user.avatar_path = storage_path
    return await user_repo.update(current_user)

@router.get("/me/avatar-url", status_code=status.HTTP_200_OK)
async def get_my_avatar_url(
    current_user: Usuario = Depends(get_current_user),
    storage_service: R2StorageService = Depends(get_storage_service)
):
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de autenticacao invalido ou ausente."
        )

    if not current_user.avatar_path:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario nao possui foto de perfil."
        )

    url = storage_service.generate_download_url(file_path=current_user.avatar_path)
    return {"avatar_url": url}
