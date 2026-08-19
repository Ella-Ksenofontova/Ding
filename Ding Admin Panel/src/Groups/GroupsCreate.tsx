import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { Button, Form, Tab, Tabs } from "react-bootstrap";
import Header from "../Header";
import AddByNameOrId from "../AddByNameOrId";
import AvatarPreview from "../AvatarPreview";
import { type CreateProps, type Group, type HasNameAndId, type Toast as ToastType } from "../types";
import CustomToastsConatiner from "../CustomToastsContainer";
import { base64ToFile, fileToBase64 } from "../auxFunctions";

async function getGroupDataByID(id: number) {
    const response = await fetch(`/api/groups/${id}`);
    if (!response.ok) {
        const errorDetails = await response.json();
        throw new Error(errorDetails.detail || "Ошибка загрузки группы");
    }
    return response.json();
}

const IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"];

function GroupsCreate({ label }: CreateProps) {
    const files = document.querySelectorAll("img") as NodeListOf<HTMLImageElement>;
    for (let file of files) {
        const src = file.src;
        try {
            URL.revokeObjectURL(src);
        } catch {
            // Here we don't have to do anythiing:)
        }
    }

    document.title = `${label} группы`
    const { id: groupId } = useParams();

    const [name, setName] = useState("");
    const [topic, setTopic] = useState("");
    const [members, setMembers] = useState<HasNameAndId[]>([]);
    const [admins, setAdmins] = useState<HasNameAndId[]>([]);
    const [avatar, setAvatar] = useState("");
    const [toasts, setToasts] = useState<ToastType[]>([]);
    const [error, setError] = useState("");
    const [isDataLoading, setIsDataLoading] = useState(Boolean(groupId));
    const [avatarIsLocal, setAvatarIsLocal] = useState(false);
    const [fileObj, setFileObj] = useState<File | null>(null);

    useEffect(() => {
        if (!groupId) {
            setIsDataLoading(false);
            return;
        }

        setIsDataLoading(true);
        getGroupDataByID(Number(groupId))
            .then((data: Group) => {
                setName(data.name ?? "");
                setTopic(data.topic ?? "");
                setMembers(data.members ? data.members.map(item => {
                    return {
                        ...item,
                        name: item.username
                    }
                }) : []);
                setAdmins(data.admins ? data.admins.map(item => {
                    return {
                        ...item,
                        name: item.username
                    }
                }) : []);
                if (data.avatar) {
                    try {
                        const file = base64ToFile(data.avatar);
                        const fileUrl = URL.createObjectURL(file);

                        setAvatar(fileUrl);
                        setAvatarIsLocal(true);
                        setFileObj(file);
                    } catch {
                        setAvatar(data.avatar);
                        setAvatarIsLocal(false);
                    }
                }
                setError("");
            })
            .catch((err: Error) => setError(err.message))
            .finally(() => setIsDataLoading(false));
    }, [groupId]);

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const parsedMembers = members.map((member) => member.id);

        if (name.trim() && topic.trim() && parsedMembers.length && avatar.trim()) {
            const response = postGroupData();
            response.then(res => {
                if (res.ok) {
                    setToasts(toasts.concat({ headerContent: "Уведомление", bodyContent: "Данные успешно сохранены" }));
                    setTimeout(() => window.location.href = "/", 500);
                } else {
                    setToasts(toasts.concat({ headerContent: "Ошибка", bodyContent: "Не удалось сохранить данные на сервере" }));
                }
            });
        } else {
            const validationErrors = [] as ToastType[];
            if (!name.trim()) validationErrors.push({ headerContent: "Ошибка", bodyContent: "Введите название группы" });
            if (!topic.trim()) validationErrors.push({ headerContent: "Ошибка", bodyContent: "Введите тему группы" });
            if (!parsedMembers.length) validationErrors.push({ headerContent: "Ошибка", bodyContent: "Укажите хотя бы одного участника" });
            if (!avatar.trim()) validationErrors.push({ headerContent: "Ошибка", bodyContent: "Введите ссылку на аватар" });
            setToasts([...toasts, ...validationErrors]);
        }
    }

    async function postGroupData() {
        const base64Str = fileObj ? await fileToBase64(fileObj) : "";

        const reqBody = groupId ? {
            id: groupId,
            name: name,
            members: members,
            topic: topic,
            avatar: fileObj ? base64Str : avatar
        } : {
            name: name,
            members: members,
            topic: topic,
            avatar: fileObj ? base64Str : avatar
        }
        const response = fetch("/api/groups", {
            method: "POST",
            body: JSON.stringify(reqBody),
            headers: {
                'Content-Type': 'application/json'
            },
        });

        return response;
    }

    return (
        <>
            <Header />
            <main className="main">
                <h2 className="heading heading-level-2">{label} группы</h2>
                <div className="scrollable">
                    {isDataLoading ? <p>Загрузка...</p> : error ? <p>Ошибка: {error}</p> :
                        <form className="create-form" onSubmit={handleSubmit}>
                            <Form.Label htmlFor="group-name">Название группы</Form.Label>
                            <Form.Control id="group-name" value={name} onChange={(event) => setName(event.target.value)} />
                            <Form.Label htmlFor="group-topic">Тема</Form.Label>
                            <Form.Control id="group-topic" value={topic} onChange={(event) => setTopic(event.target.value)} />
                            <div>
                                <Form.Label htmlFor="group-members">Участники</Form.Label>
                            </div>
                            <AddByNameOrId entities={members} ChangeEntities={setMembers} buttonLabel="Добавить участника" />
                            <h3 className="heading heading-level-3">Администраторы</h3>
                            <AddByNameOrId entities={admins} ChangeEntities={setAdmins} toasts={toasts} changeToasts={setToasts} condition={item => members.map(p => p.id).includes(item.id)} />
                            <div className="avatar-add-wrapper">
                                <h3 className="heading heading-level-3">Аватар группы</h3>
                                <Tabs onSelect={key => {
                                    if (key === "local" && avatarIsLocal || key !== "local" && !avatarIsLocal) {
                                        setAvatar("");
                                        setFileObj(null);
                                    }
                                    setAvatarIsLocal(key === "local")
                                }} activeKey={avatarIsLocal ? "local" : "internet-link"}>
                                    <Tab title="Из Интернета" eventKey="internet-link">
                                        <div className="avatar-add-wrapper">
                                            <Form.Label htmlFor="group-avatar">Ссылка на аватар</Form.Label>
                                            <Form.Control id="group-avatar" value={avatar} onChange={(event) => setAvatar(event.target.value)} />
                                        </div>
                                    </Tab>
                                    <Tab title="Из локального хранилища" eventKey="local">
                                        <div className="avatar-add-wrapper">
                                            <input type="file" id="file-picker" hidden accept="image/*" onChange={event => {
                                                const file = event.target.files?.item(0);
                                                if (file) {
                                                    if (IMAGE_EXTENSIONS.includes(file.name.slice(file.name.lastIndexOf(".")))) {
                                                        setAvatar(URL.createObjectURL(file));
                                                        setFileObj(file);
                                                    }
                                                }
                                            }} />
                                            <Button onClick={() => {
                                                document.getElementById("file-picker")?.click();
                                            }}>Выбрать файл</Button>
                                        </div>
                                    </Tab>
                                </Tabs>
                                <div className="preview" style={{ marginTop: "10px" }}>
                                    <AvatarPreview url={avatar} alt="Превью аватара группы" emptyMessage={`${avatarIsLocal ? "Выберите файл" : "Введите ссылку на аватар"}, чтобы увидеть предпросмотр`} isLocal={avatarIsLocal} />
                                </div>
                            </div>
                            <Button type="submit" style={{ marginTop: "16px" }}>Сохранить</Button>
                        </form>
                    }
                </div>

                <CustomToastsConatiner toasts={toasts} setToasts={setToasts} />
            </main>
        </>
    );
}

export default GroupsCreate;
