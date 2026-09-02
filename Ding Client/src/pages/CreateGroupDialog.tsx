import { useState } from "react"
import type { Toast, User } from "../types";
import { Avatar, Button, Dialog, TextField } from "@radix-ui/themes";
import { getCookie, getFileFromBase64Safely } from "../auxFunctions";
import noProfilePhoto from "../assets/noprofilephoto.png"
import { Pencil1Icon, PlusIcon, TrashIcon } from "@radix-ui/react-icons";
import { VisuallyHidden } from "radix-ui";
import ToastsContainer from "../ToastsContainer";
import { TOAST_DURATION, IMAGE_EXTENSIONS } from "../aux_constants";
import "./CreateEditDialog.css";

type CreateGroupProps = {
    isOpen: boolean,
    setIsOpen: (isOpen: boolean) => void
}

function CreateGroupDialog({ isOpen, setIsOpen }: CreateGroupProps) {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [avatar, setAvatar] = useState({ url: "", fileData: "" });
    const [groupName, setGroupName] = useState("");
    const [topic, setTopic] = useState("");
    const [infoAboutMe, setInfoAboutMe] = useState<User | null>(null);
    const [isInfoAboutMeLoading, setIsInfoAboutMeLoading] = useState(true);
    const [participants, setParticipants] = useState<User[]>([]);
    const [searchInputValue, setSearchInputValue] = useState("");
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [searchResultsAreLoading, setSearchResultsAreLoading] = useState(false);
    const [isParticipantsSearchOpen, setIsParticipantsSearchOpen] = useState(false);

    function clearDialog() {
        setIsOpen(false);
        setGroupName("");
        setTopic("");
        setAvatar({ url: "", fileData: "" });
        setIsParticipantsSearchOpen(false);
        setParticipants([]);
        setSearchResults([]);
        setSearchInputValue("");
        setSearchResultsAreLoading(false);
    }

    if (isInfoAboutMeLoading) {
        const response = fetch("/api/info-about-me", {
            headers: {
                "Authorization": `Bearer ${getCookie("jwt-token")}`
            }
        });

        response.then(res => {
            if (res.ok) return res.json();
            setToasts(toasts.concat({ headerContent: "Ошибка", bodyContent: "Не удалось получить информацию о текущем пользователе" }));
            setTimeout(() => setToasts(toasts.slice(0, toasts.length - 1)), TOAST_DURATION);
        }).then(data => {
            if (data) setInfoAboutMe(data);
        }).finally(() => setIsInfoAboutMeLoading(false));
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
                                setAvatar({ url: img.name, fileData: URL.createObjectURL(img) });
                            }
                        }} />
                        <div className="avatar-edit">
                            <Avatar src={getFileFromBase64Safely(avatar.fileData) || noProfilePhoto} fallback={groupName ? groupName[0] : "G"} className="group-avatar">
                            </Avatar>
                            <Button className="edit-avatar-button" onClick={() => document.getElementById("avatar-picker")?.click()}><Pencil1Icon /><VisuallyHidden.Root>Редактировать аватар</VisuallyHidden.Root></Button>
                            <Button variant="ghost" onClick={() => setAvatar({ url: "", fileData: "" })}>Удалить аватар</Button>
                        </div>
                        <label htmlFor="group-name">Название группы:</label>
                        <TextField.Root id="group-name" value={groupName} onChange={event => {
                            setGroupName(event.target.value);
                        }} />
                        <label htmlFor="group-topic">Тематика:</label>
                        <TextField.Root id="group-topic" value={topic} onChange={event => {
                            setTopic(event.target.value);
                        }} />
                    </div>
                    <div className="participants-title"><h3 className="heading participants-heading">Участники группы</h3> <Button onClick={() => setIsParticipantsSearchOpen(true)} disabled={!infoAboutMe}><PlusIcon />Добавить участника</Button></div>
                    <div className={`add-participants ${isParticipantsSearchOpen && Boolean(infoAboutMe) ? "" : "collapsed"}`}>
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
                            {searchResults.filter((item: User) => item.id !== infoAboutMe?.id).map(item =>
                                <li className="search-result">{item.username} {participants.map(p => p.id).includes(item.id) ? "" : <Button onClick={() => {
                                    setParticipants(participants.concat(item));
                                }}><PlusIcon /><VisuallyHidden.Root>Добавить пользователя</VisuallyHidden.Root></Button>}</li>
                            )}
                            {searchResults.length ? "" : searchResultsAreLoading ? "Загрузка..." : !searchInputValue.length ? "Начните печатать, чтобы увидеть подходящие результаты" : "Ничего не нашлось"}
                        </ul>
                    </div>
                    <ul className="participants">
                        {participants.map(item =>
                            <li key={item.id} className="participant">{item.username} <Button variant="ghost" onClick={() => setParticipants(participants.filter(user => user !== item))}><TrashIcon /><VisuallyHidden.Root>Удалить участника</VisuallyHidden.Root></Button></li>
                        )}
                    </ul>
                    <div className="create-group-buttons-panel">
                        <Button onClick={clearDialog} variant="ghost">Отмена</Button>
                        <Button disabled={!Boolean(infoAboutMe)} onClick={() => {
                            if (groupName && participants.length && infoAboutMe) {
                                const response = fetch("/api/groups", {
                                    method: "POST",
                                    body: JSON.stringify({
                                        name: groupName,
                                        avatar: avatar,
                                        members: participants.concat(infoAboutMe),
                                        topic: topic
                                    }),
                                    headers: {
                                        "Content-Type": "application/json"
                                    }
                                });
                                response.then(res => {
                                    if (res.ok) {
                                        setToasts(toasts.concat({ headerContent: "Уведомление", bodyContent: "Группа успешно создана" }));
                                        setTimeout(() => setToasts(toasts.slice(0, toasts.length - 1)), TOAST_DURATION);
                                        setTimeout(clearDialog, 500);
                                    } else {
                                        setToasts(toasts.concat({ headerContent: "Ошибка", bodyContent: "Не удалось создать группу" }));
                                        setTimeout(() => setToasts(toasts.slice(0, toasts.length - 1)), TOAST_DURATION);
                                    }
                                })
                            } else {
                                if (!groupName) {
                                    setToasts(toasts.concat({ headerContent: "Ошибка", bodyContent: "Введите название группы" }));
                                    setTimeout(() => setToasts(toasts.slice(0, toasts.length - 1)), TOAST_DURATION);
                                }

                                if (!participants.length) {
                                    setToasts(toasts.concat({ headerContent: "Ошибка", bodyContent: "Добавьте хотя бы одного участника" }));
                                    setTimeout(() => setToasts(toasts.slice(0, toasts.length - 1)), TOAST_DURATION);
                                }
                            }
                        }}>Создать группу</Button>
                    </div>
                </div>
                <ToastsContainer toasts={toasts} />
            </Dialog.Content>
        </Dialog.Root>
    )
}

export default CreateGroupDialog;