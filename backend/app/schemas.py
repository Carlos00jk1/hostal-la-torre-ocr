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
