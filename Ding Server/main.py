from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from common_routers.chats import chats_router
from common_routers.messages import messages_router
from common_routers.users import users_router
from common_routers.groups import groups_router
from common_routers.posts import posts_router
from common_routers.comments import comments_router
from common_routers.notifications import notifications_router
from common_routers.games import games_router
from user_routers.auth import auth_router
from user_routers.me import info_about_me_router

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

app.include_router(chats_router)
app.include_router(messages_router)
app.include_router(users_router)
app.include_router(groups_router)
app.include_router(posts_router)
app.include_router(comments_router)
app.include_router(auth_router)
app.include_router(info_about_me_router)
app.include_router(games_router)
app.include_router(notifications_router)
app.include_router(chats_router)

@app.get("/", response_class=HTMLResponse)
def get_homepage(req: Request):
    return templates.TemplateResponse(
        request=req, name="index.html"
    )