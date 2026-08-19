from fastapi import APIRouter, Depends, HTTPException, Response
import db_models
from sqlmodel import Session, String, cast, select
from db_connect import get_session

games_router = APIRouter(tags=["games"])

@games_router.get("/games")
async def get_games(session: Session = Depends(get_session)):
    statement = select(db_models.Game)
    results = session.exec(statement)
    games = results.all()
    return games

@games_router.get("/games/{game_id}")
async def get_game(game_id: int, session: Session = Depends(get_session)):
    statement = select(db_models.Game).where(db_models.Game.id == game_id)
    result = session.exec(statement).first()
    if result is None:
        raise HTTPException(status_code=404, detail="Игра не найдена")
    return result

@games_router.get("/search-games/{name_or_id}")
async def search_games_by_name_or_id(name_or_id: str, session: Session = Depends(get_session)):
    games = list(session.exec(select(db_models.Game).where(db_models.Game.name.startswith(name_or_id))).all())
    if name_or_id.isdigit():
        games_with_id = list(session.exec(select(db_models.Game).where(cast(db_models.Game.id, String).like(f"{name_or_id}%"))).all())
        games += games_with_id
    return games

@games_router.post("/games")
async def create_game(game: db_models.Game, session: Session = Depends(get_session)):
    session.merge(game)
    session.commit()

@games_router.delete("/games/{game_id}")
async def delete_game(game_id: int, session: Session = Depends(get_session)):
    statement = select(db_models.Game).where(db_models.Game.id == game_id)
    result = session.exec(statement).first()
    if result is None:
        raise HTTPException(status_code=404, detail="Игра не найдена")
    session.delete(result)
    session.commit()
    return Response("Игра успешно удалена")