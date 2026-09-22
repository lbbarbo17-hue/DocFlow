from fastapi import FastAPI

from app.routes.institutions import router as institutions_router
from app.routes.users import router as users_router

app = FastAPI(title="DocFlow API")


@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "service": "DocFlow API"
    }


app.include_router(institutions_router)
app.include_router(users_router)