from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Institution

router = APIRouter(
    prefix="/api/institutions",
    tags=["Institutions"],
)


@router.post("/")
def create_institution(
    name: str,
    db: Session = Depends(get_db),
):
    institution = Institution(name=name)

    db.add(institution)
    db.commit()
    db.refresh(institution)

    return institution


@router.get("/")
def list_institutions(
    db: Session = Depends(get_db),
):
    return db.query(Institution).all()