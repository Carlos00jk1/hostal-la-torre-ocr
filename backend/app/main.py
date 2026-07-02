from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import (
    auth_routes,
    guests_routes,
    ocr_routes,
    purchases_routes,
    sales_routes,
    services_routes,
    users_routes,
)

app = FastAPI(title="Hostal La Torre OCR API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {"status": "ok"}


app.include_router(auth_routes.router)
app.include_router(users_routes.router)
app.include_router(guests_routes.router)
app.include_router(services_routes.router)
app.include_router(purchases_routes.router)
app.include_router(sales_routes.router)
app.include_router(ocr_routes.router)
app.include_router(users_routes.roles_router)
