# PedoPal/models.py
from pydantic import BaseModel, EmailStr
from typing import Optional

class User(BaseModel):
    email: EmailStr
    username: str
    password: str
    height: float
    weight: float
    allergies: Optional[str] = None
    currentDietPlan: Optional[str] = None
    region: Optional[str] = None
    bmi: Optional[float] = None
    age: Optional[int] = None

class UserInDB(User):
    hashed_password: str

class loginUser(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None