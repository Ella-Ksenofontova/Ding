from sqlmodel import Field, SQLModel
from sqlalchemy import quoted_name

class FriendsLink(SQLModel, table=True):
    __tablename__ = quoted_name("FriendsLink", quote=True) #type: ignore
    firstFriendID: int = Field(foreign_key='Users.id', primary_key=True)
    secondFriendID: int = Field(foreign_key='Users.id', primary_key=True)

class FollowLink(SQLModel, table=True):
    __tablename__ = quoted_name("FollowLink", quote=True) #type: ignore
    user_id: int = Field(foreign_key='Users.id', primary_key=True)
    follower_id: int = Field(foreign_key='Users.id', primary_key=True)

class ChatAdminLink(SQLModel, table=True):
    __tablename__ = quoted_name("ChatAdminLink", quote=True) #type: ignore
    admin_id: int = Field(foreign_key="Users.id", primary_key=True)
    chat_id: int = Field(foreign_key="Chats.id", primary_key=True)

class GroupAdminLink(SQLModel, table=True):
    __tablename__ = quoted_name("GroupAdminLink", quote=True) #type: ignore
    adminID: int = Field(foreign_key="Users.id", primary_key=True)
    groupID: int = Field(foreign_key="Groups.id", primary_key=True)

class UserGroupLink(SQLModel, table=True):
    __tablename__ = quoted_name("UserGroupLink", quote=True) #type: ignore
    userID: int = Field(foreign_key="Users.id", primary_key=True)
    groupID: int = Field(foreign_key="Groups.id", primary_key=True)

class UserChatLink(SQLModel, table=True):
    __tablename__ = quoted_name("UserChatLink", quote=True) #type: ignore
    userID: int = Field(foreign_key="Users.id", primary_key=True)
    chatID: int = Field(foreign_key="Chats.id", primary_key=True)

class UserPostLink(SQLModel, table=True):
    __tablename__ = quoted_name("UserPostLink", quote=True) #type: ignore
    userID: int = Field(foreign_key="Users.id", primary_key=True)
    postID: int = Field(foreign_key="Posts.id", primary_key=True)