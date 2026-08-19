import db_models
from db_connect import SessionLocal
from aux_init import transliterate_name, get_file_as_base64
from pathlib import Path
import frontmatter
from contextlib import contextmanager
from datetime import datetime

@contextmanager
def get_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def add_old_users():
    users_folder_path = Path("./old_site/pages/users")

    with get_session() as session:
        for file in users_folder_path.iterdir():
            if file.is_file():
                user = frontmatter.load(file)

                user_hash = file.name[file.name.rindex("-") + 1:]
                avatar = get_file_as_base64(f"./old_site{str(user.get("pathToAvatar"))}") if user.get("pathToAvatar") else None

                db_user = db_models.User(username=str(user.get("nickname", "Неизвестное имя")), isOnline=bool(user.get("isOnline")), avatar=avatar, lastSeen=datetime.now(), status=str(user.get("status")), education=str(user.get("education")), hobbies=str(user.get("hobbies")), maritalStatus=str(user.get("maritalStatus")), password="1234", email=f"{transliterate_name(str(user.get("nickname", "Аноним")))}@example.com", userHash=user_hash, phone=None)

                session.add(db_user)

        protagonist = db_models.User(username="Хоулин Вульф", isOnline=True, avatar=get_file_as_base64(f"./old_site/Телефон Хоулин/ава.jpg"), lastSeen=datetime.now(), status="", hobbies="Рисование, чтение и коллекционирование канцелярии", education="Школа Монстров", maritalStatus="одна", password="BURDA_magazine", email="howleenwolf@example.com", userHash="raj310", phone=None)
        session.add(protagonist)
        session.commit()


def add_old_groups():
    groups_folder_path = Path("./old_site/pages/groups")
    with get_session() as session:
        for file in groups_folder_path.iterdir():
                if file.is_file():
                    group = frontmatter.load(file)
                    avatar = get_file_as_base64(f"./old_site{str(group.get("pathToGroupPhoto"))}") if group.get("pathToGroupPhoto") else None

                    db_group = db_models.Group(name=str(group.get("groupName", "Ошибка: имя группы не найдено!")), topic=str(group.get("groupTheme", "")), avatar=avatar)
                    session.add(db_group)

        session.commit()


def add_old_posts():
    posts_folder_path = Path("./old_site/pages/posts")
    with get_session() as session:
        for file in posts_folder_path.iterdir():
                    if file.is_file():
                        post = frontmatter.load(file)
    
                        db_post = db_models.Post(date=datetime.now(), usersLiked=[], text=post.content, userID=None, groupID=None, isGroup=post.get("type", None) == "group", media=[{"url": file[file.rindex("/") + 1:], "fileData": get_file_as_base64(f"old_site{file}")} for file in list(post.get("photos", [])) + list(post.get("videos", []))]) # type: ignore
                        session.add(db_post)
        session.commit()

add_old_users()
add_old_groups()
add_old_posts()