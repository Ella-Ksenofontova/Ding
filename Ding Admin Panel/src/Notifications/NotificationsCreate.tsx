import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { Button, Form } from "react-bootstrap";
import Header from "../Header";
import SearchByNameOrId from "../SearchByNameOrId";
import { type CreateProps, type HasNameAndId, type Toast as ToastType, type Notification } from "../types";
import TextareaWithFormattingButtons from "../TextareaWithFormattingButtons";
import CustomToastsContainer from "../CustomToastsContainer";

async function getNotificationDataByID(id: number) {
    const response = await fetch(`/api/notifications/${id}`);
    if (!response.ok) {
        const errorDetails = await response.json();
        throw new Error(errorDetails.detail || "Ошибка загрузки уведомления");
    }
    return response.json();
}

async function getUserName(userId: number) {
    const response = await fetch(`/api/users-admin/${userId}`);
    if (response.ok) {
        const json = await response.json();
        return json.username;
    }

    return null;
}

function NotificationsCreate({ label }: CreateProps) {
     document.title = `${label} уведомления`
    const { id: notificationId } = useParams();

    const [message, setMessage] = useState("");
    const [isRead, setIsRead] = useState(false);
    const [selectedUser, setSelectedUser] = useState<HasNameAndId>({ name: "", id: -1 });
    const [userInputValue, setUserInputValue] = useState("");
    const [userSearchResults, setUserSearchResults] = useState<HasNameAndId[]>([]);
    const [areUserSearchResultsLoading, setAreUserSearchResultsLoading] = useState(false);
    const [toasts, setToasts] = useState<ToastType[]>([]);
    const [error, setError] = useState("");
    const [isDataLoading, setIsDataLoading] = useState(Boolean(notificationId));

    useEffect(() => {
        if (!notificationId) {
            setIsDataLoading(false);
            return;
        }

        setIsDataLoading(true);
        getNotificationDataByID(Number(notificationId))
            .then((data: Notification) => {
                setMessage(data.text);
                setIsRead(Boolean(data.isRead));
                const userName = getUserName(data.userID);
                userName.then(userNameRes => {
                    setSelectedUser({ id: data.userID, name: userNameRes });
                });
                setError("");
            })
            .catch((err: Error) => setError(err.message))
            .finally(() => setIsDataLoading(false));
    }, [notificationId]);

    function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
        event.preventDefault();

        if (message.trim() && selectedUser.id !== -1) {
            const response = postNotificationData();
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
            if (!message.trim()) validationErrors.push({ headerContent: "Ошибка", bodyContent: "Введите сообщение" });
            if (selectedUser.id === -1) validationErrors.push({ headerContent: "Ошибка", bodyContent: "Выберите пользователя" });
            setToasts([...toasts, ...validationErrors]);
        }
    }

    function postNotificationData() {
        const reqBody = notificationId ? {
            id: notificationId,
            userID: selectedUser.id,
            isRead: isRead,
            text: message
        } : {
            userID: selectedUser.id,
            isRead: isRead,
            text: message
        }
        const response = fetch("/api/notifications", {
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
                <h2 className="heading heading-level-2">{label} уведомления</h2>
                {isDataLoading ? <p>Загрузка...</p> : error ? <p>Ошибка: {error}</p> :
                    <form className="create-form" onSubmit={handleSubmit}>
                        <Form.Label hrmlFor="message">Сообщение</Form.Label>
                        <TextareaWithFormattingButtons id="message" text={message} setText={setMessage}/>
                        <Form.Check label="Прочитано" checked={isRead} onChange={() => setIsRead(!isRead)} />
                        <p>Пользователь</p>
                        <SearchByNameOrId entityType="user" id="notification-user" inputValue={userInputValue} searchResults={{ resultsArray: userSearchResults, areLoading: areUserSearchResultsLoading }} changeInputValue={setUserInputValue} changeSearchResultsStatus={setAreUserSearchResultsLoading} changeSearchResultsArray={setUserSearchResults} changeEntity={setSelectedUser} />
                        <Button type="submit" style={{ marginTop: "16px" }}>Сохранить</Button>
                    </form>
                }

                <CustomToastsContainer toasts={toasts} setToasts={setToasts} />
            </main>
        </>
    );
}

export default NotificationsCreate;
