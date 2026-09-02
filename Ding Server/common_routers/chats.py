from typing import List

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlmodel import Session, String, cast, col, select
from sqlalchemy.orm import selectinload
from db_connect import get_session
import db_models
import api_models
from links_models import UserChatLink

chats_router = APIRouter(tags=["chats"])

@chats_router.get("/chats", response_model=List[api_models.ChatRead])
def get_chats(session: Session = Depends(get_session)) -> list[db_models.Chat]:
    "Returns all chats stored in the database."
    chats = list(session.exec(select(db_models.Chat)).all())
    return chats

@chats_router.get("/chats/{id:int}", response_model=api_models.ChatRead)
def get_chat_by_id(id: int, session: Session = Depends(get_session)) -> db_models.Chat:
    "Gets chat with given id. If the chat is not found, raises HTTPException with 404 status code"
    chat = session.exec(select(db_models.Chat).where(db_models.Chat.id == id)).first()
    if not chat:
        raise HTTPException(404, "Чата с таким ID не существует")
    return chat

@chats_router.get("/search-chats/{name_or_id}", response_model=List[api_models.ChatRead])
def get_chats_by_query(name_or_id: str, session: Session = Depends(get_session)) -> list[db_models.Chat]:
    "Gets chats that have a name or id starting with query string."
    chats = list(session.exec(select(db_models.Chat).where(db_models.Chat.name.startswith(name_or_id)).options(selectinload(getattr(db_models.Chat, "participants")))).all())
    if name_or_id.isdigit():
        chats_with_id = list(session.exec(select(db_models.Chat).where(cast(db_models.Chat.id, String).like(f"{name_or_id}%")).options(selectinload(getattr(db_models.Chat, "participants")))).all())
        chats += chats_with_id

    return chats

@chats_router.get("/user-chats/{user_id}", response_model=List[api_models.ChatRead])
def get_user_chats(user_id: int, session: Session = Depends(get_session)) -> list[db_models.Chat]:
    "Finds chat of given user."
    chats = list(session.exec(select(db_models.Chat).where(UserChatLink.chatID == db_models.Chat.id, UserChatLink.userID == user_id)).all())
    return chats

@chats_router.get("/chat-messages/{chat_id}", response_model=List[db_models.Message])
def get_chat_messages(chat_id: int, session: Session = Depends(get_session)):
    "Finds messages of given chat."
    messages = list(session.exec(select(db_models.Message).where(db_models.Message.chatID == chat_id)).all())
    return messages

@chats_router.post("/chats")
def add_chat(chat_data: api_models.ChatPost, session: Session = Depends(get_session)):
    "Adds chat to the database."
    if chat_data.id:
        db_chat = session.get(db_models.Chat, chat_data.id)
        if db_chat:
            db_chat.name = chat_data.name
            db_chat.is_name_auto_generated = chat_data.is_name_auto_generated
            db_chat.avatar = chat_data.avatar
        else:
            db_chat = db_models.Chat(**chat_data.model_dump(exclude={"participants", "admins"}))
    else:
        db_chat = db_models.Chat(**chat_data.model_dump(exclude={"participants", "admins"}))

    user_ids = [u.id for u in chat_data.participants]
    db_users = list(session.exec(select(db_models.User).where(col(db_models.User.id).in_(user_ids))).all())
    db_chat.participants = db_users
    admin_ids = [u.id for u in chat_data.admins]
    db_admins = list(session.exec(select(db_models.User).where(col(db_models.User.id).in_(admin_ids))).all())
    db_chat.admins = db_admins

    session.merge(db_chat)
    session.commit()
    return Response(content="Данные успешно сохранены")

@chats_router.delete("/chats/{id}")
def delete_chat(id: int, session: Session = Depends(get_session)):
    "Delets chat from the database."
    chat = session.exec(select(db_models.Chat).where(db_models.Chat.id == id)).first()
    if not chat:
        raise HTTPException(404, "Такого чата не существует")
    session.delete(chat)

    session.commit()
    return Response("Чат успешно удалён")