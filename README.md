# Sistema de gestión web integrando Reconocimiento Óptico de Caracteres (OCR) para la automatización del registro y administración operativa en el Hostal La Torre.

Este proyecto es un sistema web integral diseñado para automatizar los procesos operativos y administrativos del Hostal La Torre, incluyendo la digitalización y registro automático de documentos de identidad utilizando tecnología OCR.

## Tecnologías
- **Backend**: Python, FastAPI, SQLAlchemy
- **Frontend**: React, Vite, Bootstrap
- **Base de datos**: PostgreSQL
- **Autenticación**: JWT (JSON Web Tokens)
- **OCR**: Tesseract OCR, pytesseract y Pillow

## Módulos implementados
- Home pública
- Login
- Panel administrativo
- Usuarios y roles
- Huéspedes
- Registro OCR
- Servicios y consumos
- Compras de insumos
- Cobros/Ventas
- Reportes operativos

## Requisitos
- Python 3.9+
- Node.js 18+
- PostgreSQL
- Tesseract OCR (Requerido para el módulo de OCR)

## Configuración Backend
El backend requiere un archivo `.env` en el directorio `backend/`. 
Ejemplo de `backend/.env`:
```env
DATABASE_URL=postgresql://postgres:tu_contraseña@localhost:5432/hostal_la_torre_ocr
SECRET_KEY=supersecretkey
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

Comandos para ejecutar el backend:
```bash
cd backend
python -m venv venv
venv\Scripts\activate      # En Windows
pip install -r requirements.txt
uvicorn main:app --reload --port 8001
```

## Configuración Frontend
El frontend requiere un archivo `.env` en el directorio `frontend/`.
Ejemplo de `frontend/.env`:
```env
VITE_API_URL=http://127.0.0.1:8001/api
```

Comandos para ejecutar el frontend:
```bash
cd frontend
npm install
npm run dev
```

## Usuario de prueba
- **Usuario**: admin
- **Contraseña**: admin123

## Nota importante
Para usar el módulo OCR se requiere tener **Tesseract OCR** instalado en el sistema operativo y correctamente configurado en las variables de entorno, o especificar su ruta en la configuración del backend.

## Base de Datos
Para restaurar la base de datos inicial, puedes utilizar el respaldo SQL que se encuentra en `docs/sql/hostal_la_torre_ocr.sql`.
Comando de ejemplo para restaurar en PostgreSQL:
```bash
psql -U postgres -d hostal_la_torre_ocr -f docs/sql/hostal_la_torre_ocr.sql
```
