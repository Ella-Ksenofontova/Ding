from typing import List
from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlmodel import Session, String, cast, select, col, desc, and_
from sqlalchemy.orm import selectinload
from db_connect import get_session
import db_models
import api_models
from links_models import UserPostLink

posts_router = APIRouter(tags=["posts"])

@posts_router.get("/posts", response_model=List[api_models.PostRead])
def get_posts(session: Session = Depends(get_session)) -> list[db_models.Post]:
    "Returns all posts stored in the database."
    posts = list(session.exec(select(db_models.Post).options(selectinload(getattr(db_models.Post, "usersLiked")))).all())
    response_posts = []

    for post in posts:
        response_post = api_models.PostRead.model_construct(**post.model_dump())
        users_liked = list(session.exec(select(db_models.User).where(UserPostLink.userID == db_models.User.id, UserPostLink.postID == post.id)))
        response_post.usersLiked = [api_models.UserAPI(id=user.id, username=user.username) for user in users_liked] # type: ignore
        response_post.userOrGroupId = post.groupID if post.groupID else (post.userID if post.userID else -1)
        response_posts.append(response_post)
    return response_posts


@posts_router.get("/posts/{id:int}", response_model=api_models.PostRead)
def get_post_by_id(id: int, session: Session = Depends(get_session)) -> api_models.PostRead:
    "Tries to find post with given id and returns it if found, otherwise raises HTTPError with 404 status code."
    post = session.exec(select(db_models.Post).where(db_models.Post.id == id)).first()
    if not post:
        raise HTTPException(404, "Поста с таким ID не существует")
    response_post = api_models.PostRead.model_construct(**post.model_dump())
    users_liked = list(session.exec(select(db_models.User).where(UserPostLink.userID == db_models.User.id, UserPostLink.postID == id)))
    response_post.usersLiked = [api_models.UserAPI(id=user.id, username=user.username) for user in users_liked] # type: ignore
    response_post.userOrGroupId = post.groupID if post.groupID else (post.userID if post.userID else -1)
    return response_post

@posts_router.get("/latest-posts/{start}", response_model=List[api_models.PostRead])
def get_latest_posts(start: int,session: Session = Depends(get_session)):
    "Returns 5 posts, started from nth latest post, where n is passed as function parameter."
    latest_posts = list(session.exec(select(db_models.Post).order_by(desc(db_models.Post.date))).all())
    response_posts = []
    
    for post in latest_posts:
        response_post = api_models.PostRead.model_construct(**post.model_dump())
        users_liked = list(session.exec(select(db_models.User).where(UserPostLink.userID == db_models.User.id, UserPostLink.postID == post.id)))
        response_post.usersLiked = [api_models.UserAPI.model_construct(**user.model_dump()) for user in users_liked] # type: ignore
        response_post.userOrGroupId = post.groupID if post.groupID else (post.userID if post.userID else -1)
        response_posts.append(response_post)
    if len(response_posts) > start - 1:
        return response_posts[start - 1: start + 4]
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Больше постов нет!")

@posts_router.get("/user-posts/{user_id}", response_model=List[api_models.PostRead])
def get_user_posts(user_id: int, session: Session = Depends(get_session)) -> List[api_models.PostRead]:
    "Finds posts created by user with given id."
    db_posts = session.exec(select(db_models.Post).where(db_models.Post.userID == user_id).order_by(desc(db_models.Post.date)))
    response_posts = []
        
    for post in db_posts:
        response_post = api_models.PostRead.model_construct(**post.model_dump())
        users_liked = list(session.exec(select(db_models.User).where(UserPostLink.userID == db_models.User.id, UserPostLink.postID == post.id)))
        response_post.usersLiked = [api_models.UserAPI(id=user.id, username=user.username) for user in users_liked] # type: ignore
        response_post.userOrGroupId = user_id
        response_posts.append(response_post)
    return response_posts

@posts_router.get("/group-posts/{group_id}", response_model=List[api_models.PostRead])
def get_group_post(group_id: int, session: Session = Depends(get_session)):
    "Finds posts created by group with given id."
    db_posts = session.exec(select(db_models.Post).where(db_models.Post.groupID == group_id).order_by(desc(db_models.Post.date)))
    response_posts = []
    for post in db_posts:
        response_post = api_models.PostRead.model_construct(**post.model_dump())
        users_liked = list(session.exec(select(db_models.User).where(UserPostLink.userID == db_models.User.id, UserPostLink.postID == post.id)))
        response_post.usersLiked = [api_models.UserAPI(id=user.id, username=user.username) for user in users_liked] # type: ignore
        response_post.userOrGroupId = group_id
        response_posts.append(response_post)
    return response_posts

@posts_router.get("/search-posts/{text_or_id}", response_model=List[api_models.PostRead])
def search_posts_by_text_or_id(text_or_id: str, session: Session = Depends(get_session)):
    "Finds posts that have text or id starting with query string."
    posts = list(session.exec(select(db_models.Post).where(db_models.Post.text != None, db_models.Post.text.startswith(text_or_id))).all()) # type: ignore
    if text_or_id.isdigit():
        posts_with_id = list(session.exec(select(db_models.Post).where(cast(db_models.Post.id, String).like(f"{text_or_id}%"))).all())
        posts += posts_with_id
    return posts

@posts_router.post("/posts")
def add_post(post_data: api_models.PostPost, session: Session = Depends(get_session)):
    "Adds post to the database."
    if post_data.id:
        db_post = session.get(db_models.Post, post_data.id)
        if db_post:
            db_post.date = post_data.date
            db_post.isGroup = post_data.isGroup
            db_post.media = post_data.media
            db_post.text = post_data.text
            if db_post.isGroup:
                db_post.groupID = post_data.userOrGroupId
            else:
                db_post.userID = post_data.userOrGroupId
        else:
            db_post = db_models.Post(**post_data.model_dump(exclude={"usersLiked", "userOrGroupId"}))
    else:
        db_post = db_models.Post(**post_data.model_dump(exclude={"usersLiked", "userOrGroupId"}))

    if db_post.isGroup:
        db_post.groupID = post_data.userOrGroupId
    else:
        db_post.userID = post_data.userOrGroupId

    user_ids = [user.id for user in post_data.usersLiked]
    db_users = list(session.exec(select(db_models.User).where(col(db_models.User.id).in_(user_ids))).all())
    db_post.usersLiked = db_users

    session.add(db_post)
    session.commit()
    return Response(content="Данные успешно сохранены")

@posts_router.delete("/posts/{id}")
def delete_post(id: int, session: Session = Depends(get_session)):
    "Removes post from the database."
    post = session.exec(select(db_models.Post).where(db_models.Post.id == id)).first()
    if not post:
        raise HTTPException(404, "Такого поста не существует")
    session.delete(post)

    session.commit()
    return Response("Пост успешно удалён")

