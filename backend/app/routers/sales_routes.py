from fastapi import APIRouter

router = APIRouter(prefix="/sales", tags=["sales"])


@router.get("/")
def sales_status():
    return {"module": "sales", "status": "pending"}
