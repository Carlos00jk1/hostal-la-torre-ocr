from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: str


class Token(BaseModel):
    access_token: str
    token_type: str


class RoleRead(BaseModel):
    id: int
    name: str

    model_config = {"from_attributes": True}


class UserRead(BaseModel):
    id: int
    username: str
    is_active: bool
    role: RoleRead

    model_config = {"from_attributes": True}


class UserCreate(BaseModel):
    username: str
    password: str
    role_id: int
    is_active: bool = True


class UserUpdate(BaseModel):
    username: str | None = None
    password: str | None = None
    role_id: int | None = None
    is_active: bool | None = None


class GuestBase(BaseModel):
    full_name: str
    document_number: str
    document_type: str
    phone: str | None = None
    email: str | None = None
    nationality: str | None = None
    address: str | None = None
    birth_date: datetime | None = None
    notes: str | None = None
    is_active: bool = True


class GuestCreate(GuestBase):
    pass


class GuestUpdate(BaseModel):
    full_name: str | None = None
    document_number: str | None = None
    document_type: str | None = None
    phone: str | None = None
    email: str | None = None
    nationality: str | None = None
    address: str | None = None
    birth_date: datetime | None = None
    notes: str | None = None
    is_active: bool | None = None


class GuestRead(GuestBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class OCRExtractResponse(BaseModel):
    filename: str
    extracted_text: str
    detected_full_name: str | None = None
    detected_document_number: str | None = None


class ProductServiceBase(BaseModel):
    name: str
    description: str | None = None
    category: str
    price: Decimal
    stock: int | None = None
    is_active: bool = True


class ProductServiceCreate(ProductServiceBase):
    pass


class ProductServiceUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    category: str | None = None
    price: Decimal | None = None
    stock: int | None = None
    is_active: bool | None = None


class ProductServiceRead(ProductServiceBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class PurchaseDetailBase(BaseModel):
    item_name: str
    quantity: Decimal
    unit_price: Decimal


class PurchaseDetailCreate(PurchaseDetailBase):
    pass


class PurchaseDetailRead(PurchaseDetailBase):
    id: int
    subtotal: Decimal

    model_config = {"from_attributes": True}


class PurchaseBase(BaseModel):
    supplier_name: str
    purchase_date: datetime
    notes: str | None = None


class PurchaseCreate(PurchaseBase):
    details: list[PurchaseDetailCreate]


class PurchaseUpdate(BaseModel):
    supplier_name: str | None = None
    purchase_date: datetime | None = None
    notes: str | None = None
    is_cancelled: bool | None = None
    details: list[PurchaseDetailCreate] | None = None


class PurchaseRead(PurchaseBase):
    id: int
    total_amount: Decimal
    is_cancelled: bool
    created_at: datetime
    updated_at: datetime
    details: list[PurchaseDetailRead]

    model_config = {"from_attributes": True}


class SaleDetailBase(BaseModel):
    product_service_id: int | None = None
    description: str | None = None
    quantity: Decimal
    unit_price: Decimal


class SaleDetailCreate(SaleDetailBase):
    pass


class SaleDetailRead(SaleDetailBase):
    id: int
    subtotal: Decimal

    model_config = {"from_attributes": True}


class SaleBase(BaseModel):
    customer_name: str
    sale_date: datetime
    payment_method: str
    notes: str | None = None


class SaleCreate(SaleBase):
    details: list[SaleDetailCreate]


class SaleUpdate(BaseModel):
    customer_name: str | None = None
    sale_date: datetime | None = None
    payment_method: str | None = None
    notes: str | None = None
    status: str | None = None
    details: list[SaleDetailCreate] | None = None


class SaleRead(SaleBase):
    id: int
    total_amount: Decimal
    status: str
    created_at: datetime
    updated_at: datetime
    details: list[SaleDetailRead]

    model_config = {"from_attributes": True}
