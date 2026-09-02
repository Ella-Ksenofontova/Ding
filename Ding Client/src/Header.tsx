import logo from "./assets/logo.png"
import notificationsImg from "./assets/notifications.png"
import { VisuallyHidden } from "radix-ui";
import "./Header.css"
import { Button, Popover } from "@radix-ui/themes";
import { useEffect, useState } from "react";
import { type Notification } from "./types";
import { marked } from "https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js";
import DOMPurify from "dompurify";
import { CheckIcon } from "@radix-ui/react-icons";
import { getCookie } from "./auxFunctions";

function Header() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [myId, setMyId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState({ myNotifications: true, myId: true });

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

    useEffect(() => {
        if (myId) {
            const response = fetch(`/api/user-notifications/${myId}`);
            response.then(res => {
                if (res.ok) return res.json();
            }).then(data => {
                if (data) setNotifications(data);
            }).finally(() => setIsLoading({ ...isLoading, myNotifications: false }))
        }
    }, [myId]);

    function handleMarkAsRead(notification: Notification) {
        const reqBody = {
            ...notification,
            isRead: true
        };

        fetch(
            "/api/notifications",
            {
                method: "POST",
                body: JSON.stringify(reqBody),
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        setNotifications(notifications.filter(item => item.id !== notification.id).concat(reqBody));
    }

    return (
        <header className="header">
            <a href="/"><img src={logo} alt="Логотип Ding" className="header-logo" /></a>
            <VisuallyHidden.Root><h1>Ding - соцсеть для кукол</h1></VisuallyHidden.Root>
            <Popover.Root>
                <Popover.Trigger>
                    <button className={`notifications-button transparent-button ${notifications.filter(item => !item.isRead).length ? "have-new-notifications" : ""}`}>
                        <img src={notificationsImg} alt="Уведомления" className="notifications-button-image"/>
                    </button>
                </Popover.Trigger>
                <Popover.Content className="notifications-popover">
                    <ul className="notifications-list">
                        {notifications.length ? notifications.map(item =>
                            <li key={item.id} className={`notifications-list-item ${item.isRead ? "is-read" : ""}`}> <p className="notification-text" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(marked(item.text)) }} /> {item.isRead ? "" : <Button onClick={() => handleMarkAsRead(item)}><CheckIcon /> <VisuallyHidden.Root>Пометить как прочитанное</VisuallyHidden.Root></Button>}</li>
                        ) : isLoading.myNotifications ? <p>Загрузка...</p> : <p>Уведомлений пока нет</p>}
                    </ul>
                </Popover.Content>
            </Popover.Root>
        </header>
    )
}

export default Header;