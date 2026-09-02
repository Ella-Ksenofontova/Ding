import { useEffect, useState } from "react";
import { type Toast, type User } from "../types";
import { getCookie } from "../auxFunctions";
import Header from "../Header";
import Menu from "../Menu";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import Friend from "./Friend";
import ToastsContainer from "../ToastsContainer";
import "./Friends.css"

function Friends() {
    const [myFriends, setMyFriends] = useState<User[]>([]);
    const [myId, setMyId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState({ myId: true, myFriends: true });
    const [toasts, setToasts] = useState<Toast[]>([]);

    useEffect(() => {
        const userResponse = fetch("/api/info-about-me", {
            headers: {
                "Authorization": `Bearer ${getCookie("jwt-token")}`
            }
        });
        userResponse.then(res => {
            if (res.ok) {
                return res.json()
            } else {
                throw new Error("Не удалось получить информацию о текущем пользователе");
            }
        }).then(json => {
            if (json) {
                setMyId(json.id);
            } else {

            }
        }).finally(() => setIsLoading({ ...isLoading, myId: false }));
    }, []);

    if (myId && isLoading.myFriends) {
        const response = fetch(`/api/user-friends/${myId}`);
        response.then(res => {
            if (res.ok) {
                return res.json();
            } else {
                setToasts(toasts.concat({ headerContent: "Ошибка", bodyContent: "Не удалось получить информацию о друзьях" }));
            }
        }).then(json => {
            if (json) {
                setMyFriends(json);
            }
        }).finally(() => setIsLoading({ ...isLoading, myFriends: false }));
    }

    return (
        <>
            <title>Мои друзья</title>
            <div className="page-wrapper">
                <Header />
                <Menu />
                <main className="main">
                    <h2 className="heading">Мои друзья</h2>
                    <a className="search-friends" href="/search-users"><MagnifyingGlassIcon /><span>Искать друзей</span></a>
                    <div className="friends-wrapper">
                        {myFriends.length ?
                            myFriends.map(friend =>
                                <Friend key={friend.id} friendInfo={friend} />
                            ) : isLoading.myFriends ? <p>Загрузка...</p> : <p>У Вас пока нет друзей</p>
                        }
                    </div>
                    <ToastsContainer toasts={toasts} />
                </main>
            </div>
        </>
    )
}

export default Friends;