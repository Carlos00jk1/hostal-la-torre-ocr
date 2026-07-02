import re
from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.auth import require_roles
from app.database import get_db
from app.models import OCRDocument, User
from app.schemas import OCRExtractResponse

router = APIRouter(prefix="/ocr", tags=["ocr"])

UPLOAD_DIR = Path(__file__).resolve().parents[2] / "uploads"
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".webp", ".tif", ".tiff"}


def detect_document_number(text: str) -> str | None:
    patterns = [
        r"(?:CI|C\.I\.|CEDULA|DOCUMENTO|DNI)\s*[:#-]?\s*([A-Z0-9-]{5,20})",
        r"\b([0-9]{5,12})\b",
    ]
    for pattern in patterns:
        match = re.search(pattern, text, flags=re.IGNORECASE)
        if match:
            return match.group(1).strip()
    return None


def detect_full_name(text: str) -> str | None:
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    keywords = ("NOMBRE", "APELLIDO", "NAME")

    for index, line in enumerate(lines):
        upper_line = line.upper()
        if any(keyword in upper_line for keyword in keywords):
            parts = re.split(r"[:#-]", line, maxsplit=1)
            if len(parts) == 2 and len(parts[1].strip()) >= 5:
                return parts[1].strip()
            if index + 1 < len(lines) and len(lines[index + 1]) >= 5:
                return lines[index + 1]

    for line in lines:
        words = line.split()
        if len(words) >= 2 and line.upper() == line and not any(char.isdigit() for char in line):
            return line.title()

    return None


@router.post("/extract", response_model=OCRExtractResponse)
async def extract_ocr(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("Administrador", "Recepcionista")),
):
    extension = Path(file.filename or "").suffix.lower()
    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Formato de imagen no permitido",
        )

    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    safe_filename = f"{uuid4().hex}{extension}"
    file_path = UPLOAD_DIR / safe_filename
    file_path.write_bytes(await file.read())

    try:
        from PIL import Image
        import pytesseract
    except ImportError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="OCR no disponible. Instala pytesseract y Pillow en el entorno Python.",
        ) from exc

    try:
        with Image.open(file_path) as image:
            extracted_text = pytesseract.image_to_string(image, lang="spa+eng")
    except pytesseract.TesseractNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Tesseract OCR no esta instalado o no esta en el PATH del sistema.",
        ) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se pudo procesar la imagen para OCR.",
        ) from exc

    detected_full_name = detect_full_name(extracted_text)
    detected_document_number = detect_document_number(extracted_text)
    ocr_document = OCRDocument(
        filename=safe_filename,
        extracted_text=extracted_text,
        detected_full_name=detected_full_name,
        detected_document_number=detected_document_number,
    )
    db.add(ocr_document)
    db.commit()

    return OCRExtractResponse(
        filename=safe_filename,
        extracted_text=extracted_text,
        detected_full_name=detected_full_name,
        detected_document_number=detected_document_number,
    )
