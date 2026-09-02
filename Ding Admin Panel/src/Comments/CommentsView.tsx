import { useEffect, useState } from "react";
import { Button, Table, Form } from "react-bootstrap";
import { Plus } from "react-bootstrap-icons";
import Header from "../Header";
import { type Comment, type Toast as ToastType } from "../types";
import CustomToastsContainer from "../CustomToastsContainer";

function CommentsView() {
    document.title = `Просмотр комментариев`
    const [isLoading, setIsLoading] = useState(true);
    const [comments, setComments] = useState<Comment[]>([]);
    const [error, setError] = useState("");
    const [toasts, setToasts] = useState<ToastType[]>([]);
    const [searchValue, setSearchValue] = useState("");

    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        const text = event.target.value;
        setSearchValue(text);

        const url = text ? `/api/search-comments/${text}` : "/api/comments";
        fetch(url)
            .then(res => {
                if (res.ok) return res.json();
                setToasts(toasts.concat({ headerContent: "Ошибка", bodyContent: "Не удалось загрузить результаты поиска" }));
            })
            .then(data => {
                if (data) setComments(data);
            });
    }

    async function requestDelete(commentId: number) {
        const response = await fetch(`/api/comments/${commentId}`, {
            method: "DELETE"
        });

        if (response.ok) {
            setToasts(toasts.concat({ headerContent: "Уведомление", bodyContent: "Комментарий успешно удалён" }))
        } else {
            setToasts(toasts.concat({ headerContent: "Ошибка", bodyContent: "В процессе удаления комментария произошла ошибка" }))
        }
    }

    async function getComments() {
        try {
            const response = await fetch("/api/comments");
            if (response.ok) {
                const json = await response.json();
                setComments(json);
            } else {
                setError("При загрузке комментариев произошла ошибка. Возможно, в консоли (Fn + F12) Вы найдёте дополнительную информацию.");
            }
        } catch {
            setError("При загрузке комментариев произошла ошибка сети. Проверьте подключение.");
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        getComments();
    }, []);

    return (
        <>
            <Header />
            <main className="main">
                <h2 className="heading heading-level-2">Все комментарии</h2>
                <div className="tools">
                    <Form.Label htmlFor="search-comments">Поиск комментариев</Form.Label>
                    <Form.Control value={searchValue} id="search-comments" placeholder="Введите текст или ID комментария" onChange={handleChange} />
                    <Button as="a" href="/comments-create" className="create-button"><Plus /> Создать новый</Button>
                </div>
                <div className="scrollable">
                    {isLoading ? <p>Загрузка...</p> : error ? <p>{error}</p> : comments.length === 0 ? <p>Комментариев пока нет. <a href="/comments-create">Создать новый?</a></p> :
                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                    <th className="table-heading">ID</th>
                                    <th className="table-heading">ID пользователя</th>
                                    <th className="table-heading">ID поста</th>
                                    <th className="table-heading">Дата</th>
                                    <th className="table-heading">Текст</th>
                                    <th className="table-heading"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {comments.map((item) => (
                                    <tr key={item.id}>
                                        <td>{item.id}</td>
                                        <td>{item.user_id}</td>
                                        <td>{item.post_id || "Неизвестно"}</td>
                                        <td>{isFinite(Date.parse(item.date)) ? `${new Date(Date.parse(item.date) + new Date().getTimezoneOffset() * 60 * 1000).toLocaleString()}` : "Неизвестно"}</td>
                                        <td>{item.text}</td>
                                        <td>
                                            <a href={`/comments-edit/${item.id}`}>Редактировать</a> /
                                            <Button variant="link" style={{ padding: 0, border: "none", verticalAlign: "baseline" }} onClick={() => {
                                                requestDelete(item.id);
                                                setComments(comments.filter(comment => comment !== item));
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

export default CommentsView;
