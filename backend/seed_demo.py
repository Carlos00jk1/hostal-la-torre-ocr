"""
Script de datos de demostración para Hostal La Torre.
Inserta huéspedes, servicios, compras y ventas de muestra.

Uso:
  cd backend
  python seed_demo.py
"""
from datetime import datetime, timedelta

from app.database import Base, SessionLocal, engine
from app.models import (
    Guest,
    ProductService,
    Purchase,
    PurchaseDetail,
    Sale,
    SaleDetail,
    User,
)


def get_admin(db):
    return db.query(User).filter(User.username == "admin").first()


def seed_guests(db):
    guests = [
        Guest(
            full_name="Maria Elena Quispe Mamani",
            document_type="CI",
            document_number="7834521",
            phone="70123456",
            email="mquispe@correo.com",
            nationality="Boliviana",
            address="Calle Potosi 123, La Paz",
            birth_date=datetime(1988, 3, 14),
            notes="Huesped frecuente, prefiere habitacion con vista al patio.",
            is_active=True,
        ),
        Guest(
            full_name="Carlos Alberto Mamani Flores",
            document_type="CI",
            document_number="6123890",
            phone="71456789",
            email=None,
            nationality="Boliviana",
            address="Av. Arce 456, Cochabamba",
            birth_date=datetime(1975, 11, 22),
            notes=None,
            is_active=True,
        ),
        Guest(
            full_name="Andrea Gonzalez Perez",
            document_type="Pasaporte",
            document_number="AB123456",
            phone="69887744",
            email="andreag@email.com",
            nationality="Argentina",
            address="Corrientes 800, Buenos Aires",
            birth_date=datetime(1995, 7, 8),
            notes="Viajera de negocios, requiere factura.",
            is_active=True,
        ),
        Guest(
            full_name="Jorge Luis Condori Apaza",
            document_type="CI",
            document_number="5678901",
            phone="76543210",
            email=None,
            nationality="Boliviana",
            address="Villa Fatima, El Alto",
            birth_date=datetime(1982, 1, 30),
            notes=None,
            is_active=True,
        ),
        Guest(
            full_name="Lucia Fernanda Torres Vargas",
            document_type="CI",
            document_number="8901234",
            phone="72334455",
            email="ltorres@mail.com",
            nationality="Boliviana",
            address="Zona Central 789, Sucre",
            birth_date=datetime(2000, 5, 19),
            notes="Primera visita al hostal.",
            is_active=True,
        ),
        Guest(
            full_name="Peter John Smith",
            document_type="Pasaporte",
            document_number="US987654",
            phone=None,
            email="psmith@gmail.com",
            nationality="Estadounidense",
            address="New York, USA",
            birth_date=datetime(1985, 9, 3),
            notes="Turista, habla espanol basico.",
            is_active=True,
        ),
        Guest(
            full_name="Rosa Elvira Chura Limachi",
            document_type="CI",
            document_number="4567892",
            phone="78901234",
            email=None,
            nationality="Boliviana",
            address="Miraflores, La Paz",
            birth_date=datetime(1970, 12, 5),
            notes=None,
            is_active=False,
        ),
    ]
    db.add_all(guests)
    db.flush()
    print(f"  Huespedes: {len(guests)} registros creados.")
    return guests


def seed_services(db):
    existing = db.query(ProductService).count()
    if existing > 0:
        print(f"  Servicios: ya existen {existing}, se omite.")
        return db.query(ProductService).all()

    services = [
        ProductService(
            name="Noche habitacion simple",
            description="Habitacion individual con bano compartido",
            category="Hospedaje",
            price=80.00,
            stock=None,
            is_active=True,
        ),
        ProductService(
            name="Noche habitacion doble",
            description="Habitacion doble con bano privado",
            category="Hospedaje",
            price=130.00,
            stock=None,
            is_active=True,
        ),
        ProductService(
            name="Desayuno continental",
            description="Pan, jugos, huevos, cafe o te",
            category="Alimentacion",
            price=25.00,
            stock=None,
            is_active=True,
        ),
        ProductService(
            name="Almuerzo del dia",
            description="Sopa, segundo y refresco",
            category="Alimentacion",
            price=35.00,
            stock=None,
            is_active=True,
        ),
        ProductService(
            name="Lavado de ropa por kilo",
            description="Lavado y secado de ropa por kilogramo",
            category="Lavanderia",
            price=15.00,
            stock=None,
            is_active=True,
        ),
        ProductService(
            name="Agua mineral 600ml",
            description="Botella de agua fria",
            category="Bebidas",
            price=8.00,
            stock=48,
            is_active=True,
        ),
        ProductService(
            name="Refresco lata",
            description="Coca-Cola, Pepsi o Sprite en lata",
            category="Bebidas",
            price=12.00,
            stock=36,
            is_active=True,
        ),
        ProductService(
            name="Wifi premium",
            description="Acceso prioritario a internet por dia",
            category="Otros",
            price=20.00,
            stock=None,
            is_active=True,
        ),
        ProductService(
            name="Parqueo vehiculo",
            description="Estacionamiento seguro por noche",
            category="Otros",
            price=30.00,
            stock=None,
            is_active=True,
        ),
        ProductService(
            name="Snack mix",
            description="Bolsa de snacks variados",
            category="Bebidas",
            price=18.00,
            stock=20,
            is_active=False,
        ),
    ]
    db.add_all(services)
    db.flush()
    print(f"  Servicios: {len(services)} registros creados.")
    return services


def seed_purchases(db):
    existing = db.query(Purchase).count()
    if existing > 0:
        print(f"  Compras: ya existen {existing}, se omite.")
        return

    today = datetime.now()
    purchases_data = [
        {
            "supplier_name": "Distribuidora El Sol",
            "purchase_date": today - timedelta(days=20),
            "notes": "Compra mensual de insumos de limpieza",
            "is_cancelled": False,
            "details": [
                {"item_name": "Detergente liquido 5L", "quantity": 4, "unit_price": 65.00},
                {"item_name": "Desinfectante pino 4L", "quantity": 3, "unit_price": 45.00},
                {"item_name": "Papel higienico x12", "quantity": 10, "unit_price": 28.00},
                {"item_name": "Jabon de manos 1L", "quantity": 6, "unit_price": 22.00},
            ],
        },
        {
            "supplier_name": "Minimarket Don Pedro",
            "purchase_date": today - timedelta(days=14),
            "notes": "Bebidas y snacks para minibar",
            "is_cancelled": False,
            "details": [
                {"item_name": "Agua mineral 600ml x24", "quantity": 2, "unit_price": 85.00},
                {"item_name": "Refrescos lata x24", "quantity": 2, "unit_price": 110.00},
                {"item_name": "Snacks mix x20", "quantity": 1, "unit_price": 95.00},
            ],
        },
        {
            "supplier_name": "Proveedora La Torre",
            "purchase_date": today - timedelta(days=7),
            "notes": "Insumos de habitaciones",
            "is_cancelled": False,
            "details": [
                {"item_name": "Sabanas 2 plazas x10", "quantity": 2, "unit_price": 280.00},
                {"item_name": "Toallas de bano x12", "quantity": 1, "unit_price": 195.00},
                {"item_name": "Almohadas x6", "quantity": 1, "unit_price": 150.00},
            ],
        },
        {
            "supplier_name": "Distribuidora El Sol",
            "purchase_date": today - timedelta(days=2),
            "notes": "Reposicion urgente de limpieza",
            "is_cancelled": False,
            "details": [
                {"item_name": "Cloro 4L", "quantity": 2, "unit_price": 30.00},
                {"item_name": "Guantes latex x50", "quantity": 1, "unit_price": 35.00},
            ],
        },
        {
            "supplier_name": "Ferreteria Central",
            "purchase_date": today - timedelta(days=30),
            "notes": "Compra anulada por devolucion",
            "is_cancelled": True,
            "details": [
                {"item_name": "Focos LED x10", "quantity": 3, "unit_price": 60.00},
            ],
        },
    ]

    for pdata in purchases_data:
        details_raw = pdata.pop("details")
        total = sum(d["quantity"] * d["unit_price"] for d in details_raw)
        purchase = Purchase(
            total_amount=total,
            **pdata,
        )
        db.add(purchase)
        db.flush()
        for d in details_raw:
            db.add(PurchaseDetail(
                purchase_id=purchase.id,
                item_name=d["item_name"],
                quantity=d["quantity"],
                unit_price=d["unit_price"],
                subtotal=d["quantity"] * d["unit_price"],
            ))

    db.flush()
    print(f"  Compras: {len(purchases_data)} registros creados.")


def seed_sales(db):
    existing = db.query(Sale).count()
    if existing > 0:
        print(f"  Ventas: ya existen {existing}, se omite.")
        return

    today = datetime.now()
    sales_data = [
        {
            "customer_name": "Maria Elena Quispe Mamani",
            "sale_date": today - timedelta(days=15),
            "payment_method": "Efectivo",
            "notes": "Estancia de 3 noches",
            "status": "vigente",
            "details": [
                {"description": "Noche habitacion simple", "quantity": 3, "unit_price": 80.00},
                {"description": "Desayuno continental", "quantity": 3, "unit_price": 25.00},
                {"description": "Agua mineral 600ml", "quantity": 2, "unit_price": 8.00},
            ],
        },
        {
            "customer_name": "Carlos Alberto Mamani Flores",
            "sale_date": today - timedelta(days=12),
            "payment_method": "Transferencia",
            "notes": None,
            "status": "vigente",
            "details": [
                {"description": "Noche habitacion doble", "quantity": 2, "unit_price": 130.00},
                {"description": "Almuerzo del dia", "quantity": 2, "unit_price": 35.00},
            ],
        },
        {
            "customer_name": "Peter John Smith",
            "sale_date": today - timedelta(days=10),
            "payment_method": "Tarjeta",
            "notes": "Turista, pago con tarjeta de debito",
            "status": "vigente",
            "details": [
                {"description": "Noche habitacion doble", "quantity": 5, "unit_price": 130.00},
                {"description": "Desayuno continental", "quantity": 5, "unit_price": 25.00},
                {"description": "Wifi premium", "quantity": 5, "unit_price": 20.00},
                {"description": "Refresco lata", "quantity": 4, "unit_price": 12.00},
            ],
        },
        {
            "customer_name": "Andrea Gonzalez Perez",
            "sale_date": today - timedelta(days=8),
            "payment_method": "QR",
            "notes": "Requiere factura empresarial",
            "status": "vigente",
            "details": [
                {"description": "Noche habitacion simple", "quantity": 2, "unit_price": 80.00},
                {"description": "Lavado de ropa por kilo", "quantity": 3, "unit_price": 15.00},
            ],
        },
        {
            "customer_name": "Jorge Luis Condori Apaza",
            "sale_date": today - timedelta(days=5),
            "payment_method": "Efectivo",
            "notes": None,
            "status": "vigente",
            "details": [
                {"description": "Noche habitacion simple", "quantity": 1, "unit_price": 80.00},
                {"description": "Desayuno continental", "quantity": 1, "unit_price": 25.00},
                {"description": "Parqueo vehiculo", "quantity": 1, "unit_price": 30.00},
            ],
        },
        {
            "customer_name": "Lucia Fernanda Torres Vargas",
            "sale_date": today - timedelta(days=3),
            "payment_method": "Efectivo",
            "notes": "Pago adelantado",
            "status": "vigente",
            "details": [
                {"description": "Noche habitacion doble", "quantity": 3, "unit_price": 130.00},
                {"description": "Desayuno continental", "quantity": 3, "unit_price": 25.00},
            ],
        },
        {
            "customer_name": "Huesped Cancelado",
            "sale_date": today - timedelta(days=18),
            "payment_method": "Efectivo",
            "notes": "Venta anulada por error de registro",
            "status": "anulada",
            "details": [
                {"description": "Noche habitacion simple", "quantity": 1, "unit_price": 80.00},
            ],
        },
    ]

    for sdata in sales_data:
        details_raw = sdata.pop("details")
        total = sum(d["quantity"] * d["unit_price"] for d in details_raw)
        sale = Sale(
            total_amount=total,
            **sdata,
        )
        db.add(sale)
        db.flush()
        for d in details_raw:
            db.add(SaleDetail(
                sale_id=sale.id,
                product_service_id=None,
                description=d["description"],
                quantity=d["quantity"],
                unit_price=d["unit_price"],
                subtotal=d["quantity"] * d["unit_price"],
            ))

    db.flush()
    print(f"  Ventas: {len(sales_data)} registros creados.")


def run():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        print("Iniciando seed de datos de demostracion...")
        seed_guests(db)
        seed_services(db)
        seed_purchases(db)
        seed_sales(db)
        db.commit()
        print("Seed completado correctamente.")
    except Exception as exc:
        db.rollback()
        print(f"Error durante el seed: {exc}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    run()
