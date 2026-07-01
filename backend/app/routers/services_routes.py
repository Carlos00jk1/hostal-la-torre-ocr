from fastapi import APIRouter

router = APIRouter(prefix="/services", tags=["services"])


@router.get("/")
def services_status():
    return {"module": "services", "status": "pending"}
