from fastapi import APIRouter

router = APIRouter(prefix="/ocr", tags=["ocr"])


@router.get("/")
def ocr_status():
    return {"module": "ocr", "status": "pending"}
