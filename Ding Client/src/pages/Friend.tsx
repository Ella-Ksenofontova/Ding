import { base64ToFile } from "../auxFunctions"
import noProfilePhoto from "../assets/noprofilephoto.png";
import type { User } from "../types"
import "./Friend.css"

type FriendProps = {
    friendInfo: User
}

function Friend({ friendInfo }: FriendProps) {
    return (
        <div className="friend">
            {friendInfo.avatar ? <img src={base64ToFile(friendInfo.avatar) ? URL.createObjectURL(base64ToFile(friendInfo.avatar)) : friendInfo.avatar} className="friend-avatar" alt={`Аватар пользователя ${friendInfo.username}`}/> : <img src={noProfilePhoto} alt={`Аватар пользователя ${friendInfo.username} по умолчанию`} className="friend-avatar" />}
            <h3 className="heading friend-name"><a href={`/users/${friendInfo.id}`} className="user-link">{friendInfo.username}</a></h3>
        </div>
    )
}

export default Friend;