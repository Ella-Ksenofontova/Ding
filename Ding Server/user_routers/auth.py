from fastapi import APIRouter, Form, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from typing import Annotated, Literal
from datetime import datetime, timedelta, timezone
import jwt
import db_models
from db_connect import get_session
from sqlmodel import Session, select, or_

SECRET_KEY = "41ad3d4343bb8e5926b1c8effd828f34b17210cab61896466434e28c30d4eb75"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_SECONDS_IF_REMEMBER_ME = 34560000
ACCESS_TOKEN_EXPIRE_MINUTES = 120

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

auth_router = APIRouter(tags=["auth", "users"])

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    data_to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    data_to_encode.update({"exp": expire}) 
    encoded_jwt = jwt.encode(data_to_encode, SECRET_KEY, algorithm=ALGORITHM)  
    return encoded_jwt

def verify_access_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.PyJWTError as e:
        print(token)
        print(f"JWT Error: {e}", flush=True)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, 
        detail="Не удалось проверить учётные данные",
        headers={"WWW-Authenticate": "Bearer"})

class FormData(OAuth2PasswordRequestForm):
    def __init__(self, username: Annotated[str, Form()], password: Annotated[str, Form(json_schema_extra={"format": "password"})],          remember_me: Annotated[Literal["yes"] | Literal["no"], Form()]):
        super().__init__(username=username, password=password)
        self.remember_me = remember_me

@auth_router.post("/login")
async def login(data:  Annotated[FormData, Depends()], session: Session = Depends(get_session)):
    if data.username is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Введите email или пароль")

    user = session.exec(select(db_models.User).where(or_(db_models.User.email == data.username, db_models.User.phone == data.username))).first()

    if not user or data.password != user.password:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Учётные данные указаны неверно")

    access_token = create_access_token(data={"sub": str(user.id)}, expires_delta=timedelta(seconds = ACCESS_TOKEN_EXPIRE_SECONDS_IF_REMEMBER_ME) if data.remember_me == "yes" else timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    return {"access_token": access_token, "token_type": "bearer"}