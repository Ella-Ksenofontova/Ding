import { useEffect, useState } from "react";
import type { User } from "./types"
import { Avatar, Button } from "@radix-ui/themes";
import { Pencil1Icon } from "@radix-ui/react-icons";
import { getFileFromBase64Safely } from "./auxFunctions";
import "./InfoAboutUser.css"
import EditProfileDialog from "./EditProfileDialog";

type InfoProps = {
    infoAboutUser: User | null,
    isLoading: boolean,
    isMyProfile: boolean
}

let avatar = "";

function InfoAboutUser({ infoAboutUser, isLoading, isMyProfile }: InfoProps) {
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    useEffect(() => {
        if (!avatar && infoAboutUser?.avatar) {
            avatar = getFileFromBase64Safely(infoAboutUser?.avatar as string || "");
        }
    }, [infoAboutUser]);

    return (
        infoAboutUser ? <>
            <div className="info-about-user">
                <div className="main-information">
                    <div className="avatar-with-badge">
                        <Avatar className="user-avatar" src={avatar} alt={`Аватар пользователя ${infoAboutUser.username}`} fallback={infoAboutUser.username[0]} />
                        {infoAboutUser.isOnline ? <div className="online-badge" /> : ""}
                    </div>
                    <h2 className="heading username">{infoAboutUser.username}</h2>
                    <div className="user-status">{infoAboutUser.status}</div>
                </div>
                <ul className="additional-information">
                    <li className="additional-info-item">Дата рождения: {infoAboutUser.birthday ? infoAboutUser.birthday : "не указана"}</li>
                    <li className="additional-info-item">Образование: {infoAboutUser.education ? infoAboutUser.education : "не указано"}</li>
                    <li className="additional-info-item">Хобби: {infoAboutUser.hobbies ? infoAboutUser.hobbies : "не указаны"}</li>
                    <li className="additional-info-item">Семейное положение: {infoAboutUser.maritalStatus ? infoAboutUser.maritalStatus : "не указано"}</li>
                </ul>
                {isMyProfile ? <>
                    <Button onClick={() => setIsEditDialogOpen(true)}><Pencil1Icon /> Редактировать</Button>
                    <EditProfileDialog isOpen={isEditDialogOpen} setIsOpen={setIsEditDialogOpen} infoAboutUser={infoAboutUser}/>
                </> : ""}
            </div>
        </> : isLoading ? <p>Загрузка...</p> : <p>Не удалось получить информацию о пользователе</p>
    )
}

export default InfoAboutUser;