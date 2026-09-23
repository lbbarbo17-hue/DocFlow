from datetime import datetime

from pydantic import BaseModel


class LearnerCreate(BaseModel):
    name: str
    cpf: str
    birth_date: datetime
    institution_id: int
    email: str | None = None
    phone: str | None = None


class LearnerResponse(BaseModel):
    id: int
    name: str
    cpf: str
    birth_date: datetime
    email: str | None
    phone: str | None
    institution_id: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class DocumentCreate(BaseModel):
    learner_id: int
    type: str
    file_name: str
    institution_id: int
    storage_key: str | None = None
    mime_type: str | None = None
    file_size: int | None = None


class DocumentResponse(BaseModel):
    id: int
    institution_id: int
    learner_id: int
    type: str
    file_name: str
    storage_key: str | None
    mime_type: str | None
    file_size: int | None
    status: str
    uploaded_at: datetime
    approved_at: datetime | None

    class Config:
        from_attributes = True


from app.models import UserRole


class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    role: UserRole
    institution_id: int | None = None


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: UserRole
    institution_id: int | None
    created_at: datetime

    class Config:
        from_attributes = True