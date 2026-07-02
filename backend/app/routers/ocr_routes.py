import re
from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.auth import require_roles
from app.database import get_db
from app.models import OCRDocument, User
from app.ocr import extract_document_fields, extract_text_from_image, get_ocr_dependencies
from app.schemas import OCRExtractResponse, OCRMultipleExtractResponse

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


async def save_upload_file(file: UploadFile) -> tuple[Path, str, str]:
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
    return file_path, safe_filename, extension


async def extract_text_from_file(file: UploadFile, Image, pytesseract) -> tuple[str, str, dict]:
    file_path, safe_filename, _ = await save_upload_file(file)
    try:
        with Image.open(file_path) as image:
            extracted_text, ocr_debug = extract_text_from_image(image, pytesseract)
    except pytesseract.TesseractNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Tesseract OCR no está instalado o no está en el PATH del sistema.",
        ) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se pudo procesar la imagen para OCR.",
        ) from exc

    return safe_filename, extracted_text, ocr_debug


@router.post("/extract", response_model=OCRExtractResponse)
async def extract_ocr(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("Administrador", "Recepcionista")),
):
    Image, pytesseract = get_ocr_dependencies()
    safe_filename, extracted_text, ocr_debug = await extract_text_from_file(
        file, Image, pytesseract
    )

    detected_fields = extract_document_fields(extracted_text)
    detected_full_name = detected_fields.get("full_name") or detect_full_name(extracted_text)
    detected_document_number = detected_fields.get("document_number") or detect_document_number(extracted_text)
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
        detected_fields=detected_fields,
        ocr_debug=ocr_debug,
    )


@router.post("/extract-multiple", response_model=OCRMultipleExtractResponse)
async def extract_multiple_ocr(
    files: list[UploadFile] = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("Administrador", "Recepcionista")),
):
    if not files:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Debes cargar al menos una imagen.",
        )

    Image, pytesseract = get_ocr_dependencies()
    file_results = []
    extracted_texts = []
    best_debug = {"rotation_used": 0, "preprocess_used": "", "psm_used": 6, "score": 0}

    for file in files:
        try:
            safe_filename, extracted_text, ocr_debug = await extract_text_from_file(
                file, Image, pytesseract
            )
        except HTTPException as exc:
            if exc.status_code == status.HTTP_503_SERVICE_UNAVAILABLE:
                raise exc

            file_results.append(
                {
                    "original_filename": file.filename,
                    "filename": None,
                    "extracted_text": "",
                    "status": "failed",
                    "error": exc.detail,
                    "ocr_debug": {},
                }
            )
            continue

        detected_fields = extract_document_fields(extracted_text)
        detected_full_name = detected_fields.get("full_name") or detect_full_name(extracted_text)
        detected_document_number = detected_fields.get("document_number") or detect_document_number(extracted_text)
        ocr_document = OCRDocument(
            filename=safe_filename,
            extracted_text=extracted_text,
            detected_full_name=detected_full_name,
            detected_document_number=detected_document_number,
        )
        db.add(ocr_document)
        extracted_texts.append(extracted_text)
        if int(ocr_debug.get("score", 0)) > int(best_debug.get("score", 0)):
            best_debug = ocr_debug
        file_results.append(
            {
                "original_filename": file.filename,
                "filename": safe_filename,
                "extracted_text": extracted_text,
                "status": "success",
                "error": None,
                "ocr_debug": ocr_debug,
            }
        )

    db.commit()

    combined_text = "\n\n".join(text for text in extracted_texts if text.strip())
    detected_fields = extract_document_fields(combined_text)
    return {
        "combined_text": combined_text,
        "detected_full_name": detected_fields.get("full_name") or detect_full_name(combined_text),
        "detected_document_number": detected_fields.get("document_number") or detect_document_number(combined_text),
        "detected_fields": detected_fields,
        "ocr_debug": best_debug,
        "files": file_results,
    }
