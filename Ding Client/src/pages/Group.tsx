import { base64ToFile } from "../auxFunctions";
import { type Group as GroupType } from "../types";
import noProfilePhoto from "../assets/noprofilephoto.png";
import "./Group.css"

type GroupProps = {
    groupInfo: GroupType
}

function Group({ groupInfo }: GroupProps) {
    return (
        <div className="group">
            {groupInfo.avatar ? <img src={base64ToFile(groupInfo.avatar) ? URL.createObjectURL(base64ToFile(groupInfo.avatar)) : groupInfo.avatar} alt="Фото группы" className="group-avatar" /> : <img src={noProfilePhoto} alt="Фото группы по умолчанию" className="group-avatar" />}
            <h3 className="heading group-name"><a href={`/groups/${groupInfo.id}`} className="group-link">{groupInfo.name}</a></h3>
            <div className="group-topic">{groupInfo.topic}</div>
        </div>
    )
}

export default Group;