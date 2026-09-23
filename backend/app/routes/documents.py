from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Document, Institution, Learner
from app.schemas import DocumentCreate, DocumentResponse

router = APIRouter(
    prefix="/api/documents",
    tags=["Documents"],
)


@router.post("/", response_model=DocumentResponse)
def create_document(
    document_data: DocumentCreate,
    db: Session = Depends(get_db),
):
    institution = db.get(
        Institution,
        document_data.institution_id,
    )

    if institution is None:
        raise HTTPException(
            status_code=404,
            detail="Instituição não encontrada.",
        )

    learner = db.get(
        Learner,
        document_data.learner_id,
    )

    if learner is None:
        raise HTTPException(
            status_code=404,
            detail="Learner não encontrado.",
        )

    if learner.institution_id != document_data.institution_id:
        raise HTTPException(
            status_code=400,
            detail="O Learner não pertence à instituição informada.",
        )

    document = Document(
        institution_id=document_data.institution_id,
        learner_id=document_data.learner_id,
        type=document_data.type,
        file_name=document_data.file_name,
        storage_key=document_data.storage_key,
        mime_type=document_data.mime_type,
        file_size=document_data.file_size,
    )

    db.add(document)
    db.commit()
    db.refresh(document)

    return document


@router.get("/", response_model=list[DocumentResponse])
def list_documents(
    db: Session = Depends(get_db),
):
    return db.query(Document).all()