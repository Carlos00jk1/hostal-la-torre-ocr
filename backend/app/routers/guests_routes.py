from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth import require_roles
from app.database import get_db
from app.models import Guest, User
from app.schemas import GuestCreate, GuestRead, GuestUpdate

router = APIRouter(prefix="/guests", tags=["guests"])


def get_guest_or_404(db: Session, guest_id: int) -> Guest:
    guest = db.query(Guest).filter(Guest.id == guest_id).first()
    if guest is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Huesped no encontrado",
        )
    return guest


@router.get("", response_model=list[GuestRead])
def list_guests(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles("Administrador", "Recepcionista", "Consulta")
    ),
):
    return db.query(Guest).order_by(Guest.full_name).all()


@router.get("/{guest_id}", response_model=GuestRead)
def get_guest(
    guest_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles("Administrador", "Recepcionista", "Consulta")
    ),
):
    return get_guest_or_404(db, guest_id)


@router.post("", response_model=GuestRead, status_code=status.HTTP_201_CREATED)
def create_guest(
    guest_data: GuestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("Administrador", "Recepcionista")),
):
    guest = Guest(**guest_data.model_dump())
    db.add(guest)
    db.commit()
    db.refresh(guest)
    return guest


@router.put("/{guest_id}", response_model=GuestRead)
def update_guest(
    guest_id: int,
    guest_data: GuestUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("Administrador", "Recepcionista")),
):
    guest = get_guest_or_404(db, guest_id)

    for field, value in guest_data.model_dump(exclude_unset=True).items():
        setattr(guest, field, value)

    db.commit()
    db.refresh(guest)
    return guest


@router.delete("/{guest_id}", response_model=GuestRead)
def deactivate_guest(
    guest_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("Administrador")),
):
    guest = get_guest_or_404(db, guest_id)
    guest.is_active = False
    db.commit()
    db.refresh(guest)
    return guest
