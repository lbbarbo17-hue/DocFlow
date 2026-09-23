from fastapi import APIRouter, Depends, HTTPException
from pwdlib import PasswordHash
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Institution, User, UserRole
from app.schemas import UserCreate, UserResponse
from app.auth import get_current_user

router = APIRouter(
    prefix="/api/users",
    tags=["Users"],
)

password_hash = PasswordHash.recommended()


@router.post("/", response_model=UserResponse)
def create_user(
    user_data: UserCreate,
    db: Session = Depends(get_db),
):
    if user_data.role == UserRole.SUPER_ADMIN:
        if user_data.institution_id is not None:
            raise HTTPException(
                status_code=400,
                detail="SUPER_ADMIN não deve possuir instituição.",
            )

    else:
        if user_data.institution_id is None:
            raise HTTPException(
                status_code=400,
                detail="Usuários institucionais precisam de uma instituição.",
            )

        institution = db.get(
            Institution,
            user_data.institution_id,
        )

        if institution is None:
            raise HTTPException(
                status_code=404,
                detail="Instituição não encontrada.",
            )

    existing_user = db.query(User).filter(
        User.email == user_data.email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="E-mail já cadastrado.",
        )

    user = User(
        name=user_data.name,
        email=user_data.email,
        password_hash=password_hash.hash(user_data.password),
        role=user_data.role,
        institution_id=user_data.institution_id,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


@router.get("/", response_model=list[UserResponse])
def list_users(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return db.query(User).all()