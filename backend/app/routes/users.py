from fastapi import APIRouter, Depends, HTTPException
from pwdlib import PasswordHash
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Institution, User, UserRole

router = APIRouter(
    prefix="/api/users",
    tags=["Users"],
)

password_hash = PasswordHash.recommended()


@router.post("/")
def create_user(
    name: str,
    email: str,
    password: str,
    role: UserRole,
    institution_id: int | None = None,
    db: Session = Depends(get_db),
):
    if role == UserRole.SUPER_ADMIN:
        if institution_id is not None:
            raise HTTPException(
                status_code=400,
                detail="SUPER_ADMIN não deve possuir instituição.",
            )

    else:
        if institution_id is None:
            raise HTTPException(
                status_code=400,
                detail="Usuários institucionais precisam de uma instituição.",
            )

        institution = db.get(Institution, institution_id)

        if institution is None:
            raise HTTPException(
                status_code=404,
                detail="Instituição não encontrada.",
            )

    existing_user = db.query(User).filter(
        User.email == email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="E-mail já cadastrado.",
        )

    user = User(
        name=name,
        email=email,
        password_hash=password_hash.hash(password),
        role=role,
        institution_id=institution_id,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "institution_id": user.institution_id,
        "created_at": user.created_at,
    }


@router.get("/")
def list_users(
    db: Session = Depends(get_db),
):
    users = db.query(User).all()

    return [
        {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "institution_id": user.institution_id,
            "created_at": user.created_at,
        }
        for user in users
    ]