from datetime import datetime
from sqlalchemy.orm import selectinload
from fastapi import APIRouter, Depends, HTTPException, Response
from sqlmodel import Session, String, and_, cast, col, or_, select
from db_connect import get_session
import db_models, api_models
from links_models import FriendsLink, UserGroupLink, FollowLink

users_router = APIRouter(tags=["users"])

@users_router.get("/users")
def get_users(session: Session = Depends(get_session)) -> list[db_models.User]:
    "Finds all users stored in database and returns them."
    db_users = list(session.exec(select(db_models.User)).all())
    users = []

    for db_user in db_users:
        user: api_models.UserGet = db_user # type: ignore

        if db_user.birthday:
            birthday = db_user.birthday.isoformat()
            user.birthday = birthday

        last_seen = db_user.lastSeen.isoformat()
        user.lastSeen = last_seen

        users.append(user)

    return users

def get_user_with_given_model(id: int, session: Session = Depends(get_session), model: type[api_models.UserGet] | type[api_models.UserGetAdmin] = api_models.UserGet):
    "Tries to find user with given id. If found, returns result according to given model (see docs of models), otherwise raises HTTPException with status code 404."
    db_user = session.exec(select(db_models.User).where(db_models.User.id == id).options(selectinload(getattr(db_models.User, "friends"), getattr(db_models.User, "groups")))).first()
    
    if not db_user:
        raise HTTPException(404, "Пользователя с таким ID не существует")
    
    user = model.model_construct(**db_user.model_dump(exclude={"birthday", "lastSeen", "groups", "friends", "followers", "followed"}))
    
    if db_user.birthday:
        birthday = db_user.birthday.isoformat()
        user.birthday = birthday
    
    last_seen = db_user.lastSeen.isoformat()
    user.lastSeen = last_seen
    
    friends = list(session.exec(select(db_models.User).where(or_(and_(FriendsLink.firstFriendID == db_user.id, FriendsLink.secondFriendID == db_models.User.id), and_(FriendsLink.firstFriendID == db_models.User.id, FriendsLink.secondFriendID == db_user.id)))))
    user.friends = [api_models.UserAPI(id=user.id, username=user.username) for user in friends] #  type: ignore
    
    groups = list(session.exec(select(db_models.Group).where(UserGroupLink.userID == db_user.id, UserGroupLink.groupID == db_models.Group.id)))
    user.groups = [api_models.GroupAPI(id=group.id, name=group.name, avatar=group.avatar) for group in groups] #  type: ignore
    
    followers = list(session.exec(select(db_models.User).where(FollowLink.user_id == user.id, FollowLink.follower_id == db_models.User.id)).all())
    user.followers = [api_models.UserAPI(id=user.id, username=user.username, avatar=user.avatar) for user in followers] #  type: ignore
    
    followed = list(session.exec(select(db_models.User).where(FollowLink.follower_id == user.id, FollowLink.user_id == db_models.User.id)).all())
    user.followed = [api_models.UserAPI(id=user.id, username=user.username, avatar=user.avatar) for user in followed] #  type: ignore
    
    return user

@users_router.get("/users/{id:int}", response_model=api_models.UserGet)
def get_user_by_id(id: int, session: Session = Depends(get_session)) -> api_models.UserGet:
    "Tries to find user with given id. Returns it if found, otherwise raises HTTPException with 404 status code."
    return get_user_with_given_model(id, session)
    

@users_router.get("/users-admin/{id:int}", response_model=api_models.UserGetAdmin)
def get_user_by_id_admin(id: int, session: Session = Depends(get_session)):
    "Tries to find user with given id. Returns it if found, otherwise raises HTTPException with 404 status code."
    return get_user_with_given_model(id, session, api_models.UserGetAdmin)


@users_router.get("/search-users/{name_or_id}")
def get_users_by_query(name_or_id: str, session: Session = Depends(get_session)) -> list[db_models.User]:
    "Finds userswhose name or id start with query string."
    users = list(session.exec(select(db_models.User).where(db_models.User.username.startswith(name_or_id))).all())
    if name_or_id.isdigit():    
        users_with_id = list(session.exec(select(db_models.User).where(cast(db_models.User.id, String).like(f"{name_or_id}%"))).all())
        users += users_with_id
    return users    

@users_router.get("/user-friends/{user_id}")
def get_user_friends(user_id: int, session: Session = Depends(get_session)):
    friends = list(session.exec(select(db_models.User).where(FriendsLink.firstFriendID == user_id, FriendsLink.secondFriendID == db_models.User.id)).all())
    return friends

@users_router.post("/users")
def add_user(user_data: api_models.UserPost, session: Session = Depends(get_session)):
    "Adds user to the database."
    if user_data.id:
        db_user = session.get(db_models.User, user_data.id)
        if db_user:
            db_user.username = user_data.username
            db_user.isOnline = user_data.isOnline
            db_user.lastSeen = datetime.fromisoformat(user_data.lastSeen)
            db_user.status = user_data.status
            if user_data.birthday:
                db_user.birthday = datetime.fromisoformat(user_data.birthday)
            db_user.education = user_data.education
            db_user.hobbies = user_data.hobbies
            db_user.maritalStatus = user_data.maritalStatus
            db_user.userHash = user_data.userHash
            db_user.password = user_data.password
            db_user.email = user_data.email
            db_user.phone = user_data.phone
            db_user.avatar = user_data.avatar
        else:
            db_user = db_models.User(**user_data.model_dump(exclude={"friends", "groups", "followers", "followed"}))
    else:
        db_user = db_models.User(**user_data.model_dump(exclude={"friends", "groups", "followers", "followed"}))

    db_friends = list(session.exec(select(db_models.User).where(col(db_models.User.id).in_(user_data.friends))).all())
    db_user.friends = db_friends

    db_groups = list(session.exec(select(db_models.Group).where(col(db_models.Group.id).in_(user_data.groups))).all())
    db_user.groups = db_groups

    db_followers = list(session.exec(select(db_models.User).where(col(db_models.User.id).in_(user_data.followers))).all())
    db_user.followers = db_followers

    db_followed = list(session.exec(select(db_models.User).where(col(db_models.User.id).in_(user_data.followed))).all())
    db_user.followed = db_followed

    session.add(db_user)
    
    session.commit()
    return Response(content="Данные успешно сохранены")

@users_router.delete("/users/{id}")
def delete_user(id: int, session: Session = Depends(get_session)):
    "Deletes user from the database."
    user = session.exec(select(db_models.User).where(db_models.User.id == id)).first()
    if not user:
        raise HTTPException(404, "Такого пользователя не существует")
    session.delete(user)

    session.commit()
    return Response("Пользователь успешно удалён")