import { useState } from "react";
import { Button, Table, Form } from "react-bootstrap";
import { Plus } from "react-bootstrap-icons";
import Header from "../Header";
import { type User, type Toast as ToastType } from "../types";
import CustomToastsContainer from "../CustomToastsContainer";

function UsersView() {
    document.title = `Просмотр пользователей`
    const [isLoading, setIsLoading] = useState(true);
    const [users, setUsers] = useState<User[] & { username?: string }[]>([]);
    const [error, setError] = useState("");
    const [toasts, setToasts] = useState<ToastType[]>([]);
    const [searchValue, setSearchValue] = useState("");

    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        const text = event.target.value;
        setSearchValue(text);

        const url = text ? `/api/search-users/${text}` : "/api/users";
        fetch(url)
            .then(res => {
                if (res.ok) return res.json();
                setToasts(toasts.concat({ headerContent: "Ошибка", bodyContent: "Не удалось загрузить результаты поиска" }));
            })
            .then(data => {
                if (data) setUsers(data);
            });
    }

    async function requestDelete(userId: number) {
        const response = await fetch(`/api/users/${userId}`, {
            method: "DELETE"
        });

        if (response.ok) {
            setToasts(toasts.concat({ headerContent: "Уведомление", bodyContent: "Пользователь успешно удалён" }))
        } else {
            setToasts(toasts.concat({ headerContent: "Ошибка", bodyContent: "В процессе удаления пользователя произошла ошибка" }))
        }
    }

    async function getUsers() {
        try {
            const response = await fetch("/api/users");
            if (response.ok) {
                const json = await response.json();
                setUsers(json);
            } else {
                setError("При загрузке пользователей произошла ошибка. Возможно, в консоли (Fn + F12) Вы найдёте дополнительную информацию.");
            }
        } catch {
            setError("При загрузке пользователей произошла ошибка сети. Проверьте подключение.");
        } finally {
            setIsLoading(false);
        }
    }

    if (isLoading) {
        getUsers();
    }

    return (
        <>
            <Header />
            <main className="main">
                <h2 className="heading heading-level-2">Все пользователи</h2>
                <div className="tools">
                    <Form.Label htmlFor="search-users">Поиск пользователей</Form.Label>
                    <Form.Control value={searchValue} id="search-users" placeholder="Введите никнейм или ID пользователя" onChange={handleChange} />
                    <Button as="a" href="/users-create" className="create-button"><Plus /> Создать нового</Button>
                </div>
                <div className="scrollable">
                    {isLoading ? <p>Загрузка...</p> : error ? <p>{error}</p> : users.length === 0 ? <p>Пользователей пока нет. <a href="/users-create">Создать нового?</a></p> : <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th className="table-heading">ID</th>
                                <th className="table-heading">Никнейм</th>
                                <th className="table-heading">Онлайн?</th>
                                <th className="table-heading">Последний вход</th>
                                <th className="table-heading">Статус</th>
                                <th className="table-heading">Email</th>
                                <th className="table-heading">Телефон</th>
                                <th className="table-heading"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((item) => (
                                <tr key={item.id}>
                                    <td>{item.id}</td>
                                    <td>{item.username}</td>
                                    <td>{item.isOnline ? "Да" : "Нет"}</td>
                                    <td>{isFinite(Date.parse(item.lastSeen)) ? `${new Date(Date.parse(item.lastSeen) - new Date().getTimezoneOffset() * 60 * 1000).toLocaleString()}` : "Неизвестно"}</td>
                                    <td>{item.status}</td>
                                    <td>{item.email}</td>
                                    <td>{item.phone}</td>
                                    <td>
                                        <a href={`/users-edit/${item.id}`}>Редактировать</a> /
                                        <Button variant="link" style={{ padding: 0, border: "none", verticalAlign: "baseline" }} onClick={() => {
                                            requestDelete(item.id);
                                            setUsers(users.filter(user => user !== item));
                                        }}>Удалить</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>}
                </div>
                <CustomToastsContainer toasts={toasts} setToasts={setToasts} />
            </main>
        </>
    );
}

export default UsersView;
