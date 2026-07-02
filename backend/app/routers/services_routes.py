from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth import require_roles
from app.database import get_db
from app.models import ProductService, User
from app.schemas import (
    ProductServiceCreate,
    ProductServiceRead,
    ProductServiceUpdate,
)

router = APIRouter(prefix="/services", tags=["services"])


@router.get("", response_model=list[ProductServiceRead])
def list_services(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("Administrador", "Recepcionista")),
):
    return db.query(ProductService).order_by(ProductService.id).all()


@router.get("/{service_id}", response_model=ProductServiceRead)
def get_service(
    service_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("Administrador", "Recepcionista")),
):
    service = db.query(ProductService).filter(ProductService.id == service_id).first()
    if service is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Servicio no encontrado",
        )
    return service


@router.post("", response_model=ProductServiceRead, status_code=status.HTTP_201_CREATED)
def create_service(
    service_data: ProductServiceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("Administrador")),
):
    service = ProductService(**service_data.model_dump())
    db.add(service)
    db.commit()
    db.refresh(service)
    return service


@router.put("/{service_id}", response_model=ProductServiceRead)
def update_service(
    service_id: int,
    service_data: ProductServiceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("Administrador")),
):
    service = db.query(ProductService).filter(ProductService.id == service_id).first()
    if service is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Servicio no encontrado",
        )

    for field, value in service_data.model_dump(exclude_unset=True).items():
        setattr(service, field, value)

    db.commit()
    db.refresh(service)
    return service


@router.delete("/{service_id}", response_model=ProductServiceRead)
def deactivate_service(
    service_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("Administrador")),
):
    service = db.query(ProductService).filter(ProductService.id == service_id).first()
    if service is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Servicio no encontrado",
        )

    service.is_active = False
    db.commit()
    db.refresh(service)
    return service
