from fastapi import FastAPI

from app.routes.institutions import router as institutions_router
from app.routes.users import router as users_router
from app.routes.learners import router as learners_router
from app.routes.documents import router as documents_router
from app.routes.auth import router as auth_router

app = FastAPI(title="DocFlow API")


@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "service": "DocFlow API"
    }


app.include_router(institutions_router)
app.include_router(users_router)
app.include_router(learners_router)
app.include_router(documents_router)
app.include_router(auth_router)