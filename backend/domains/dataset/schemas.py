from pydantic import BaseModel
from typing import Optional
from uuid import UUID

class StoreResponse(BaseModel):
    id: UUID
    store_nbr: int
    city: str
    state: str
    type: str
    cluster: int

    class Config:
        from_attributes = True
