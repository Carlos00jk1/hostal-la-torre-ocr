from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth import require_roles
from app.database import get_db
from app.models import ProductService, Sale, SaleDetail, User
from app.schemas import SaleCreate, SaleRead, SaleUpdate

router = APIRouter(prefix="/sales", tags=["sales"])


def build_details(db: Session, detail_data):
    details = []
    total = Decimal("0")

    for detail in detail_data:
        description = detail.description
        unit_price = detail.unit_price

        if detail.quantity <= 0 or detail.unit_price < 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cantidad y precio unitario no validos",
            )

        if detail.product_service_id is not None:
            service = (
                db.query(ProductService)
                .filter(ProductService.id == detail.product_service_id)
                .first()
            )
            if service is None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Servicio o producto no encontrado",
                )
            description = description or service.name
            unit_price = unit_price or service.price

        if not description:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cada detalle debe tener una descripcion",
            )

        subtotal = detail.quantity * unit_price
        total += subtotal
        details.append(
            SaleDetail(
                product_service_id=detail.product_service_id,
                description=description,
                quantity=detail.quantity,
                unit_price=unit_price,
                subtotal=subtotal,
            )
        )

    return details, total


def get_sale_or_404(db: Session, sale_id: int) -> Sale:
    sale = db.query(Sale).filter(Sale.id == sale_id).first()
    if sale is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Venta no encontrada",
        )
    return sale


@router.get("", response_model=list[SaleRead])
def list_sales(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles("Administrador", "Recepcionista", "Consulta")
    ),
):
    return db.query(Sale).order_by(Sale.sale_date.desc(), Sale.id.desc()).all()


@router.get("/{sale_id}", response_model=SaleRead)
def get_sale(
    sale_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles("Administrador", "Recepcionista", "Consulta")
    ),
):
    return get_sale_or_404(db, sale_id)


@router.post("", response_model=SaleRead, status_code=status.HTTP_201_CREATED)
def create_sale(
    sale_data: SaleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("Administrador", "Recepcionista")),
):
    if not sale_data.details:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La venta debe tener al menos un detalle",
        )

    details, total = build_details(db, sale_data.details)
    sale = Sale(
        customer_name=sale_data.customer_name,
        sale_date=sale_data.sale_date,
        payment_method=sale_data.payment_method,
        notes=sale_data.notes,
        total_amount=total,
        status="vigente",
        details=details,
    )
    db.add(sale)
    db.commit()
    db.refresh(sale)
    return sale


@router.put("/{sale_id}", response_model=SaleRead)
def update_sale(
    sale_id: int,
    sale_data: SaleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("Administrador")),
):
    sale = get_sale_or_404(db, sale_id)
    update_data = sale_data.model_dump(exclude_unset=True, exclude={"details"})

    for field, value in update_data.items():
        setattr(sale, field, value)

    if sale_data.details is not None:
        if not sale_data.details:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="La venta debe tener al menos un detalle",
            )
        details, total = build_details(db, sale_data.details)
        sale.details = details
        sale.total_amount = total

    db.commit()
    db.refresh(sale)
    return sale


@router.delete("/{sale_id}", response_model=SaleRead)
def cancel_sale(
    sale_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("Administrador")),
):
    sale = get_sale_or_404(db, sale_id)
    sale.status = "anulada"
    db.commit()
    db.refresh(sale)
    return sale


