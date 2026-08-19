from typing import  Any, Dict, List, Optional
from pydantic import BaseModel, field_validator
from pydantic_extra_types.phone_numbers import PhoneNumber
from datetime import datetime
from sqlmodel import Field

class UserAPI(BaseModel):
    id: int
    username: str
    avatar: Optional[str] = ""

class GroupAPI(BaseModel):
    id: int
    name: str

class GroupPost(BaseModel):
    id: Optional[int] = None
    name: str
    topic: Optional[str] = None
    avatar: Optional[Any] = None
    members: List[UserAPI] = []
    admins: List[UserAPI] = []

class GroupRead(BaseModel):
    id: int
    name: str
    topic: Optional[str] = None
    avatar: Optional[Any] = None
    members: List[UserAPI] = []
    admins: List[UserAPI] = []

class UserPost(BaseModel):
    id: Optional[int] = None
    username: str
    isOnline: bool = False
    lastSeen: str
    status: Optional[str]
    avatar: Optional[str]
    birthday: Optional[str]
    education: Optional[str]
    hobbies: Optional[str]
    maritalStatus: Optional[str]
    friends: List[int] =[]
    groups: List[int] = []
    followers: List[int] = []
    followed: List[int] = []
    userHash: str
    password: str
    email: Optional[str]
    phone: Optional[PhoneNumber]

    @field_validator("birthday", "phone", "email", mode="before")
    @classmethod
    def empty_string_to_none(cls, v):
        if isinstance(v, str) and v.strip() == "":
            return None
        return v

class UserGet(BaseModel):
    id: Optional[int] = None
    username: str
    isOnline: bool = False
    lastSeen: str
    status: Optional[str]
    avatar: Optional[str] 
    birthday: Optional[str] = Field(default=None)
    education: Optional[str] = Field(default=None)
    hobbies: Optional[str] = Field(default=None)
    maritalStatus: Optional[str] = Field(default=None)
    friends: List[UserAPI] = []
    followers: List[UserAPI] = []
    followed: List[UserAPI] = []
    groups: List[GroupAPI] = []
    userHash: str
    password: str
    email: Optional[str]
    phone: Optional[PhoneNumber]

class PostPost(BaseModel):
    id: Optional[int] = None
    date: datetime
    media: List[Any]
    usersLiked: List[UserAPI] = []
    text: Optional[str]
    isGroup: bool
    userOrGroupId: int

class PostRead(PostPost):
    id: Optional[int] = None
    date: datetime
    media: List[Any]
    usersLiked: List[UserAPI] = []
    text: Optional[str]
    isGroup: bool
    userOrGroupId: int

class ChatPost(BaseModel):
    id: Optional[int] = None
    name: str
    participants: List[UserAPI] = []
    is_name_auto_generated: bool
    avatar: Optional[Dict[str, str]]
    admins: List[UserAPI] = []

class ChatRead(BaseModel):
    id: int
    name: str
    participants: List[UserAPI] = []
    is_name_auto_generated: bool
    avatar: Optional[Dict[str, str]]
    admins: List[UserAPI] = []

class CommentGet(BaseModel):
    id: int
    date: datetime
    user: UserAPI
    post_id: int
    text: Optional[str]
    media: Optional[List[Dict[str, str]]] = []