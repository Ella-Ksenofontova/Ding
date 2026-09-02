import { useEffect, useState } from "react";
import { type User, type Post as PostType, type Toast as ToastType, type Chat } from "../types";
import InfoAboutUser from "../InfoAboutUser";
import Post from "../Post";
import Header from "../Header";
import ToastsContainer from "../ToastsContainer";
import MyProfile from "./MyProfile";
import { getCookie, getFileFromBase64Safely } from "../auxFunctions";
import { TOAST_DURATION, MAX_RELATIONSHIPS_SHOWN } from "../aux_constants";
import "./UserProfile.css";
import Menu from "../Menu";
import { useParams } from "react-router";
import { Button, Dialog } from "@radix-ui/themes";
import { ChatBubbleIcon } from "@radix-ui/react-icons";
import noProfileImage from "../assets/noprofilephoto.png";

function UserProfile() {
    const [infoAboutUser, setInfoAboutUser] = useState<User | null>(null);
    const [infoAboutMe, setInfoAboutMe] = useState<User | null>(null);
    const [arePostsLoading, setArePostsLoading] = useState(true);
    const [userPosts, setUserPosts] = useState<PostType[]>([]);
    const [toasts, setToasts] = useState<ToastType[]>([]);

    const { id: userId } = useParams();

    useEffect(() => {
        if (userId) {
            const userResponse = fetch(`/api/users/${userId}`);
            userResponse.then(res => {
                if (res.ok) {
                    return res.json()
                } else {
                    setToasts(toasts.concat({ headerContent: "Ошибка", bodyContent: "Не удалось получить информацию о пользователе" }));
                    setTimeout(() => setToasts(toasts.filter((_, index) => index != toasts.length - 1)), TOAST_DURATION);
                }
            }).then(json => {
                if (json) {
                    setInfoAboutUser(json);
                }
            });
        }

        if (arePostsLoading && userId) {
            const postsResponse = fetch(`/api/user-posts/${userId}`);
            postsResponse.then(res => {
                if (res.ok) {
                    return res.json()
                } else {
                    setToasts(toasts.concat({ headerContent: "Ошибка", bodyContent: "Не удалось получить посты с сервера" }));
                    setTimeout(() => setToasts(toasts.filter((_, index) => index != toasts.length - 1)), TOAST_DURATION);
                }
            }).then(json => {
                setArePostsLoading(false);
                if (json) {
                    setUserPosts(json);
                };
            });

            if (getCookie("jwt-token")) {
                const response = fetch("/api/info-about-me", {
                    headers: {
                        "Authorization": `Bearer ${getCookie("jwt-token")}`
                    }
                });
                response.then(res => {
                    if (res.ok) {
                        return res.json()
                    } else {
                        throw new Error("Не удалось получить информацию о текущем пользователе");
                    }
                }).then(json => {
                    if (json) {
                        setInfoAboutMe(json);
                    }
                });
            }
        }
    }, [userId]);

    function handleChangeFriendshipStatus() {
        let updatedFriends = infoAboutUser?.friends.map(item => item.id);
        let updatedFollowers = infoAboutUser?.followers.map(item => item.id);

        if (infoAboutUser?.friends.map(item => item.id).includes(infoAboutMe?.id || -1)) {
            updatedFriends = updatedFriends?.filter(id => id !== infoAboutMe?.id);
        } else if (infoAboutUser?.followers.map(item => item.id).includes(infoAboutMe?.id || -1)) {
            updatedFollowers = updatedFollowers?.filter(id => id !== infoAboutMe?.id);
        } else {
            updatedFollowers = updatedFollowers?.concat(infoAboutMe?.id || -1);
        }

        const response = fetch("/api/users", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                ...infoAboutUser,
                groups: infoAboutUser?.groups.map(item => item.id),
                friends: updatedFriends || [],
                followers: updatedFollowers || []
            })
        });

        response.then(res => {
            if (!res.ok) {
                setToasts(toasts.concat({ headerContent: "Упс...", bodyContent: "Произошла ошибка" }));
            }
        })
    }

    if (!Boolean(infoAboutMe) || !Boolean(infoAboutUser) || arePostsLoading) {
        return (
            <>
                <title>Загрузка...</title>
                <div className="page-wrapper">
                    <Header />
                    <Menu />
                    <main className="main">
                        Загрузка...
                    </main>
                </div>
            </>
        )
    }


    if (infoAboutUser && infoAboutMe && infoAboutMe?.id === infoAboutUser?.id) return <MyProfile />
    return (
        <>
            <title>{`Профиль пользователя ${infoAboutUser?.username || "Неизвестно"}`}</title>
            <div className="page-wrapper">
                <Header />
                <Menu />
                <main className="main">
                    <InfoAboutUser infoAboutUser={infoAboutUser} isLoading={false} isMyProfile={false} />
                    <div className="user-buttons-panel">
                        <Button onClick={handleChangeFriendshipStatus} className="change-friendship-status">
                            {infoAboutUser?.friends.map(item => item.id).includes(infoAboutMe?.id || -1) ? "Удалить из друзей" : infoAboutUser?.followers.map(item => item.id).includes(infoAboutMe?.id || -1) ? "Заявка отправлена" : "Добавить в друзья"}
                        </Button>
                        <Button disabled={!infoAboutUser}
                            onClick={() => {
                                if (infoAboutUser) {
                                    const response = fetch(`/api/my-chat-with/${infoAboutUser.id}`, {
                                        headers: {
                                            "Authorization": `Bearer ${getCookie("jwt-token")}` || ""
                                        }
                                    });

                                    response.then(res => {
                                        if (res.ok) {
                                            return res.json();
                                        }

                                        setToasts(toasts.concat({ headerContent: "Упс...", bodyContent: "Произошла ошибка" }));
                                    }).then((data: Chat) => {
                                        if (data) window.location.href = `/chats/${data.id}`
                                    });
                                }
                            }}>
                            <ChatBubbleIcon /> Написать
                        </Button>
                    </div>
                    <div className="posts-and-relationships">
                        <div className="posts-wrapper">
                            {
                                userPosts.length === 0 ? arePostsLoading ? <p>Загрузка...</p> : <p>Постов пока нет</p> :
                                    userPosts.map(item =>
                                        <Post
                                            {...item}
                                            currentUser={{ username: infoAboutMe?.username || "", id: infoAboutMe?.id || -1 }}
                                        />
                                    )
                            }
                        </div>
                        <div className="relationship-wrapper">
                            <h3 className="heading">Друзья</h3>
                            {
                                infoAboutUser?.friends.length === 0 ? <p className="no-relationships">У пользователя пока нет друзей</p> :
                                    <ul className="relationship-list">
                                        {infoAboutUser?.friends.slice(0, MAX_RELATIONSHIPS_SHOWN).map(friend => (
                                            <li key={friend.id} className="relationship-item">
                                                <img src={getFileFromBase64Safely(friend.avatar || noProfileImage)} alt={`Аватар пользователя ${friend.username}`} className="user-avatar" />
                                                <a href={`/users/${friend.id}`}>{friend.username}</a>
                                            </li>
                                        ))}
                                        {Number(infoAboutUser?.friends.length) > MAX_RELATIONSHIPS_SHOWN ?
                                            <Dialog.Root>
                                                <Dialog.Trigger><Button>Посмотреть всех</Button></Dialog.Trigger>
                                                <Dialog.Content>
                                                    <ul className="relationship-list dialog-relationships-list">
                                                        {infoAboutUser?.friends.map(friend => (
                                                            <li key={friend.id} className="relationship-item">
                                                                <img src={getFileFromBase64Safely(friend.avatar || noProfileImage)} alt={`Аватар пользователя ${friend.username}`} className="user-avatar" />
                                                                <a href={`/users/${friend.id}`}>{friend.username}</a>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                    <Dialog.Close><Button>ОК</Button></Dialog.Close>
                                                </Dialog.Content>
                                            </Dialog.Root>
                                            : ""}
                                    </ul>
                            }
                            <h3 className="heading">Подписчики</h3>
                            {
                                infoAboutUser?.followers.length === 0 ? <p className="no-relationships">У пользователя пока нет подписчиков</p> :
                                    <ul className="relationship-list">
                                        {infoAboutUser?.followers.slice(0, MAX_RELATIONSHIPS_SHOWN).map(follower => (
                                            <li key={follower.id} className="relationship-item">
                                                <img src={getFileFromBase64Safely(follower.avatar || noProfileImage)} alt={`Аватар пользователя ${follower.username}`} className="user-avatar" />
                                                <a href={`/users/${follower.id}`}>{follower.username}</a>
                                            </li>
                                        ))}
                                        {Number(infoAboutUser?.followers.length) > MAX_RELATIONSHIPS_SHOWN ?
                                            <Dialog.Root>
                                                <Dialog.Trigger><Button>Посмотреть всех</Button></Dialog.Trigger>
                                                <Dialog.Content>
                                                    <ul className="relationship-list dialog-relationships-list">
                                                        {infoAboutUser?.followers.map(follower => (
                                                            <li key={follower.id} className="relationship-item">
                                                                <img src={getFileFromBase64Safely(follower.avatar || noProfileImage)} alt={`Аватар пользователя ${follower.username}`} className="user-avatar" />
                                                                <a href={`/users/${follower.id}`}>{follower.username}</a>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                    <Dialog.Close><Button>ОК</Button></Dialog.Close>
                                                </Dialog.Content>
                                            </Dialog.Root>
                                            : ""}
                                    </ul>
                            }
                            <h3 className="heading">Группы</h3>
                            {
                                infoAboutUser?.groups.length === 0 ? <p className="no-relationships">Пользователь пока не состоит ни в одной группе</p> :
                                    <ul className="relationship-list">
                                        {infoAboutUser?.groups.slice(0, MAX_RELATIONSHIPS_SHOWN).map(group => (
                                            <li key={group.id} className="relationship-item">
                                                <img src={getFileFromBase64Safely(group.avatar || noProfileImage)} alt={`Аватар группы ${group.name}`} className="group-avatar" />
                                                <a href={`/groups/${group.id}`}>{group.name}</a>
                                            </li>
                                        ))}
                                        {Number(infoAboutUser?.followers.length) > MAX_RELATIONSHIPS_SHOWN ?
                                            <Dialog.Root>
                                                <Dialog.Trigger><Button>Посмотреть всех</Button></Dialog.Trigger>
                                                <Dialog.Content>
                                                    <ul className="relationship-list dialog-relationships-list">
                                                        {infoAboutUser?.groups.map(group => (
                                                            <li key={group.id} className="relationship-item">
                                                                <img src={getFileFromBase64Safely(group.avatar || noProfileImage)} alt={`Аватар группы ${group.name}`} className="user-avatar" />
                                                                <a href={`/groups/${group.id}`}>{group.name}</a>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                    <Dialog.Close><Button>ОК</Button></Dialog.Close>
                                                </Dialog.Content>
                                            </Dialog.Root>
                                            : ""}
                                    </ul>
                            }
                        </div>
                    </div>
                    <ToastsContainer toasts={toasts} />
                </main>
            </div>
        </>
    )
}

export default UserProfile;