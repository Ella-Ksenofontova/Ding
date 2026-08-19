import { useState } from "react";
import { useParams } from "react-router";
import { base64ToFile, getCookie, getFileFromBase64Safely } from "../auxFunctions";
import type { Group, Toast, Post as PostType, HasUsernameAndId } from "../types";
import { Avatar, Button, Dialog } from "@radix-ui/themes";
import Header from "../Header";
import Menu from "../Menu";
import Post from "../Post";
import "./GroupPage.css";
import ToastsContainer from "../ToastsContainer";

function GroupPage() {
    const { id: groupId } = useParams();

    const [groupInfo, setGroupInfo] = useState<Group | null>(null);
    const [groupPosts, setGroupPosts] = useState<PostType[]>([]);
    const [groupAvatar, setGroupAvatar] = useState<string | File>("");
    const [isLoading, setIsLoading] = useState({ infoAboutGroup: true, myId: true, groupPosts: true });
    const [infoAboutMe, setInfoAboutMe] = useState<HasUsernameAndId | null>(null);
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [error, setError] = useState("");
    const [isMemberDialogOpen, setIsMemberDialogOpen] = useState(false);

    if (isLoading.myId) {
        const userResponse = fetch("/api/info-about-me", {
            headers: {
                "Authorization": `Bearer ${getCookie("jwt-token")}`
            }
        });
        userResponse.then(res => {
            if (res.ok) {
                return res.json()
            } else {
                setToasts(toasts.concat({ headerContent: "Ошибка", bodyContent: "Не удалось получить информацию о текущем пользователе" }))
            }
        }).then(json => {
            if (json) {
                setInfoAboutMe(json);
            }
        }).finally(() => setIsLoading({ ...isLoading, myId: false }));
    }

    if (isLoading.infoAboutGroup) {
        const response = fetch(`/api/groups/${groupId}`);
        response.then(res => {
            if (res.ok) {
                return res.json();
            } else {
                if (res.status === 404) {
                    setError("Группы с таким id не существует");
                } else {
                    setError("Неизвестная ошибка");
                }
            }
        }).then((json: Group) => {
            if (json) {
                setGroupInfo(json);
            }
        }).finally(() => setIsLoading({ ...isLoading, infoAboutGroup: false }));
    }

    if (isLoading.groupPosts) {
        const response = fetch(`/api/group-posts/${groupId}`);
        response.then(res => {
            if (res.ok) {
                return res.json();
            } else {
                setToasts(toasts.concat({ headerContent: "Ошибка", bodyContent: "Не удалось получить посты группы" }));
            }
        }).then((data: PostType[]) => {
            if (data) setGroupPosts(data);
        }).finally(() => setIsLoading({ ...isLoading, groupPosts: false }));
    }

    if (groupInfo?.avatar && !groupAvatar) {
        try {
            const avatarAsFile = base64ToFile(groupInfo.avatar);
            setGroupAvatar(avatarAsFile);
        } catch {
            setGroupAvatar(groupInfo.avatar);
        }
    }

    function handleChangeMembership() {
        if (groupInfo && groupInfo.members.map(item => item.id).includes(infoAboutMe?.id || 0)) {
            fetch(`/api/groups`, {
                method: "POST",
                body: JSON.stringify({
                    ...groupInfo,
                    members: groupInfo.members.filter(item => item.id !== (infoAboutMe?.id || -1))
                }),
                headers: {
                    "Content-Type": "application/json"
                }
            });

            setGroupInfo({
                ...groupInfo,
                members: groupInfo.members.filter(item => item.id !== (infoAboutMe?.id || -1))
            });
        } else if (groupInfo && infoAboutMe) {
            fetch(`/api/groups`, {
                method: "POST",
                body: JSON.stringify({
                    ...groupInfo,
                    members: groupInfo.members.concat(infoAboutMe)
                }),
                headers: {
                    "Content-Type": "application/json"
                }
            });

            setGroupInfo({
                ...groupInfo,
                members: groupInfo.members.concat(infoAboutMe)
            });
        }
    }

    return (
        <>
            <title>{groupInfo ? `Группа ${groupInfo.name}` : "Загрузка..."}</title>
            <div className="page-wrapper">
                <Header />
                <Menu />
                <main className="main">
                    {groupInfo ?
                        <div className="info-about-group">
                            <Avatar className="group-avatar" src={typeof groupAvatar === "string" ? groupAvatar : URL.createObjectURL(groupAvatar)} fallback={groupInfo.name[0]} />
                            <div className="main-info">
                                <h2 className="heading group-name">{groupInfo.name}</h2>
                                <div className="group-topic">{groupInfo.topic}</div>
                            </div>
                            <div className="group-members">Участников: {groupInfo.members.length} <Button className="view-members-button" onClick={() => setIsMemberDialogOpen(true)}>Посмотреть</Button></div>
                            <Button
                                className="change-membership-button"
                                variant={groupInfo.members.map(item => item.id).includes(infoAboutMe?.id || 0) ? "outline" : "solid"}
                                onClick={handleChangeMembership}
                            >
                                {groupInfo.members.map(item => item.id).includes(infoAboutMe?.id || 0) ? "Выйти из группы" : "Вступить в группу"}
                            </Button>
                        </div>
                        : isLoading.infoAboutGroup ? <p>Загрузка...</p> :
                            <p>Ошибка: ${error || "Неизвестная ошибка"}</p>
                    }
                    <div className="posts-wrapper">
                        {groupPosts.length ? groupPosts.map(post =>
                            <Post {...post} key={post.id} currentUser={infoAboutMe || undefined} />
                        ) : isLoading.groupPosts ? isLoading.infoAboutGroup ? "" : <p>Загрузка постов...</p> : <p>У группы пока нет постов</p>}
                    </div>
                    <ToastsContainer toasts={toasts} />
                </main>
                {
                    (groupInfo) ?
                        <Dialog.Root open={isMemberDialogOpen}>
                            <Dialog.Content>
                                <Dialog.Title>Участники</Dialog.Title>
                                <ul className="members-list">
                                    {
                                        groupInfo.members.map(
                                            member =>
                                                <li key={member.id} className="members-list-item"><Avatar className="member-avatar" src={getFileFromBase64Safely(member.avatar || "")} fallback={member.username[0]} /><a href={`/users/${member.id}`}>{member.username}</a></li>
                                        )
                                    }
                                </ul>
                                <Button onClick={() => setIsMemberDialogOpen(false)}>Закрыть</Button>
                            </Dialog.Content>
                        </Dialog.Root>
                        : ""
                }
            </div>
        </>
    )
}

export default GroupPage;