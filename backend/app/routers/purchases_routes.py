from fastapi import APIRouter

router = APIRouter(prefix="/purchases", tags=["purchases"])


@router.get("/")
def purchases_status():
    return {"module": "purchases", "status": "pending"}
