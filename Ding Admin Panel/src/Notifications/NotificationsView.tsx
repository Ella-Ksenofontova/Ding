import { useEffect, useState } from "react";
import { Button, Table, Form } from "react-bootstrap";
import { Plus } from "react-bootstrap-icons";
import Header from "../Header";
import { type Notification, type Toast as ToastType } from "../types";
import CustomToastsContainer from "../CustomToastsContainer";

function NotificationsView() {
    document.title = `Просмотр уведомлений`
    const [isLoading, setIsLoading] = useState(true);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [error, setError] = useState("");
    const [toasts, setToasts] = useState<ToastType[]>([]);
    const [searchValue, setSearchValue] = useState("");

    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        const text = event.target.value;
        setSearchValue(text);

        const url = text ? `/api/search-notifications/${text}` : "/api/notifications";
        fetch(url)
            .then(res => {
                if (res.ok) return res.json();
                setToasts(toasts.concat({ headerContent: "Ошибка", bodyContent: "Не удалось загрузить результаты поиска" }));
            })
            .then(data => {
                if (data) setNotifications(data);
            });
    }

    async function requestDelete(notificationId: number) {
        const response = await fetch(`/api/notifications/${notificationId}`, {
            method: "DELETE"
        });

        if (response.ok) {
            setToasts(toasts.concat({ headerContent: "Уведомление", bodyContent: "Уведомление успешно удалено" }))
        } else {
            setToasts(toasts.concat({ headerContent: "Ошибка", bodyContent: "В процессе удаления уведомления произошла ошибка" }))
        }
    }

    async function getNotifications() {
        try {
            const response = await fetch("/api/notifications");
            if (response.ok) {
                const json = await response.json();
                setNotifications(json);
            } else {
                setError("При загрузке уведомлений произошла ошибка. Возможно, в консоли (Fn + F12) Вы найдёте дополнительную информацию.");
            }
        } catch {
            setError("При загрузке уведомлений произошла ошибка сети. Проверьте подключение.");
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        getNotifications();
    }, []);

    return (
        <>
            <Header />
            <main className="main">
                <h2 className="heading heading-level-2">Все уведомления</h2>
                <div className="tools">
                    <Form.Label htmlFor="search-notifications">Поиск уведомлений</Form.Label>
                    <Form.Control value={searchValue} id="search-notifications" placeholder="Введите текст или ID уведомления" onChange={handleChange} />
                    <Button as="a" href="/notifications-create" className="create-button"><Plus /> Создать новое</Button>
                </div>
                <div className="scrollable">
                    {isLoading ? <p>Загрузка...</p> : error ? <p>{error}</p> : notifications.length === 0 ? <p>Уведомлений пока нет. <a href="/notifications-create">Создать новое?</a></p> : <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th className="table-heading">ID</th>
                                <th className="table-heading">Сообщение</th>
                                <th className="table-heading">Прочитано?</th>
                                <th className="table-heading">ID пользователя</th>
                                <th className="table-heading"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {notifications.map((item) => (
                                <tr key={item.id}>
                                    <td>{item.id}</td>
                                    <td>{item.text}</td>
                                    <td>{item.isRead ? "Да" : "Нет"}</td>
                                    <td>{item.userID}</td>
                                    <td>
                                        <a href={`/notifications-edit/${item.id}`}>Редактировать</a> /
                                        <Button variant="link" style={{ padding: 0, border: "none", verticalAlign: "baseline" }} onClick={() => {
                                            requestDelete(item.id);
                                            setNotifications(notifications.filter(notification => notification !== item));
                                        }}>Удалить</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>}
                </div>
            </main>
            <CustomToastsContainer toasts={toasts} setToasts={setToasts} />
        </>
    );
}

export default NotificationsView;
