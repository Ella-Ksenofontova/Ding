import { useEffect, useState } from "react";
import { Button, Table, Form } from "react-bootstrap";
import { Plus } from "react-bootstrap-icons";
import Header from "../Header";
import { type Group, type Toast as ToastType } from "../types";
import "./GroupsView.css"
import CustomToastsContainer from "../CustomToastsContainer";

function GroupsView() {
    document.title = `Просмотр группы`
    const [isLoading, setIsLoading] = useState(true);
    const [groups, setGroups] = useState<Group[]>([]);
    const [error, setError] = useState("");
    const [toasts, setToasts] = useState<ToastType[]>([]);
    const [searchValue, setSearchValue] = useState("");

    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        const text = event.target.value;
        setSearchValue(text);

        const url = text ? `/api/search-groups/${text}` : "/api/groups";
        fetch(url)
            .then(res => {
                if (res.ok) return res.json();
                setToasts(toasts.concat({ headerContent: "Ошибка", bodyContent: "Не удалось загрузить результаты поиска" }));
            })
            .then(data => {
                if (data) setGroups(data);
            });
    }

    async function requestDelete(groupId: number) {
        const response = await fetch(`/api/groups/${groupId}`, {
            method: "DELETE"
        });

        if (response.ok) {
            setToasts(toasts.concat({ headerContent: "Уведомление", bodyContent: "Группа успешно удалена" }))
        } else {
            setToasts(toasts.concat({ headerContent: "Ошибка", bodyContent: "В процессе удаления группы произошла ошибка" }))
        }
    }

    async function getGroups() {
        try {
            const response = await fetch("/api/groups");
            if (response.ok) {
                const json = await response.json();
                setGroups(json);
            } else {
                setError("При загрузке групп произошла ошибка. Возможно, в консоли (Fn + F12) Вы найдёте дополнительную информацию.");
            }
        } catch {
            setError("При загрузке групп произошла ошибка сети. Проверьте подключение.");
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        getGroups();
    }, []);

    return (
        <>
            <Header />
            <main className="main">
                <h2 className="heading heading-level-2">Все группы</h2>
                <div className="tools">
                    <Form.Label htmlFor="search-groups">Поиск групп</Form.Label>
                    <Form.Control value={searchValue} id="search-groups" placeholder="Введите название или ID группы" onChange={handleChange} />
                    <Button as="a" href="/groups-create" className="create-button"><Plus /> Создать новую</Button>
                </div>
                <div className="scrollable">
                    {isLoading ? <p>Загрузка...</p> : error ? <p>{error}</p> : groups.length === 0 ? <p>Групп пока нет. <a href="/groups-create">Создать новую?</a></p> : <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th className="table-heading">ID</th>
                                <th className="table-heading">Название</th>
                                <th className="table-heading">Тема</th>
                                <th className="table-heading">Участники</th>
                                <th className="table-heading">Аватар</th>
                                <th className="table-heading"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {groups.map((item) => (
                                <tr key={item.id}>
                                    <td>{item.id}</td>
                                    <td>{item.name}</td>
                                    <td>{item.topic}</td>
                                    <td>{item.members.map(member => member.username).join(", ")}</td>
                                    <td className="avatar-column">{item.avatar}</td>
                                    <td>
                                        <a href={`/groups-edit/${item.id}`}>Редактировать</a> /
                                        <Button variant="link" style={{ padding: 0, border: "none", verticalAlign: "baseline" }} onClick={() => {
                                            requestDelete(item.id);
                                            setGroups(groups.filter(group => group !== item));
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

export default GroupsView;
