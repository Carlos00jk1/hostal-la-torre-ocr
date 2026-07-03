from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth import get_password_hash, require_roles
from app.database import get_db
from app.models import Role, User
from app.schemas import RoleRead, UserCreate, UserRead, UserUpdate

router = APIRouter(prefix="/users", tags=["users"])
roles_router = APIRouter(prefix="/roles", tags=["roles"])


def get_user_or_404(db: Session, user_id: int) -> User:
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado",
        )
    return user


def get_role_or_404(db: Session, role_id: int) -> Role:
    role = db.query(Role).filter(Role.id == role_id).first()
    if role is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Rol no encontrado",
        )
    return role


def ensure_username_available(
    db: Session, username: str, current_user_id: int | None = None
) -> None:
    if not username or not username.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El nombre de usuario es obligatorio",
        )

    existing_user = db.query(User).filter(User.username == username).first()
    if existing_user is not None and existing_user.id != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El nombre de usuario ya existe",
        )


def count_active_admins(db: Session) -> int:
    return (
        db.query(User)
        .join(Role)
        .filter(Role.name == "Administrador", User.is_active.is_(True))
        .count()
    )


def prevent_removing_last_active_admin(db: Session, user: User) -> None:
    if user.is_active and user.role.name == "Administrador" and count_active_admins(db) <= 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se puede desactivar el ultimo administrador activo",
        )


@router.get("", response_model=list[UserRead])
def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("Administrador")),
):
    return db.query(User).order_by(User.id).all()


@router.get("/{user_id}", response_model=UserRead)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("Administrador")),
):
    return get_user_or_404(db, user_id)


@router.post("", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def create_user(
    user_data: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("Administrador")),
):
    if not user_data.password or not user_data.password.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La contrasena es obligatoria",
        )

    ensure_username_available(db, user_data.username)
    role = get_role_or_404(db, user_data.role_id)

    user = User(
        username=user_data.username.strip(),
        hashed_password=get_password_hash(user_data.password),
        role_id=role.id,
        is_active=user_data.is_active,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.put("/{user_id}", response_model=UserRead)
def update_user(
    user_id: int,
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("Administrador")),
):
    user = get_user_or_404(db, user_id)
    update_data = user_data.model_dump(exclude_unset=True)

    if "username" in update_data:
        ensure_username_available(db, user_data.username, current_user_id=user.id)
        user.username = user_data.username.strip()

    if "role_id" in update_data:
        role = get_role_or_404(db, user_data.role_id)
        if user.role.name == "Administrador" and role.name != "Administrador":
            prevent_removing_last_active_admin(db, user)
        user.role_id = role.id

    if "is_active" in update_data:
        if user_data.is_active is False:
            prevent_removing_last_active_admin(db, user)
        user.is_active = user_data.is_active

    if user_data.password:
        user.hashed_password = get_password_hash(user_data.password)

    db.commit()
    db.refresh(user)
    return user


@router.delete("/{user_id}", response_model=UserRead)
def deactivate_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("Administrador")),
):
    user = get_user_or_404(db, user_id)
    prevent_removing_last_active_admin(db, user)
    user.is_active = False
    db.commit()
    db.refresh(user)
    return user


@router.delete("/{user_id}/hard", response_model=dict)
def hard_delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("Administrador")),
):
    user = get_user_or_404(db, user_id)
    prevent_removing_last_active_admin(db, user)
    db.delete(user)
    db.commit()
    return {"message": "Usuario eliminado permanentemente"}


@roles_router.get("", response_model=list[RoleRead])
def list_roles(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("Administrador")),
):
    return db.query(Role).order_by(Role.id).all()
