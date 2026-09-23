from datetime import datetime, timedelta, timezone
import os

import jwt
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from pwdlib import PasswordHash
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User


router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"],
)

password_hash = PasswordHash.recommended()

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")

if not JWT_SECRET_KEY:
    raise RuntimeError("JWT_SECRET_KEY não foi configurada.")

JWT_ALGORITHM = "HS256"
JWT_EXPIRE_MINUTES = 60


class LoginRequest(BaseModel):
    email: str
    password: str


@router.post("/login")
def login(
    login_data: LoginRequest,
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(
        User.email == login_data.email
    ).first()

    if user is None:
        raise HTTPException(
            status_code=401,
            detail="E-mail ou senha inválidos.",
        )

    password_is_valid = password_hash.verify(
        login_data.password,
        user.password_hash,
    )

    if not password_is_valid:
        raise HTTPException(
            status_code=401,
            detail="E-mail ou senha inválidos.",
        )

    expiration = datetime.now(timezone.utc) + timedelta(
        minutes=JWT_EXPIRE_MINUTES
    )

    payload = {
        "user_id": user.id,
        "role": user.role,
        "institution_id": user.institution_id,
        "exp": expiration,
    }

    token = jwt.encode(
        payload,
        JWT_SECRET_KEY,
        algorithm=JWT_ALGORITHM,
    )

    return {
        "access_token": token,
        "token_type": "bearer",
    }