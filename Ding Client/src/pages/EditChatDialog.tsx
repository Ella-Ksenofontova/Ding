import { Button, Dialog, TextField, VisuallyHidden } from "@radix-ui/themes";
import type { Chat, Toast, User } from "../types"
import { Avatar } from "@radix-ui/themes";
import { fileToBase64, getSrc } from "../auxFunctions";
import { useEffect, useState } from "react";
import { IMAGE_EXTENSIONS, TOAST_DURATION } from "../aux_constants";
import { Pencil1Icon, PlusIcon, TrashIcon } from "@radix-ui/react-icons";
import "./CreateEditDialog.css";
import makeAdmin from "../assets/add-user.png"
import ToastsContainer from "../ToastsContainer";

type EditDialogProps = {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    chatInfo: Chat;
    myId: number;
    onUpdate: () => void
}



function EditChatDialog({ isOpen, setIsOpen, chatInfo, myId, onUpdate }: EditDialogProps) {
    let secondUserAvatar = { url: "", fileData: "" as string | File };
    if (!chatInfo.avatar && chatInfo.participants.length === 2) {
        const avatar = chatInfo.participants.filter(item => item.id != myId)[0]?.avatar
        if (avatar) secondUserAvatar = avatar;
    }

    const [updatedInfo, setUpdatedInfo] = useState(chatInfo);
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [searchInputValue, setSearchInputValue] = useState("");
    const [searchResultsAreLoading, setSearchResultsAreLoading] = useState(false);
    const [isParticipantsSearchOpen, setIsParticipantsSearchOpen] = useState(false);

    useEffect(() => setUpdatedInfo(chatInfo), [chatInfo]);

    function clearDialog() {
        setIsOpen(false);
        setIsParticipantsSearchOpen(false);
        setSearchResults([]);
        setSearchInputValue("");
        setSearchResultsAreLoading(false);
        setUpdatedInfo(chatInfo);
    }

    return (
        <Dialog.Root open={isOpen}>
            <Dialog.Content>
                <h2 className="heading">Настройки чата</h2>
                {chatInfo.is_name_auto_generated ? "" :
                    <div className="main-chat-information">
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
                            <Avatar src={chatInfo.avatar ? getSrc(chatInfo.avatar.fileData) : getSrc(secondUserAvatar.fileData)} fallback={updatedInfo.name ? updatedInfo.name[0] : "C"} alt={`Аватар группы ${updatedInfo.name}`} />
                            <Button className="edit-avatar-button" onClick={() => document.getElementById("avatar-picker")?.click()}><Pencil1Icon /><VisuallyHidden>Редактировать аватар</VisuallyHidden></Button>
                            <Button variant="ghost" onClick={
                                () => setUpdatedInfo({
                                    ...updatedInfo,
                                    avatar: { url: "", fileData: "" }
                                })
                            }>Удалить аватар</Button>
                        </div>
                        <label htmlFor="chat-name">Название чата:</label>
                        <div className="input-with-hint">
                            <TextField.Root id="chat-name" value={updatedInfo.name} onChange={event => {
                                if (event.target.value.length <= 30) setUpdatedInfo({
                                    ...updatedInfo,
                                    name: event.target.value
                                })
                            }} />
                            <div className="hint">{30 - updatedInfo.name.length}</div>
                        </div>
                    </div>}
                <div className="participants-title"><h3 className="heading">Участники чата</h3><Button onClick={() => setIsParticipantsSearchOpen(true)} ><PlusIcon />Добавить участника</Button></div>
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
                            <li className="search-result">{item.username} {updatedInfo.participants.map(p => p.id).includes(item.id) ? "" : <Button onClick={() => {
                                setUpdatedInfo({
                                    ...updatedInfo,
                                    participants: updatedInfo.participants.concat({
                                        ...item,
                                        avatar: { url: "", fileData: item.avatar as string || "" }
                                    }),
                                    is_name_auto_generated: updatedInfo.participants.length === 1
                                });
                            }}><PlusIcon /><VisuallyHidden>Добавить пользователя</VisuallyHidden></Button>}</li>
                        )}
                        {searchResults.length ? "" : searchResultsAreLoading ? "Загрузка..." : !searchInputValue.length ? "Начните печатать, чтобы увидеть подходящие результаты" : "Ничего не нашлось"}
                    </ul>
                </div>
                <ul className="participants">
                    {updatedInfo.participants.filter(item => item.id !== myId).map(item =>
                        <li key={item.id} className="participant">{item.username}
                            {updatedInfo.admins.map(a => a.id).includes(item.id) ? <div className="admin-chip">Админ</div> : <Button className="make-admin"><img src={makeAdmin} alt="" height={15}/> <VisuallyHidden>Сделать пользователя {item.username} администратором</VisuallyHidden></Button>}
                            <Button variant="ghost" onClick={() => setUpdatedInfo({
                                ...updatedInfo,
                                participants: updatedInfo.participants.filter(p => p.id !== item.id),
                                admins: updatedInfo.admins.filter(p => p.id !== item.id),
                            })} className="delete-user"><TrashIcon /><VisuallyHidden>Удалить участника</VisuallyHidden></Button></li>
                    )}
                </ul>
                <div className="create-chat-buttons-panel">
                    <Button onClick={clearDialog} variant="ghost">Отмена</Button>
                    <Button onClick={async () => {
                        if ((updatedInfo.name || updatedInfo.is_name_auto_generated && updatedInfo.participants.length === 2) && updatedInfo.participants.length) {
                            let avatarToSend = updatedInfo.avatar;
                            if (avatarToSend && typeof avatarToSend.fileData !== "string") {
                                const fileDataToSend = await fileToBase64(avatarToSend.fileData);
                                avatarToSend = {
                                    ...avatarToSend,
                                    fileData: fileDataToSend
                                }
                            }

                            const response = fetch("/api/chats", {
                                method: "POST",
                                body: JSON.stringify({
                                    ...updatedInfo,
                                    is_name_auto_generated: chatInfo.is_name_auto_generated && chatInfo.participants.length === 2,
                                    avatar: avatarToSend
                                }),
                                headers: {
                                    "Content-Type": "application/json"
                                }
                            });
                            response.then(res => {
                                if (res.ok) {
                                    setToasts(toasts.concat({ headerContent: "Уведомление", bodyContent: "Чат успешно изменён" }));
                                    setTimeout(() => setToasts(toasts.slice(0, toasts.length - 1)), TOAST_DURATION);
                                    setTimeout(() => {
                                        clearDialog();
                                        onUpdate();
                                    }, 500);
                                } else {
                                    setToasts(toasts.concat({ headerContent: "Ошибка", bodyContent: "Не удалось изменить чат" }));
                                    setTimeout(() => setToasts(toasts.slice(0, toasts.length - 1)), TOAST_DURATION);
                                }
                            })
                        } else {
                            if (!updatedInfo.name) {
                                setToasts(toasts.concat({ headerContent: "Ошибка", bodyContent: "Введите название чата" }));
                                setTimeout(() => setToasts(toasts.slice(0, toasts.length - 1)), TOAST_DURATION);
                            }

                            if (!updatedInfo.participants.length) {
                                setToasts(toasts.concat({ headerContent: "Ошибка", bodyContent: "В чате должны быть участники" }));
                                setTimeout(() => setToasts(toasts.slice(0, toasts.length - 1)), TOAST_DURATION);
                            }
                        }
                    }}>Сохранить изменения</Button>
                </div>
                <ToastsContainer toasts={toasts}/>
            </Dialog.Content>
        </Dialog.Root >
    )
}

export default EditChatDialog;