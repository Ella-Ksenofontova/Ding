from typing import List

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlmodel import Session, String, cast, select
from db_connect import get_session
import db_models
import api_models

comments_router = APIRouter(tags=["comments"])

@comments_router.get("/comments")
def get_comments(session: Session = Depends(get_session)) -> list[db_models.Comment]:
    comments = list(session.exec(select(db_models.Comment)).all())
    return comments

@comments_router.get("/comments/{id:int}")
def get_comment_by_id(id: int, session: Session = Depends(get_session)) -> db_models.Comment:
    comment = session.exec(select(db_models.Comment).where(db_models.Comment.id == id)).first()
    if not comment:
        raise HTTPException(404, "Комментария с таким ID не существует")
    return comment

@comments_router.get("/post-comments/{post_id:int}", response_model=List[api_models.CommentGet])
def get_post_comments(post_id: int, session: Session = Depends(get_session)): 
    db_comments = list(session.exec(select(db_models.Comment).where(db_models.Comment.post_id == post_id)).all())
    response_comments = []
    for db_comment in db_comments:
        response_comment = api_models.CommentGet.model_construct(**db_comment.model_dump())
        user = session.exec(select(db_models.User).where(db_comment.user_id == db_models.User.id)).first()
        if user:
            response_comment.user = api_models.UserAPI.model_construct(**user.model_dump())
            response_comments.append(response_comment)
        else:
            raise HTTPException(status_code=400, detail="Пользователя с таким ID не существует!")
            
    return response_comments

@comments_router.get("/search-comments/{text_or_id:str}", response_model=List[api_models.CommentGet])
def get_comments_by_text_or_id(text_or_id: str, session: Session = Depends(get_session)):
    comments = list(session.exec(select(db_models.Comment).where(db_models.Comment.text != None, db_models.Comment.text.startswith(text_or_id))).all()) # type: ignore
    if text_or_id.isdigit():
        comments_with_id = list(session.exec(select(db_models.Comment).where(cast(db_models.Comment.id, String).like(f"{text_or_id}%"))).all())
        comments += comments_with_id

    return comments

@comments_router.post("/comments")
def add_comment(comment: db_models.Comment, session: Session = Depends(get_session)):
    session.merge(comment)
    session.commit()
    return Response(content="Данные успешно сохранены")

@comments_router.delete("/comments/{id}")
def delete_comment(id: int, session: Session = Depends(get_session)):
    comment = session.exec(select(db_models.Comment).where(db_models.Comment.id == id)).first()
    if not comment:
        raise HTTPException(404, "Такого комментария не существует")
    session.delete(comment)

    session.commit()
    return Response("Комментарий успешно удалён")