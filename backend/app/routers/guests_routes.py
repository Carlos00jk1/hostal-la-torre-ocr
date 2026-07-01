from fastapi import APIRouter

router = APIRouter(prefix="/guests", tags=["guests"])


@router.get("/")
def guests_status():
    return {"module": "guests", "status": "pending"}
