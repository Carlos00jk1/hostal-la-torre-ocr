from fastapi import APIRouter

router = APIRouter(prefix="/auth", tags=["auth"])


@router.get("/")
def auth_status():
    return {"module": "auth", "status": "pending"}
