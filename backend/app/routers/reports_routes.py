from decimal import Decimal

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.auth import require_roles
from app.database import get_db
from app.models import Guest, ProductService, Purchase, Sale, User
from app.schemas import ReportSummaryRead

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("/summary", response_model=ReportSummaryRead)
def get_report_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("Administrador", "Consulta")),
):
    total_services_active = (
        db.query(ProductService).filter(ProductService.is_active.is_(True)).count()
    )
    total_purchases = db.query(Purchase).count()
    total_purchase_amount = (
        db.query(func.coalesce(func.sum(Purchase.total_amount), 0)).scalar()
        or Decimal("0")
    )
    total_sales = db.query(Sale).count()
    total_sales_amount = (
        db.query(func.coalesce(func.sum(Sale.total_amount), 0)).scalar()
        or Decimal("0")
    )
    total_guests_active = db.query(Guest).filter(Guest.is_active.is_(True)).count()
    recent_sales = (
        db.query(Sale).order_by(Sale.sale_date.desc(), Sale.id.desc()).limit(5).all()
    )
    recent_purchases = (
        db.query(Purchase)
        .order_by(Purchase.purchase_date.desc(), Purchase.id.desc())
        .limit(5)
        .all()
    )

    return {
        "total_services_active": total_services_active,
        "total_purchases": total_purchases,
        "total_purchase_amount": total_purchase_amount,
        "total_sales": total_sales,
        "total_sales_amount": total_sales_amount,
        "total_guests_active": total_guests_active,
        "recent_sales": recent_sales,
        "recent_purchases": recent_purchases,
    }
