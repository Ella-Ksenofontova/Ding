import { getFileFromBase64Safely } from "../auxFunctions"
import noProfilePhoto from "../assets/noprofilephoto.png";
import type { User } from "../types"
import "./Friend.css"
import { useEffect, useState } from "react";

type FriendProps = {
    friendInfo: User
}

function Friend({ friendInfo }: FriendProps) {
    const [avatar, setAvatar] = useState("");

    useEffect(() => {
        setAvatar(getFileFromBase64Safely(friendInfo?.avatar as string || ""));
    }, []);

    return (
        <div className="friend">
            {friendInfo.avatar ? <img src={avatar} className="friend-avatar" alt={`Аватар пользователя ${friendInfo.username}`} /> : <img src={noProfilePhoto} alt={`Аватар пользователя ${friendInfo.username} по умолчанию`} className="friend-avatar" />}
            <h3 className="heading friend-name"><a href={`/users/${friendInfo.id}`} className="user-link">{friendInfo.username}</a></h3>
        </div>
    )
}

export default Friend;