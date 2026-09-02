from sqlalchemy import String
from sqlmodel import  Relationship, SQLModel, Field, Column, JSON, DateTime, String
from pydantic import BeforeValidator, HttpUrl, EmailStr, field_validator, PastDatetime, ConfigDict, BaseModel, PlainSerializer, field_serializer
from pydantic_extra_types.phone_numbers import PhoneNumber
from typing import Annotated, Optional, Any, List, Dict
from datetime import datetime, date
from links_models import UserGroupLink, UserChatLink, UserPostLink, FriendsLink, FollowLink, ChatAdminLink, GroupAdminLink

def clean_base64(v: Any) -> Any:
    if isinstance(v, str):
        if v.startswith("/9j/") or " " in v or "\n" in v or "\r" in v:
            cleaned = "".join(v.split())
            cleaned += "=" * (-len(cleaned) % 4)
            return cleaned
    return v

CleanBase64Str = Annotated[str, BeforeValidator(clean_base64), PlainSerializer(lambda val: str(val), return_type=str)]

class AttachedFile(BaseModel):
    "This class represents a file that can be attached to a post or message."
    url: HttpUrl | str
    fileData: HttpUrl | CleanBase64Str
    @field_serializer("url", "fileData")
    def convert_to_str(self, val):
        return str(val)

class Chat(SQLModel, table=True):
    "This class represents a chat between users."
    __tablename__: str = "Chats" # type: ignore
    id: int = Field(default=None, primary_key=True)
    name: str
    participants: List["User"] = Relationship(back_populates="chats", link_model=UserChatLink)
    is_name_auto_generated: Optional[bool] = False
    avatar: Optional[Dict[str, str]] = Field(sa_type=JSON)
    admins: List["User"] = Relationship(link_model=ChatAdminLink)

class Comment(SQLModel, table=True):
    "This class represents a comment made by a user on a post."
    __tablename__: str = "Comments" # type: ignore
    model_config = ConfigDict(ser_json_bytes='base64')
    id: Optional[int] = Field(default=None, primary_key=True)
    date: PastDatetime = Field(default_factory=datetime.now, sa_column=Column(DateTime(timezone=True)))
    user_id: int = Field(foreign_key="Users.id")
    post_id: int = Field(default=None, foreign_key="Posts.id")
    text: Optional[str]
    media: Optional[List[Dict[str, str]]] = Field(default=[], sa_type=JSON)


class Group(SQLModel, table=True):
    "This class represents a group of users."
    __tablename__: str = "Groups" # type: ignore
    model_config = ConfigDict(ser_json_bytes='base64', val_json_bytes='base64')
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    topic: Optional[str]
    members: List["User"] = Relationship(back_populates="groups", link_model=UserGroupLink)
    avatar: Optional[Dict[str, str]] = Field(sa_type=JSON)
    admins: List["User"] = Relationship(link_model=GroupAdminLink)

class Message(SQLModel, table=True):
    "This class represents a message sent by a user in a chat."
    __tablename__: str = "Messages" # type: ignore
    model_config = ConfigDict(ser_json_bytes='base64')
    id: Optional[int] = Field(default=None, primary_key=True)
    chatID: int = Field(foreign_key="Chats.id")
    text: Optional[str]
    senderID: int = Field(foreign_key="Users.id")
    media: Optional[List[Dict[str, str]]] = Field(default=[], sa_type=JSON)
    imitate_generation: Optional[bool]

class Notification(SQLModel, table=True):
    "This class represents a notification sent to a user."
    __tablename__: str = "Notifications" # type: ignore
    id: Optional[int] = Field(default=None, primary_key=True)
    text: str
    isRead: bool = Field(default=False)
    userID: int = Field(foreign_key="Users.id")

class Post(SQLModel, table=True):
    "This class represents a post made by a user or a group."
    model_config = ConfigDict(ser_json_bytes='base64')
    __tablename__: str = "Posts" # type: ignore
    id: Optional[int] = Field(default=None, primary_key=True)
    date: datetime
    media: Optional[List[Dict[str, str]]] = Field(default=[], sa_type=JSON)
    usersLiked: List[User] = Relationship(link_model=UserPostLink)
    text: Optional[str]
    isGroup: bool
    userID: Optional[int]
    groupID: Optional[int]

class User(SQLModel, table=True):
    "This class represents a user in the system."
    __tablename__: str = "Users" # type: ignore
    model_config = ConfigDict(ser_json_bytes='base64', val_json_bytes='base64')
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str
    isOnline: bool = Field(default=False)
    lastSeen: PastDatetime = Field(default_factory=datetime.now, sa_column=Column(DateTime(timezone=True)))
    status: Optional[str] = Field(default=None)
    avatar: Optional[str]
    birthday: Optional[date] = Field(default=None)
    education: Optional[str] = Field(default=None)
    hobbies: Optional[str] = Field(default=None)
    maritalStatus: Optional[str] = Field(default=None)
    friends: List["User"] = Relationship(
        link_model=FriendsLink,
        sa_relationship_kwargs={
            "primaryjoin": "User.id == FriendsLink.firstFriendID",
            "secondaryjoin": "User.id == FriendsLink.secondFriendID",
        }
    )
    followers: List["User"] = Relationship(link_model=FollowLink, sa_relationship_kwargs={
                "primaryjoin": "User.id == FollowLink.user_id",
                "secondaryjoin": "User.id == FollowLink.follower_id",
            })
    followed: List["User"] = Relationship(link_model=FollowLink, sa_relationship_kwargs={
                "primaryjoin": "User.id == FollowLink.follower_id",
                "secondaryjoin": "User.id == FollowLink.user_id",
            })
    groups: List["Group"] = Relationship(back_populates="members", link_model=UserGroupLink)
    chats: List["Chat"] = Relationship(back_populates="participants", link_model=UserChatLink)
    userHash: Optional[str] = Field(default=None, schema_extra={"deprecated": True})
    password: str
    email: Optional[EmailStr]
    phone: Optional[PhoneNumber]

    @field_validator("birthday", "phone", "email", mode="before")
    @classmethod
    def empty_string_to_none(cls, v):
        if isinstance(v, str) and v.strip() == "":
            return None
        return v


class Game(SQLModel, table=True):
    "This class represents a game that can be played by users."
    __tablename__: str = "Games" # type: ignore
    model_config = ConfigDict(ser_json_bytes='base64')
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    description: Optional[str]
    src: HttpUrl | str = Field(sa_type=String)
    preview: Optional[Dict[str, str]] = Field(sa_type=JSON)
    isExternal: bool = Field(default=None)