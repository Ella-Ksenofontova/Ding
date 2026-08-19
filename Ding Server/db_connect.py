from typing import Generator
from sqlmodel import SQLModel, Session, create_engine
from sqlalchemy.orm import sessionmaker
import db_models, links_models

DATABASE_URL = "postgresql://postgres:1234@postgres:5432/postgres"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

SQLModel.metadata.create_all(engine)

def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session