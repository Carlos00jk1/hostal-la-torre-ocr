from sqlalchemy.orm import Session

from app.auth import get_password_hash
from app.database import Base, SessionLocal, engine
from app.models import Role, User

INITIAL_ROLES = ["Administrador", "Recepcionista", "Consulta"]
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "admin123"
ADMIN_ROLE = "Administrador"


def create_roles(db: Session) -> dict[str, Role]:
    roles = {}
    for role_name in INITIAL_ROLES:
        role = db.query(Role).filter(Role.name == role_name).first()
        if role is None:
            role = Role(name=role_name)
            db.add(role)
            db.flush()
        roles[role_name] = role
    return roles


def create_admin_user(db: Session, admin_role: Role) -> None:
    admin = db.query(User).filter(User.username == ADMIN_USERNAME).first()
    if admin is None:
        db.add(
            User(
                username=ADMIN_USERNAME,
                hashed_password=get_password_hash(ADMIN_PASSWORD),
                role_id=admin_role.id,
                is_active=True,
            )
        )


def run_seed():
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        roles = create_roles(db)
        create_admin_user(db, roles[ADMIN_ROLE])
        db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    run_seed()
    print("Seed ejecutado correctamente.")
