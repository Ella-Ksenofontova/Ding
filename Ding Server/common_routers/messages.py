from fastapi import APIRouter, Depends, HTTPException, Response
from sqlmodel import Session, String, cast, select
from db_connect import get_session
import db_models

messages_router = APIRouter(tags=["messages"])

@messages_router.get("/messages")
def get_messages(session: Session = Depends(get_session)) -> list[db_models.Message]:
    messages = list(session.exec(select(db_models.Message)).all())
    return messages

@messages_router.get("/messages/{id:int}")
def get_message_by_id(id: int, session: Session = Depends(get_session)) -> db_models.Message:
    message = session.exec(select(db_models.Message).where(db_models.Message.id == id)).first()
    if not message:
        raise HTTPException(404, "Сообщения с таким ID не существует")
    return message

@messages_router.get("/search-messages/{text_or_id:str}")
def search_messages_by_text_or_id(text_or_id: str, session: Session = Depends(get_session)):
    messages = list(session.exec(select(db_models.Message).where(db_models.Message.text != None, db_models.Message.text.startswith(text_or_id))).all()) # type: ignore
    if text_or_id.isdigit():
        messages_with_id = list(session.exec(select(db_models.Message).where(cast(db_models.Message.id, String).like(f"{text_or_id}%"))).all())
        messages += messages_with_id

        messages_with_chat_id = list(session.exec(select(db_models.Message).where(cast(db_models.Message.chatID, String).like(f"{text_or_id}%"))).all())
        messages += messages_with_chat_id
    return messages

@messages_router.post("/messages")
def add_message(message: db_models.Message, session: Session = Depends(get_session)):
    session.merge(message)
    session.commit()
    return Response(content="Данные успешно сохранены")

@messages_router.delete("/messages/{id}")
def delete_message(id: int, session: Session = Depends(get_session)):
    message = session.exec(select(db_models.Message).where(db_models.Message.id == id)).first()
    if not message:
        raise HTTPException(404, "Такого сообщения не существует")
    session.delete(message)

    session.commit()
    return Response("Сообщение успешно удалено")