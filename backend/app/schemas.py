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
