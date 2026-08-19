from typing import List
from sqlalchemy.orm import selectinload
from fastapi import APIRouter, Depends, HTTPException, Response
from sqlmodel import Session, col, select
from db_connect import get_session
import db_models, api_models
from links_models import UserGroupLink

groups_router = APIRouter(tags=["groups"])

@groups_router.get("/groups", response_model=List[api_models.GroupRead])
def get_groups(session: Session = Depends(get_session)) -> list[db_models.Group]:
    groups = list(session.exec(select(db_models.Group)).all())

    return groups

@groups_router.get("/groups/{id:int}", response_model=api_models.GroupRead)
def get_group_by_id(id: int, session: Session = Depends(get_session)) -> db_models.Group:
    group = session.exec(select(db_models.Group).where(db_models.Group.id == id).options(selectinload(getattr(db_models.Group, "members")))).first()
    if not group:
        raise HTTPException(404, "Группы с таким ID не существует")
    return group

@groups_router.get("/search-groups/{name_or_id}")
def get_groups_by_query(name_or_id: str, session: Session = Depends(get_session)) -> list[db_models.Group]:
    groups = list(session.exec(select(db_models.Group).where(db_models.Group.name.startswith(name_or_id))).all())
    if name_or_id.isdigit():
        groups_with_id = list(session.exec(select(db_models.Group).where(str(db_models.Group.id).startswith(name_or_id))).all())
        groups += groups_with_id
    return groups

@groups_router.get("/user-groups/{user_id}")
def get_user_groups(user_id: int, session: Session = Depends(get_session)):
    groups = list(session.exec(select(db_models.Group).where(UserGroupLink.userID == user_id, UserGroupLink.groupID == db_models.Group.id).options(selectinload(getattr(db_models.Group, "members")))).all())
    return groups

@groups_router.post("/groups")
def add_group(group_data: api_models.GroupPost, session: Session = Depends(get_session)):
    if group_data.id:
        db_group = session.get(db_models.Group, group_data.id)
        if db_group:
            db_group.name = group_data.name
            db_group.topic = group_data.topic
            db_group.avatar = group_data.avatar
        else:
            db_group = db_models.Group(**group_data.model_dump(exclude={"members"}))
    else:
        db_group = db_models.Group(**group_data.model_dump(exclude={"members"}))

    user_ids = [u.id for u in group_data.members]
    db_users = list(session.exec(select(db_models.User).where(col(db_models.User.id).in_(user_ids))).all())
    db_group.members = db_users
    admin_ids = [u.id for u in group_data.admins]
    db_admins = list(session.exec(select(db_models.User).where(col(db_models.User.id).in_(admin_ids))).all())
    db_group.admins = db_admins

    session.add(db_group)
    
    session.commit()
    return Response(content="Данные успешно сохранены")

@groups_router.delete("/groups/{id}")
def delete_group(id: int, session: Session = Depends(get_session)):
    group = session.exec(select(db_models.Group).where(db_models.Group.id == id)).first()
    if not group:
        raise HTTPException(404, "Такого сообщения не существует")
    session.delete(group)

    session.commit()
    return Response("Группа успешно удалена")