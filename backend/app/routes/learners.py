from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Institution, Learner
from app.schemas import LearnerCreate, LearnerResponse
from app.auth import get_current_user
from app.models import Institution, Learner, User, UserRole

router = APIRouter(
    prefix="/api/learners",
    tags=["Learners"],
)


@router.post("/", response_model=LearnerResponse)
def create_learner(
    learner_data: LearnerCreate,
    db: Session = Depends(get_db),
):
    institution = db.get(
        Institution,
        learner_data.institution_id,
    )

    if institution is None:
        raise HTTPException(
            status_code=404,
            detail="Instituição não encontrada.",
        )

    learner = Learner(
        name=learner_data.name,
        cpf=learner_data.cpf,
        birth_date=learner_data.birth_date,
        email=learner_data.email,
        phone=learner_data.phone,
        institution_id=learner_data.institution_id,
    )

    db.add(learner)
    db.commit()
    db.refresh(learner)

    return learner


@router.get("/", response_model=list[LearnerResponse])
def list_learners(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(Learner)

    if current_user.role != UserRole.SUPER_ADMIN:
        query = query.filter(
            Learner.institution_id == current_user.institution_id
        )

    return query.all()