import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { Button, Form, Tab, Tabs } from "react-bootstrap";
import Header from "../Header";
import AddByNameOrId from "../AddByNameOrId";
import AvatarPreview from "../AvatarPreview";
import { type CreateProps, type HasNameAndId, type Toast as ToastType, type User } from "../types";
import CustomToastsContainer from "../CustomToastsContainer";
import { IMAGE_EXTENSIONS } from "../auxConstants";
import { fileToBase64, base64ToFile } from "../auxFunctions";

async function getUserDataByID(id: number) {
    const response = await fetch(`/api/users/${id}`);
    if (!response.ok) {
        const errorDetails = await response.json();
        throw new Error(errorDetails.detail || "Ошибка загрузки пользователя");
    }
    return response.json();
}

function getTimezoneOffset() {
    const parts = new Intl.DateTimeFormat('ru', { timeZoneName: 'longOffset' }).formatToParts(new Date());
    const offset = parts.find(part => part.type === 'timeZoneName')?.value;
    if (offset === 'GMT') return 'Z';
    if (offset) return offset.replace('GMT', '');
    return 'Z';
}

function getDateAccordingToTimezone(dateStr: string) {
    const testDate = new Date();
    const offsetHours = testDate.getTimezoneOffset() / 60;

    let correctDate = new Date(Date.parse(dateStr));
    correctDate.setHours(correctDate.getHours() - offsetHours);
    const correctDateStr = correctDate.toLocaleString("sv");

    return correctDateStr;
}

function UsersCreate({ label }: CreateProps) {
    document.title = `${label} пользователя`
    const { id: userId } = useParams();

    const [username, setUsername] = useState("");
    const [isOnline, setIsOnline] = useState(false);
    const [lastSeen, setLastSeen] = useState("");
    const [status, setStatus] = useState("");
    const [avatar, setAvatar] = useState("");
    const [birthday, setBirthday] = useState("");
    const [education, setEducation] = useState("");
    const [hobbies, setHobbies] = useState("");
    const [maritalStatus, setMaritalStatus] = useState("");
    const [friends, setFriends] = useState<HasNameAndId[]>([]);
    const [groups, setGroups] = useState<HasNameAndId[]>([]);
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [toasts, setToasts] = useState<ToastType[]>([]);
    const [error, setError] = useState("");
    const [followers, setFollowers] = useState<HasNameAndId[]>([]);
    const [followed, setFollowed] = useState<HasNameAndId[]>([]);
    const [isDataLoading, setIsDataLoading] = useState(Boolean(userId));
    const [avatarIsLocal, setAvatarIsLocal] = useState(false);
    const [fileObj, setFileObj] = useState<File | null>(null);

    useEffect(() => {
        if (!userId) {
            setIsDataLoading(false);
            return;
        }

        setIsDataLoading(true);
        getUserDataByID(Number(userId))
            .then((data?: User & { username: string }, err?: Error) => {
                if (data) {
                    setUsername(data.username);
                    setIsOnline(Boolean(data.isOnline));
                    setLastSeen(getDateAccordingToTimezone(data.lastSeen) + getTimezoneOffset());
                    setStatus(data.status);
                    try {
                        const file = base64ToFile(data.avatar);
                        const fileUrl = URL.createObjectURL(file);

                        setAvatar(fileUrl);
                        setAvatarIsLocal(true);
                        setFileObj(file);
                    } catch (err) {
                        setAvatar(data.avatar);
                        setAvatarIsLocal(false);
                    }
                    setBirthday(data.birthday || "");
                    setEducation(data.education);
                    setHobbies(data.hobbies);
                    setMaritalStatus(data.maritalStatus);
                    setEmail(data.email);
                    setPhone(data.phone);
                    setPassword(data.password);
                    setError("");
                    setFriends(data.friends.map(item => {
                        return {
                            ...item,
                            name: item.username
                        }
                    }));
                    setFollowers(data.followers.map(item => {
                        return {
                            ...item,
                            name: item.username
                        }
                    }));
                    setFollowed(data.followed.map(item => {
                        return {
                            ...item,
                            name: item.username
                        }
                    }));
                    setGroups(data.groups);
                } else if (err) {
                    setError(err.message);
                }
            })
            .catch((err: Error) => setError(err.message))
            .finally(() => setIsDataLoading(false));
    }, [userId]);

    function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
        event.preventDefault();

        if ((email.trim() || phone.trim()) && password.trim()) {
            const response = postUserData();
            response.then(res => {
                if (res.ok) {
                    setToasts([...toasts, { headerContent: "Уведомление", bodyContent: "Данные успешно сохранены" }]);
                    setTimeout(() => window.location.href = "/", 500);
                } else {
                    setToasts([...toasts, { headerContent: "Ошибка", bodyContent: "Не удалось сохранить данные на сервере" }]);
                }
            })
        } else {
            const validationErrors = [] as ToastType[];
            if (!email.trim() && !phone.trim()) validationErrors.push({ headerContent: "Ошибка", bodyContent: "Введите email или телефон" });
            if (!password.trim()) validationErrors.push({ headerContent: "Ошибка", bodyContent: "Введите пароль" });
            setToasts([...toasts, ...validationErrors]);
        }
    }

    async function postUserData() {
        const base64Str = fileObj ? await fileToBase64(fileObj) : "";

        const reqBody = userId ? {
            id: userId,
            username: username,
            isOnline: isOnline,
            lastSeen: lastSeen,
            status: status,
            maritalStatus: maritalStatus,
            birthday: birthday,
            education: education,
            avatar: fileObj ? base64Str : avatar,
            hobbies: hobbies,
            groups: groups.map(item => item.id),
            friends: friends.map(item => item.id),
            followers: followers.map(item => item.id),
            followed: followers.map(item => item.id),
            email: email,
            phone: phone,
            password: password,
            userHash: ""
        } : {
            username: username,
            isOnline: isOnline,
            lastSeen: lastSeen,
            status: status,
            maritalStatus: maritalStatus,
            birthday: birthday,
            education: education,
            avatar: fileObj ? base64Str : avatar,
            hobbies: hobbies,
            groups: groups.map(item => item.id),
            friends: friends.map(item => item.id),
            followers: followers.map(item => item.id),
            followed: followers.map(item => item.id),
            email: email,
            phone: phone,
            password: password,
            userHash: ""
        }

        const response = fetch("/api/users", {
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
                <h2 className="heading heading-level-2">{label} пользователя</h2>
                {isDataLoading ? <p>Загрузка...</p> : error ? <p>Ошибка: {error}</p> :
                    <form className="create-form" onSubmit={handleSubmit}>
                        <Form.Check label="Пользователь онлайн" checked={isOnline} onChange={() => setIsOnline(!isOnline)} id="is-online" />
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px" }}>
                            <Form.Label htmlFor="user-username">Никнейм</Form.Label>
                            <Form.Control id="user-username" value={username} onChange={(event) => setUsername(event.target.value)} />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px" }}>
                            <Form.Label htmlFor="user-last-seen">Последний вход</Form.Label>
                            <Form.Control id="user-last-seen" type="datetime-local" value={lastSeen.slice(0, lastSeen.includes("+") ? lastSeen.lastIndexOf("+") : lastSeen.lastIndexOf("-"))} onChange={(event) => setLastSeen(event.target.value + getTimezoneOffset())} />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px" }}>
                            <Form.Label htmlFor="user-status">Статус</Form.Label>
                            <Form.Control id="user-status" value={status} onChange={(event) => setStatus(event.target.value)} />
                        </div>
                        <div className="avatar-add-wrapper">
                            <h3 className="heading heading-level-3">Аватар пользователя</h3>
                            <Tabs onSelect={key => {
                                if (key !== "local" && avatarIsLocal || key === "local" && !avatarIsLocal) {
                                    setAvatar("");
                                    setFileObj(null);
                                }
                                setAvatarIsLocal(key === "local");
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
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px" }}>
                            <Form.Label htmlFor="user-birthday">Дата рождения</Form.Label>
                            <Form.Control id="user-birthday" type="date" value={birthday} onChange={(event) => setBirthday(event.target.value)} />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px" }}>
                            <Form.Label htmlFor="user-education">Образование</Form.Label>
                            <Form.Control id="user-education" value={education} onChange={(event) => setEducation(event.target.value)} />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px" }}>
                            <Form.Label htmlFor="user-hobbies">Хобби</Form.Label>
                            <Form.Control id="user-hobbies" value={hobbies} onChange={(event) => setHobbies(event.target.value)} />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px" }}>
                            <Form.Label htmlFor="user-marital-status">Семейное положение</Form.Label>
                            <Form.Control id="user-marital-status" value={maritalStatus} onChange={(event) => setMaritalStatus(event.target.value)} />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px" }}>
                            <div>
                                <Form.Label>Друзья</Form.Label>
                            </div>
                            <AddByNameOrId entities={friends} ChangeEntities={setFriends} />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px" }}>
                            <div>
                                <Form.Label>Подписчики</Form.Label>
                            </div>
                            <AddByNameOrId entities={followers} ChangeEntities={() => setFollowers(followers => followers.filter(item => item.id !== Number(userId || 0)))} />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px" }}>
                            <div>
                                <Form.Label>Пользователи, на которых {username} подписан(а)</Form.Label>
                            </div>
                            <AddByNameOrId entities={followed} ChangeEntities={() => setFollowed(followed => followed.filter(item => item.id !== Number(userId || 0)))} />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px" }}>
                            <div>
                                <Form.Label>Группы</Form.Label>
                            </div>
                            <AddByNameOrId entityType="group" entities={groups} ChangeEntities={setGroups} buttonLabel="Добавить группу" infoLabel="Группы не выбраны" inputLabel="Название или ID группы" />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px" }}>
                            <Form.Label htmlFor="user-email">Email</Form.Label>
                            <Form.Control id="user-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px" }}>
                            <Form.Label htmlFor="user-phone">Телефон</Form.Label>
                            <Form.Control id="user-phone" value={phone} onChange={(event) => setPhone(event.target.value)} />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px" }}>
                            <Form.Label htmlFor="user-password">Пароль</Form.Label>
                            <Form.Control id="user-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
                        </div>
                        <Button type="submit" style={{ marginTop: "16px" }}>Сохранить</Button>
                    </form>
                }

                <CustomToastsContainer toasts={toasts} setToasts={setToasts} />
            </main>
        </>
    );
}

export default UsersCreate;
