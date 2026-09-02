import { Avatar, Button, Dialog, TextField } from "@radix-ui/themes"
import type { User } from "./types"
import { useState } from "react";
import { getFileFromBase64Safely } from "./auxFunctions";
import { useContext } from "react";
import { SetToastsContext, ToastsContext, UpdateInfoContext } from "./contexts";
import { IMAGE_EXTENSIONS } from "./aux_constants";
import "./EditProfileDialog.css";

type EditDialogProps = {
    isOpen: boolean,
    setIsOpen: (val: boolean) => void,
    infoAboutUser: User
}

function EditProfileDialog({ isOpen, setIsOpen, infoAboutUser }: EditDialogProps) {
    const [avatar, setAvatar] = useState<string | File>(getFileFromBase64Safely(infoAboutUser.avatar as string || ""));
    const [updatedInfo, setUpdatedInfo] = useState(infoAboutUser);
    const updateInfo = useContext(UpdateInfoContext);
    const toasts = useContext(ToastsContext);
    const setToasts = useContext(SetToastsContext)

    return (
        <Dialog.Root open={isOpen}>
            <Dialog.Content>
                <h2 className="heading">Редактирование профиля</h2>
                <div className="edit-info">
                    <div className="avatar-edit">
                        <Avatar className="user-avatar" src={typeof avatar === "string" ? avatar : URL.createObjectURL(avatar)} alt={`Аватар пользователя ${infoAboutUser.username}`} fallback={infoAboutUser.username[0]} />
                        <input type="file" id="avatar-picker" hidden
                            accept="image/*"
                            onChange={event => {
                                const files = event.target.files;
                                if (files) {
                                    const newAvatar = files[0];
                                    if (IMAGE_EXTENSIONS.includes(newAvatar.name.slice(newAvatar.name.lastIndexOf(".")))) {
                                        setAvatar(newAvatar);
                                    } else {
                                        setToasts(toasts.concat({ headerContent: "Уведомление", bodyContent: "Расширение не поддерживается" }));
                                    }
                                }
                            }}
                        />
                        <div className="avatar-edit-buttons">
                            <Button onClick={() => document.getElementById("avatar-picker")?.click()} size={"1"}>Выбрать новый аватар</Button>
                            <Button variant="ghost" onClick={() => setAvatar("")} size={"1"}>Удалить аватар</Button>
                        </div>
                    </div>
                    <label htmlFor="name">Имя: </label>
                    <TextField.Root id="name" defaultValue={infoAboutUser.username} onChange={event => setUpdatedInfo({
                        ...updatedInfo,
                        username: event.target.value
                    })} required/>
                    <label htmlFor="status">Статус: </label>
                    <TextField.Root id="status" defaultValue={infoAboutUser.status} onChange={event => setUpdatedInfo({
                        ...updatedInfo,
                        status: event.target.value
                    })} />
                    <label htmlFor="birthday">Дата рождения: </label>
                    <TextField.Root id="birthday" type="date" defaultValue={infoAboutUser.birthday} onChange={event => setUpdatedInfo({
                        ...updatedInfo,
                        birthday: event.target.value
                    })} />
                    <label htmlFor="marital-status">Семейное положение: </label>
                    <TextField.Root id="marital-status" defaultValue={infoAboutUser.maritalStatus} onChange={event => setUpdatedInfo({
                        ...updatedInfo,
                        maritalStatus: event.target.value
                    })} />
                    <label htmlFor="education">Образование: </label>
                    <TextField.Root id="education" defaultValue={infoAboutUser.education} onChange={event => setUpdatedInfo({
                        ...updatedInfo,
                        education: event.target.value
                    })} />
                    <label htmlFor="hobbies">Хобби: </label>
                    <TextField.Root id="hobbies" defaultValue={infoAboutUser.hobbies} onChange={event => setUpdatedInfo({
                        ...updatedInfo,
                        hobbies: event.target.value
                    })} />
                </div>
                <div className="edit-buttons-panel">
                    <Button variant="ghost" onClick={() => {
                        setUpdatedInfo(infoAboutUser);
                        setIsOpen(false);
                    }}
                    size={"1"}>Отмена</Button>
                    <Button size={"1"} onClick={() => {
                        const response = fetch("/api/users", {
                            method: "POST",
                            body: JSON.stringify(updatedInfo),
                            headers: {
                                "Content-Type": "application/json"
                            }
                        });

                        response.then(res => {
                            if (res.ok) {
                                setToasts(toasts.concat({headerContent: "Уведомление", bodyContent: "Данные успешно сохранены"}));
                            } else {
                                setToasts(toasts.concat({headerContent: "Ошибка", bodyContent: "Не удалось сохранить данные на сервере"}));
                            }
                        })

                        if (updateInfo) updateInfo(updatedInfo);
                        setIsOpen(false);
                    }}>
                        Сохранить
                    </Button>
                </div>
            </Dialog.Content>
        </Dialog.Root>
    )
}

export default EditProfileDialog;