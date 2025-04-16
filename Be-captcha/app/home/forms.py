from pydantic import BaseModel, Field
from typing import Optional

class UserForm(BaseModel):
    id: int
    username: str
    email: str
    is_active: bool

    # class Config:
    #     orm_mode = True

class CaptchaForm(BaseModel):
    captcha: str
    captcha_id: int
    tab_id: int
    captcha_text: Optional[str] = Field(None)
    status: Optional[str] = Field('pending') 
