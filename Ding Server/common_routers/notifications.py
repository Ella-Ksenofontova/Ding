from fastapi import APIRouter, Depends, HTTPException, Response
from sqlmodel import Session, String, cast, select
from db_connect import get_session
import db_models

notifications_router = APIRouter(tags=["notifications"])


@notifications_router.get("/notifications")
def get_notifications(session: Session = Depends(get_session)) -> list[db_models.Notification]:
    notifications = list(session.exec(select(db_models.Notification)).all())
    return notifications

@notifications_router.get("/notifications/{id:int}")
def get_notification_by_id(id: int, session: Session = Depends(get_session)) -> db_models.Notification:
    notification = session.exec(select(db_models.Notification).where(db_models.Notification.id == id)).first()
    if not notification:
        raise HTTPException(404, "Уведомления с таким ID не существует")
    return notification

@notifications_router.get("/user-notifications/{user_id}")
def get_user_notifications(user_id: int, session: Session = Depends(get_session)):
    notifications = list(session.exec(select(db_models.Notification).where(db_models.Notification.userID == user_id)).all())
    return notifications

@notifications_router.get("/search-notifications/{text_or_id}")
def search_notifications_by_text_or_id(text_or_id: str, session: Session = Depends(get_session)):
    notifications = list(session.exec(select(db_models.Notification).where(db_models.Notification.text.startswith(text_or_id))).all())
    if text_or_id.isdigit():
        notifications_with_id = list(session.exec(select(db_models.Notification).where(cast(db_models.Notification.id, String).like(f"{text_or_id}%"))).all())
        notifications += notifications_with_id

    return notifications

@notifications_router.post("/notifications")
def add_notification(notification: db_models.Notification, session: Session = Depends(get_session)):
    session.merge(notification)
    session.commit()
    return Response(content="Данные успешно сохранены")

@notifications_router.delete("/notifications/{id}")
def delete_notification(id: int, session: Session = Depends(get_session)):
    notification = session.exec(select(db_models.Notification).where(db_models.Notification.id == id)).first()
    if not notification:
        raise HTTPException(404, "Такого уведомления не существует")
    session.delete(notification)

    session.commit()
    return Response("Уведомление успешно удалено")