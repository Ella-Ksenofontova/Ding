import { useEffect, useState } from "react"
import type { Group, Toast, User } from "../types";
import { Avatar, Button, Dialog, TextField } from "@radix-ui/themes";
import { getSrc, fileToBase64 } from "../auxFunctions";
import noProfilePhoto from "../assets/noprofilephoto.png"
import { Pencil1Icon, PlusIcon, TrashIcon } from "@radix-ui/react-icons";
import { VisuallyHidden } from "radix-ui";
import ToastsContainer from "../ToastsContainer";
import { TOAST_DURATION, IMAGE_EXTENSIONS } from "../aux_constants";
import "./CreateEditDialog.css";
import makeAdmin from "../assets/add-user.png"

type EditGroupProps = {
    isOpen: boolean,
    setIsOpen: (isOpen: boolean) => void,
    groupInfo: Group,
    myId: number
}

function EditGroupDialog({ isOpen, setIsOpen, groupInfo, myId }: EditGroupProps) {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [updatedInfo, setUpdatedInfo] = useState(groupInfo);
    const [searchInputValue, setSearchInputValue] = useState("");
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [searchResultsAreLoading, setSearchResultsAreLoading] = useState(false);
    const [isParticipantsSearchOpen, setIsParticipantsSearchOpen] = useState(false);

    useEffect(() => setUpdatedInfo(groupInfo), [groupInfo]);

    function clearDialog() {
        setUpdatedInfo(groupInfo);
        setIsOpen(false);
        setIsParticipantsSearchOpen(false);
        setSearchResults([]);
        setSearchInputValue("");
        setSearchResultsAreLoading(false);
    }

    return (
        <Dialog.Root open={isOpen}>
            <Dialog.Content className="group-dialog-content">
                <h2 className="heading">Создание группы</h2>
                <div className="group-create-form">
                    <div className="main-group-information">
                        <input type="file" id="avatar-picker" accept="image/*" hidden onChange={event => {
                            const files = event.target.files;
                            if (files) {
                                const img = files[0];
                                const extension = img.name.slice(img.name.lastIndexOf("."));
                                if (!IMAGE_EXTENSIONS.includes(extension)) {
                                    setToasts(toasts.concat({ headerContent: "Уведомление", bodyContent: "Расширение не поддерживается" }));
                                    return;
                                }
                                setUpdatedInfo({
                                    ...updatedInfo,
                                    avatar: { url: img.name, fileData: img }
                                })
                            }
                        }} />
                        <div className="avatar-edit">
                            <Avatar src={getSrc((updatedInfo.avatar as {url: string, fileData: File | string})?.fileData || "") || noProfilePhoto} fallback={updatedInfo.name ? updatedInfo.name[0] : "G"} className="group-avatar">
                            </Avatar>
                            <Button className="edit-avatar-button" onClick={() => document.getElementById("avatar-picker")?.click()}><Pencil1Icon /><VisuallyHidden.Root>Редактировать аватар</VisuallyHidden.Root></Button>
                            <Button variant="ghost" onClick={() => setUpdatedInfo({
                                ...updatedInfo,
                                avatar: { url: "", fileData: "" }
                            })}>Удалить аватар</Button>
                        </div>
                        <label htmlFor="group-name">Название группы:</label>
                        <TextField.Root id="group-name" value={updatedInfo.name} onChange={event => {
                            setUpdatedInfo({
                                ...updatedInfo,
                                name: event.target.value
                            })
                        }} />
                        <label htmlFor="group-topic">Тематика:</label>
                        <TextField.Root id="group-topic" value={updatedInfo.topic} onChange={event => {
                            setUpdatedInfo({
                                ...updatedInfo,
                                topic: event.target.value
                            })
                        }} />
                    </div>
                    <div className="participants-title"><h3 className="heading">Участники группы</h3> <Button onClick={() => setIsParticipantsSearchOpen(true)}><PlusIcon />Добавить участника</Button></div>
                    <div className={`add-participants ${isParticipantsSearchOpen ? "" : "collapsed"}`}>
                        <label htmlFor="search-user">Имя или ID</label>
                        <TextField.Root id="search-user" value={searchInputValue} onChange={event => {
                            if (!event.target.value.includes("/")) {
                                setSearchInputValue(event.target.value);
                                if (event.target.value) {
                                    setSearchResultsAreLoading(true);
                                    const response = fetch(`/api/search-users/${event.target.value}`);
                                    response.then(res => {
                                        if (res.ok) return res.json();
                                        setToasts(toasts.concat({ headerContent: "Упс...", bodyContent: "При загрузке результатов поиска произошла ошибка" }));
                                        setTimeout(() => setToasts(toasts.slice(0, toasts.length - 1)), TOAST_DURATION);
                                    }).then(data => {
                                        if (data) setSearchResults(data);
                                    }).finally(() => setSearchResultsAreLoading(false));
                                } else {
                                    setSearchResults([]);
                                }
                            }
                        }} />
                        <ul className="search-results">
                            {searchResults.filter((item: User) => item.id !== myId).map(item =>
                                <li className="search-result">{item.username} {updatedInfo.members.map(m => m.id).includes(item.id) ? "" : <Button onClick={() => {
                                    setUpdatedInfo({
                                        ...updatedInfo,
                                        members: updatedInfo.members.concat(item as User & {avatar: string})
                                    })
                                }}><PlusIcon /><VisuallyHidden.Root>Добавить пользователя</VisuallyHidden.Root></Button>}</li>
                            )}
                            {searchResults.length ? "" : searchResultsAreLoading ? "Загрузка..." : !searchInputValue.length ? "Начните печатать, чтобы увидеть подходящие результаты" : "Ничего не нашлось"}
                        </ul>
                    </div>
                    <ul className="participants">
                        {updatedInfo.members.map(item =>
                            <li key={item.id} className="participant">{item.username}
                                {updatedInfo.admins.map(a => a.id).includes(item.id) ? <div className="admin-chip">Админ</div> : <Button className="make-admin"><img src={makeAdmin} alt="" /> <VisuallyHidden.Root>Сделать пользователя {item.username} администратором</VisuallyHidden.Root></Button>}
                                <Button variant="ghost" onClick={() =>
                                    setUpdatedInfo({
                                        ...updatedInfo,
                                        members: updatedInfo.members.filter(m => m.id !== item.id),
                                        admins: updatedInfo.admins.filter(m => m.id !== item.id)
                                    })
                                } className="delete-user"><TrashIcon /><VisuallyHidden.Root>Удалить участника</VisuallyHidden.Root></Button></li>
                        )}
                    </ul>
                    <div className="create-group-buttons-panel">
                        <Button onClick={clearDialog} variant="ghost">Отмена</Button>
                        <Button onClick={async () => {
                            if (updatedInfo.name && updatedInfo.members.length) {
                                let avatarToSend = updatedInfo.avatar;
                                if (avatarToSend && typeof (avatarToSend as {url: string, fileData: File}).fileData !== "string") {
                                    const fileDataToSend = await fileToBase64((avatarToSend as {url: string, fileData: File}).fileData);
                                    avatarToSend = {
                                        ...avatarToSend as {url: string, fileData: File},
                                        fileData: fileDataToSend
                                    }
                                }

                                const response = fetch("/api/groups", {
                                    method: "POST",
                                    body: JSON.stringify({
                                        ...updatedInfo,
                                        avatar: avatarToSend
                                    }),
                                    headers: {
                                        "Content-Type": "application/json"
                                    }
                                });
                                response.then(res => {
                                    if (res.ok) {
                                        setToasts(toasts.concat({ headerContent: "Уведомление", bodyContent: "Группа успешно изменена" }));
                                        setTimeout(() => setToasts(toasts.slice(0, toasts.length - 1)), TOAST_DURATION);
                                        setTimeout(clearDialog, 500);
                                    } else {
                                        setToasts(toasts.concat({ headerContent: "Ошибка", bodyContent: "Не удалось изменить группу" }));
                                        setTimeout(() => setToasts(toasts.slice(0, toasts.length - 1)), TOAST_DURATION);
                                    }
                                })
                            } else {
                                if (!updatedInfo.name) {
                                    setToasts(toasts.concat({ headerContent: "Ошибка", bodyContent: "Введите название группы" }));
                                    setTimeout(() => setToasts(toasts.slice(0, toasts.length - 1)), TOAST_DURATION);
                                }

                                if (!updatedInfo.members.length) {
                                    setToasts(toasts.concat({ headerContent: "Ошибка", bodyContent: "Добавьте хотя бы одного участника" }));
                                    setTimeout(() => setToasts(toasts.slice(0, toasts.length - 1)), TOAST_DURATION);
                                }
                            }
                        }}>Сохранить изменения</Button>
                    </div>
                </div>
                <ToastsContainer toasts={toasts} />
            </Dialog.Content>
        </Dialog.Root >
    )
}

export default EditGroupDialog;