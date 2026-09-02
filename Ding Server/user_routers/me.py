from typing import Annotated
from fastapi import Depends, APIRouter, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import Session, desc, func
from sqlalchemy.orm import selectinload
from .auth import verify_access_token
from db_connect import get_session
import db_models, api_models
from links_models import UserChatLink
from sqlmodel import select

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

info_about_me_router = APIRouter(tags=["users"])

@info_about_me_router.get("/info-about-me")
async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)], session: Session = Depends(get_session)):
    "Finds the current user based on the provided access token and returns the user object from the database."
    payload = verify_access_token(token)
    user_id: str = payload.get("sub") # type: ignore
    if user_id is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Авторизуйтесь, чтобы выполнить операцию")

    db_user = session.exec(select(db_models.User).where(db_models.User.id == user_id)).first()
    if db_user is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Пользователя с таким ID не существует")
    return db_user

@info_about_me_router.get("/my-chat-with/{user_id}", response_model=api_models.ChatRead)
async def get_my_chat_with_user_id(user_id: int, token: Annotated[str, Depends(oauth2_scheme)], session: Session = Depends(get_session)):
    "Finds or creates a chat between the current user and another user specified by user_id. Returns the chat object from database."
    payload = verify_access_token(token)
    my_id: str = int(payload.get("sub")) # type: ignore
    if my_id is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Авторизуйтесь, чтобы выполнить операцию")
    if my_id == user_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Чат с самим собой недоступен")
    
    me = session.exec(
        select(db_models.User).where(db_models.User.id == my_id)
    ).one_or_none()
    
    second_user = session.exec(select(db_models.User).where(db_models.User.id == user_id)).first()
    
    if second_user is None or me is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Пользователя с таким ID не существует")
    
    chat_ids = (
        select(UserChatLink.chatID)
        .where(getattr(UserChatLink, "userID").in_([my_id, user_id]))
        .group_by(getattr(UserChatLink, "chatID"))
        .having(func.count(func.distinct(UserChatLink.userID)) == 2)
        .subquery()
    )

    destined_chat = session.exec(
        select(db_models.Chat)
        .where(
            getattr(db_models.Chat, "id").in_(select(chat_ids.c.chatID)),
            getattr(db_models.Chat, "is_name_auto_generated").is_(True),
        )
        .options(selectinload(getattr(db_models.Chat, "participants")))
    ).first()
    
    if destined_chat is None:
        chat_to_write = db_models.Chat(participants=[me, second_user], is_name_auto_generated=True, name="", avatar=None)
        session.add(chat_to_write)
        session.commit()
        
        destined_chat = session.exec(select(db_models.Chat).where(UserChatLink.chatID == db_models.Chat.id, UserChatLink.userID == my_id).order_by(desc(db_models.Chat.id)).options(selectinload(getattr(db_models.Chat, "participants")))).first()
        
    return destined_chat
        