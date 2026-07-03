from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth import require_roles
from app.database import get_db
from app.models import Purchase, PurchaseDetail, User
from app.schemas import PurchaseCreate, PurchaseRead, PurchaseUpdate

router = APIRouter(prefix="/purchases", tags=["purchases"])


def build_details(detail_data):
    details = []
    total = Decimal("0")

    for detail in detail_data:
        subtotal = detail.quantity * detail.unit_price
        total += subtotal
        details.append(
            PurchaseDetail(
                item_name=detail.item_name,
                quantity=detail.quantity,
                unit_price=detail.unit_price,
                subtotal=subtotal,
            )
        )

    return details, total


def get_purchase_or_404(db: Session, purchase_id: int) -> Purchase:
    purchase = db.query(Purchase).filter(Purchase.id == purchase_id).first()
    if purchase is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Compra no encontrada",
        )
    return purchase


@router.get("", response_model=list[PurchaseRead])
def list_purchases(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("Administrador", "Consulta")),
):
    return db.query(Purchase).order_by(Purchase.purchase_date.desc(), Purchase.id.desc()).all()


@router.get("/{purchase_id}", response_model=PurchaseRead)
def get_purchase(
    purchase_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("Administrador", "Consulta")),
):
    return get_purchase_or_404(db, purchase_id)


@router.post("", response_model=PurchaseRead, status_code=status.HTTP_201_CREATED)
def create_purchase(
    purchase_data: PurchaseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("Administrador")),
):
    if not purchase_data.details:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La compra debe tener al menos un detalle",
        )

    details, total = build_details(purchase_data.details)
    purchase = Purchase(
        supplier_name=purchase_data.supplier_name,
        purchase_date=purchase_data.purchase_date,
        notes=purchase_data.notes,
        total_amount=total,
        details=details,
    )
    db.add(purchase)
    db.commit()
    db.refresh(purchase)
    return purchase


@router.put("/{purchase_id}", response_model=PurchaseRead)
def update_purchase(
    purchase_id: int,
    purchase_data: PurchaseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("Administrador")),
):
    purchase = get_purchase_or_404(db, purchase_id)
    update_data = purchase_data.model_dump(exclude_unset=True, exclude={"details"})

    for field, value in update_data.items():
        setattr(purchase, field, value)

    if purchase_data.details is not None:
        if not purchase_data.details:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="La compra debe tener al menos un detalle",
            )
        details, total = build_details(purchase_data.details)
        purchase.details = details
        purchase.total_amount = total

    db.commit()
    db.refresh(purchase)
    return purchase


@router.delete("/{purchase_id}", response_model=PurchaseRead)
def cancel_purchase(
    purchase_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("Administrador")),
):
    purchase = get_purchase_or_404(db, purchase_id)
    purchase.is_cancelled = True
    db.commit()
    db.refresh(purchase)
    return purchase


@router.delete("/{purchase_id}/hard", response_model=dict)
def hard_delete_purchase(
    purchase_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("Administrador")),
):
    purchase = get_purchase_or_404(db, purchase_id)
    db.delete(purchase)
    db.commit()
    return {"message": "Compra eliminada permanentemente"}
