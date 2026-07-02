import os
import re
import unicodedata
from datetime import date

from fastapi import HTTPException, status

WINDOWS_TESSERACT_PATH = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
OCR_TIMEOUT_SECONDS = 8
MAX_IMAGE_SIDE = 1800

SPANISH_MONTHS = {
    "ENERO": 1,
    "FEBRERO": 2,
    "MARZO": 3,
    "ABRIL": 4,
    "MAYO": 5,
    "JUNIO": 6,
    "JULIO": 7,
    "AGOSTO": 8,
    "SEPTIEMBRE": 9,
    "SETIEMBRE": 9,
    "OCTUBRE": 10,
    "NOVIEMBRE": 11,
    "DICIEMBRE": 12,
}

KEYWORDS = (
    "CEDULA",
    "CÉDULA",
    "IDENTIDAD",
    "ESTADO",
    "PLURINACIONAL",
    "BOLIVIA",
    "SERVICIO",
    "IDENTIFICACION",
    "IDENTIFICACIÓN",
    "NACIDO",
    "DOMICILIO",
    "PROFESION",
    "PROFESIÓN",
    "OCUPACION",
    "OCUPACIÓN",
    "ESTADO CIVIL",
)

INSTITUTIONAL_KEYWORDS = (
    "ESTADO",
    "PLURINACIONAL",
    "BOLIVIA",
    "SERVICIO",
    "IDENTIFICACION",
    "IDENTIFICACIÓN",
    "CERTIFICA",
    "CEDULA",
    "CÉDULA",
    "IDENTIDAD",
    "DOCUMENTO",
    "DOCUMENTOS",
    "REGISTRADOS",
    "FIRMA",
    "IMPRESION",
    "IMPRESIÓN",
    "DOMICILIO",
    "PROFESION",
    "PROFESIÓN",
    "OCUPACION",
    "OCUPACIÓN",
    "NACIMIENTO",
    "NACIONALIDAD",
    "PERSONAL",
    "SEGIP",
)


def get_ocr_dependencies():
    try:
        from PIL import Image
        import pytesseract
    except ImportError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="OCR no disponible. Instala pytesseract y Pillow en el entorno Python.",
        ) from exc

    if os.path.exists(WINDOWS_TESSERACT_PATH):
        pytesseract.pytesseract.tesseract_cmd = WINDOWS_TESSERACT_PATH

    return Image, pytesseract


def normalize_text_for_match(text: str) -> str:
    normalized = unicodedata.normalize("NFKD", text or "")
    normalized = "".join(char for char in normalized if not unicodedata.combining(char))
    normalized = normalized.upper()
    normalized = re.sub(r"[^\w\s°º/.-]", " ", normalized)
    normalized = re.sub(r"[ \t]+", " ", normalized)
    return normalized.strip()


def clean_extracted_text(text: str) -> str:
    cleaned_lines = []
    for line in (text or "").splitlines():
        line = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]", "", line)
        line = re.sub(r"([^\w\s])\1{2,}", r"\1\1", line)
        line = re.sub(r"[ \t]+", " ", line).strip()
        if line:
            cleaned_lines.append(line)
    return "\n".join(cleaned_lines)


def title_document_value(value: str | None) -> str | None:
    if not value:
        return None
    return " ".join(word.capitalize() for word in value.split())


def get_tesseract_language(pytesseract) -> str | None:
    try:
        languages = pytesseract.get_languages(config="")
    except Exception:
        return None
    return "spa" if "spa" in languages else None


def resize_if_large(image):
    width, height = image.size
    longest_side = max(width, height)
    if longest_side <= MAX_IMAGE_SIDE:
        return image

    scale = MAX_IMAGE_SIDE / longest_side
    new_size = (int(width * scale), int(height * scale))
    return image.resize(new_size)


def build_preprocess_variants(image):
    from PIL import ImageEnhance, ImageOps

    base_image = resize_if_large(ImageOps.exif_transpose(image).convert("RGB"))
    grayscale = ImageOps.grayscale(base_image)
    width, height = grayscale.size

    variants = [("original_exif", base_image)]
    variants.append(("grayscale_contrast_soft", ImageEnhance.Contrast(grayscale).enhance(1.25)))
    if max(width, height) < 1100:
        variants.append(("grayscale_2x", grayscale.resize((width * 2, height * 2))))
    variants.append(
        (
            "contrast_soft_sharpness",
            ImageEnhance.Sharpness(
                ImageEnhance.Contrast(grayscale).enhance(1.25)
            ).enhance(1.35),
        )
    )
    return variants


def score_ocr_text(text: str) -> int:
    normalized_text = normalize_text_for_match(text)
    words = re.findall(r"\b[A-ZÁÉÍÓÚÑ]{2,}\b", normalized_text)
    keyword_hits = sum(1 for keyword in KEYWORDS if normalize_text_for_match(keyword) in normalized_text)
    document_numbers = re.findall(r"\b\d{6,8}\b", normalized_text)
    longer_numbers = re.findall(r"\b\d{5,10}\b", normalized_text)

    return len(words) + (keyword_hits * 12) + (len(document_numbers) * 10) + len(longer_numbers)


def run_tesseract(image, pytesseract, language: str | None, config: str) -> str:
    try:
        if language:
            return pytesseract.image_to_string(
                image,
                lang=language,
                config=config,
                timeout=OCR_TIMEOUT_SECONDS,
            )
        return pytesseract.image_to_string(
            image,
            config=config,
            timeout=OCR_TIMEOUT_SECONDS,
        )
    except RuntimeError:
        return ""


def extract_text_from_image(image, pytesseract) -> tuple[str, dict[str, int | str]]:
    language = get_tesseract_language(pytesseract)
    variants = build_preprocess_variants(image)
    best_text = ""
    best_debug = {
        "rotation_used": 0,
        "preprocess_used": "original_exif",
        "psm_used": 6,
        "score": 0,
    }

    orientation_variant = variants[0][1]
    for rotation in (0, 90, 180, 270):
        rotated_image = (
            orientation_variant.rotate(rotation, expand=True)
            if rotation
            else orientation_variant
        )
        raw_text = run_tesseract(rotated_image, pytesseract, language, "--oem 3 --psm 6")
        cleaned_text = clean_extracted_text(raw_text)
        score = score_ocr_text(cleaned_text)
        if score > int(best_debug["score"]):
            best_text = cleaned_text
            best_debug = {
                "rotation_used": rotation,
                "preprocess_used": "original_exif",
                "psm_used": 6,
                "score": score,
            }

    best_rotation = int(best_debug["rotation_used"])
    for preprocess_name, variant in variants:
        rotated_image = variant.rotate(best_rotation, expand=True) if best_rotation else variant
        for psm in (6, 11):
            config = f"--oem 3 --psm {psm}"
            raw_text = run_tesseract(rotated_image, pytesseract, language, config)
            cleaned_text = clean_extracted_text(raw_text)
            score = score_ocr_text(cleaned_text)
            if score > int(best_debug["score"]):
                best_text = cleaned_text
                best_debug = {
                    "rotation_used": best_rotation,
                    "preprocess_used": preprocess_name,
                    "psm_used": psm,
                    "score": score,
                }

    return best_text, best_debug


def parse_birth_date(text: str) -> str | None:
    born_match = re.search(
        r"\bNACID[OA]\s+(?:EL\s+)?(\d{1,2})\s+DE\s+([A-Z]+)\s+DE\s+(\d{4})\b",
        text,
        flags=re.IGNORECASE,
    )
    if born_match:
        day, month_name, year = born_match.groups()
        month_number = SPANISH_MONTHS.get(normalize_text_for_match(month_name))
        if month_number:
            day_number = int(day)
            year_number = int(year)
            if 1 <= day_number <= 31 and 1900 <= year_number <= date.today().year:
                return f"{year_number:04d}-{month_number:02d}-{day_number:02d}"

    patterns = [
        r"\b(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})\b",
        r"\b(\d{4})[/-](\d{1,2})[/-](\d{1,2})\b",
    ]
    for pattern in patterns:
        match = re.search(pattern, text)
        if not match:
            continue

        groups = match.groups()
        if len(groups[0]) == 4:
            year, month, day = groups
        else:
            day, month, year = groups
            year = f"20{year}" if len(year) == 2 and int(year) < 30 else year
            year = f"19{year}" if len(year) == 2 else year

        try:
            day_number = int(day)
            month_number = int(month)
            year_number = int(year)
        except ValueError:
            continue

        if 1 <= day_number <= 31 and 1 <= month_number <= 12 and 1900 <= year_number <= 2100:
            return f"{year_number:04d}-{month_number:02d}-{day_number:02d}"
    return None


def calculate_age(birth_date: str | None) -> int | None:
    if not birth_date:
        return None
    try:
        year, month, day = (int(part) for part in birth_date.split("-"))
        born = date(year, month, day)
    except ValueError:
        return None

    today = date.today()
    age = today.year - born.year
    if (today.month, today.day) < (born.month, born.day):
        age -= 1
    return age if age >= 0 else None


def is_excluded_number(number: str) -> bool:
    if number in {"34444", "24444", "2020", "2030"}:
        return True
    if len(number) == 4 and 1900 <= int(number) <= 2100:
        return True
    return False


def extract_document_number(lines: list[str], normalized_text: str) -> str | None:
    keyword_pattern = r"(?:CEDULA|IDENTIDAD|C\.?I\.?|CI|N[°ºO.]?|A\.)"
    candidates = []

    for line_index, line in enumerate(lines):
        normalized_line = normalize_text_for_match(line)
        for match in re.finditer(r"\b(\d{5,10})\b", normalized_line):
            number = match.group(1)
            if not number.isdigit() or is_excluded_number(number):
                continue

            score = 0
            if 6 <= len(number) <= 8:
                score += 20
            if re.search(keyword_pattern, normalized_line):
                score += 15
            if line_index <= 5:
                score += 3
            candidates.append((score, number))

    for match in re.finditer(r"\b(\d{5,10})\b", normalized_text):
        number = match.group(1)
        if not number.isdigit() or is_excluded_number(number):
            continue

        start = max(match.start() - 45, 0)
        end = min(match.end() + 45, len(normalized_text))
        context = normalized_text[start:end]
        score = 10 if 6 <= len(number) <= 8 else 1
        if re.search(keyword_pattern, context):
            score += 15
        candidates.append((score, number))

    if not candidates:
        return None

    candidates.sort(key=lambda item: item[0], reverse=True)
    return candidates[0][1]


def is_valid_name_candidate(candidate: str) -> bool:
    normalized_candidate = normalize_text_for_match(candidate)
    words = normalized_candidate.split()
    if not (2 <= len(words) <= 5):
        return False
    if any(len(word) <= 2 for word in words):
        return False
    if any(keyword in normalized_candidate for keyword in INSTITUTIONAL_KEYWORDS):
        return False
    if re.search(r"[^A-ZÁÉÍÓÚÑ ]", candidate.upper()):
        return False
    return True


def extract_full_name(lines: list[str], document_number: str | None) -> str | None:
    if document_number:
        pattern = rf"\b{re.escape(document_number)}\b\s+([A-ZÁÉÍÓÚÑ ]{{8,90}})"
        for line in lines:
            match = re.search(pattern, line.upper())
            if match:
                candidate = re.sub(r"\s+", " ", match.group(1)).strip()
                if is_valid_name_candidate(candidate):
                    return title_document_value(candidate)

    for index, line in enumerate(lines):
        normalized_line = normalize_text_for_match(line)
        if re.search(r"(?:^|\s)A\.(?:\s|$)", normalized_line) and index + 1 < len(lines):
            next_line = re.sub(r"[^A-ZÁÉÍÓÚÑ ]", " ", lines[index + 1].upper())
            next_line = re.sub(r"\s+", " ", next_line).strip()
            if is_valid_name_candidate(next_line):
                return title_document_value(next_line)

    for line in lines:
        candidate = re.sub(r"[^A-ZÁÉÍÓÚÑ ]", " ", line.upper())
        candidate = re.sub(r"\s+", " ", candidate).strip()
        if is_valid_name_candidate(candidate):
            return title_document_value(candidate)

    return None


def is_institutional_line(line: str) -> bool:
    normalized_line = normalize_text_for_match(line)
    return any(keyword in normalized_line for keyword in INSTITUTIONAL_KEYWORDS)


def clean_occupation_value(value: str | None) -> str | None:
    if not value:
        return None

    value = re.split(
        r"\b(?:DOMICILIO|DIRECCION|DIRECCIÓN)\b",
        value,
        maxsplit=1,
        flags=re.IGNORECASE,
    )[0]
    value = re.sub(r"[^A-ZÁÉÍÓÚÑa-záéíóúñ ]", " ", value)
    value = re.sub(r"\s+", " ", value).strip()

    if len(value) < 3 or is_institutional_line(value):
        return None
    return title_document_value(value)


def clean_address_value(value: str | None) -> str | None:
    if not value:
        return None

    value = value.strip()
    value = re.sub(r"\b8/LA\b", "B/LA", value, flags=re.IGNORECASE)
    value = re.sub(r"\bTARWA\b", "TARIJA", value, flags=re.IGNORECASE)
    value = re.sub(r"\bPAMPA\s*AV\.", "PAMPA AV.", value, flags=re.IGNORECASE)
    value = re.split(
        r"\b(?:PAMELA|HERMOSA|GUTERREZ|DIREC|DIRECTORA|GENERAL|EJECUTIVA|SERVI|FIRMA|FOTOGRAFIA|IMPRESION)\b",
        value,
        maxsplit=1,
        flags=re.IGNORECASE,
    )[0]
    value = re.sub(r"\bTARIJA\b.*$", "TARIJA", value, flags=re.IGNORECASE)
    value = re.sub(r"\s*-\s*", " - ", value)
    value = re.sub(r"\s+", " ", value).strip()
    return value.upper() if value else None


def is_city_only_address(value: str) -> bool:
    normalized_value = normalize_text_for_match(value)
    city_names = {"TARWA", "TARIJA", "LA PAZ", "COCHABAMBA", "SANTA CRUZ", "ORURO", "POTOSI", "SUCRE"}
    return normalized_value in city_names


def address_score(value: str) -> int:
    normalized_value = normalize_text_for_match(value)
    score = len(value)
    for keyword in ("B/", "AV.", "AVENIDA", "CALLE", "ZONA", "BARRIO"):
        if keyword in normalized_value:
            score += 30
    if is_city_only_address(value):
        score -= 100
    return score


def extract_address(lines: list[str], cleaned_text: str) -> str | None:
    candidates: list[str] = []
    compact_text = re.sub(r"\s+", " ", cleaned_text).strip()
    address_match = re.search(
        r"\bDOMICILIO\b\s+(.+?)(?=\b(?:PROFESION|PROFESIÓN|OCUPACION|OCUPACIÓN|ESTADO CIVIL|NACIDO|NACIMIENTO)\b|$)",
        compact_text,
        flags=re.IGNORECASE,
    )
    if address_match:
        address = clean_address_value(address_match.group(1))
        if address and not is_institutional_line(address):
            candidates.append(address)

    location_keywords = ("B/", "AV.", "AVENIDA", "CALLE", "ZONA", "BARRIO")
    for index, line in enumerate(lines):
        normalized_line = normalize_text_for_match(line)
        if "DOMICILIO" in normalized_line:
            candidate = re.sub(r"^.*?\bDOMICILIO\b", "", line, flags=re.IGNORECASE).strip(" :#-")
            address = clean_address_value(candidate)
            if address and not is_institutional_line(address):
                candidates.append(address)
            if index + 1 < len(lines) and not is_institutional_line(lines[index + 1]):
                address = clean_address_value(lines[index + 1])
                if address:
                    candidates.append(address)

        if any(keyword in normalized_line for keyword in location_keywords) and not is_institutional_line(line):
            address = clean_address_value(line)
            if address:
                candidates.append(address)

    if not candidates:
        return None

    complete_candidates = [candidate for candidate in candidates if not is_city_only_address(candidate)]
    return max(complete_candidates or candidates, key=address_score)


def extract_marital_status(normalized_text: str) -> str | None:
    for status_name in ("SOLTERO", "CASADO", "DIVORCIADO", "VIUDO"):
        if status_name in normalized_text:
            return title_document_value(status_name)
    return None


def extract_occupation(lines: list[str], cleaned_text: str) -> str | None:
    compact_text = re.sub(r"\s+", " ", cleaned_text).strip()
    occupation_match = re.search(
        r"\b(?:PROFESION/OCUPACION|PROFESIÓN/OCUPACIÓN|PROFESION|PROFESIÓN|OCUPACION|OCUPACIÓN)\b\s+(.+?)(?=\b(?:DOMICILIO|DIRECCION|DIRECCIÓN)\b|$)",
        compact_text,
        flags=re.IGNORECASE,
    )
    occupation = clean_occupation_value(occupation_match.group(1) if occupation_match else None)
    if occupation:
        return occupation

    for index, line in enumerate(lines):
        normalized_line = normalize_text_for_match(line)
        if "PROFESION" in normalized_line or "OCUPACION" in normalized_line:
            candidate = re.sub(
                r"^.*?\b(?:PROFESION/OCUPACION|PROFESIÓN/OCUPACIÓN|PROFESION|PROFESIÓN|OCUPACION|OCUPACIÓN)\b",
                "",
                line,
                flags=re.IGNORECASE,
            ).strip(" :#-")
            occupation = clean_occupation_value(candidate)
            if occupation:
                return occupation
            if index + 1 < len(lines):
                occupation = clean_occupation_value(lines[index + 1])
                if occupation:
                    return occupation
    return None


def extract_document_fields(text: str) -> dict[str, str | int | None]:
    cleaned_text = clean_extracted_text(text)
    lines = [line.strip() for line in cleaned_text.splitlines() if line.strip()]
    normalized_text = normalize_text_for_match(cleaned_text)

    document_type = None
    if any(keyword in normalized_text for keyword in ("CEDULA DE IDENTIDAD", "IDENTIDAD", "SEGIP")):
        document_type = "CI"

    document_number = extract_document_number(lines, normalized_text)
    full_name = extract_full_name(lines, document_number)
    nationality = "Boliviana" if "BOLIVIA" in normalized_text or "BOLIVIANA" in normalized_text else None
    birth_date = parse_birth_date(normalized_text)

    return {
        "full_name": full_name,
        "document_number": document_number,
        "document_type": document_type,
        "birth_date": birth_date,
        "age": calculate_age(birth_date),
        "marital_status": extract_marital_status(normalized_text),
        "occupation": extract_occupation(lines, cleaned_text),
        "address": extract_address(lines, cleaned_text),
        "nationality": nationality,
    }
