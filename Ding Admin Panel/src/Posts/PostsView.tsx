import { Button, Table, Form } from "react-bootstrap";
import { Plus } from "react-bootstrap-icons";
import Header from "../Header";
import { useEffect, useState } from "react";
import { type Post, type Toast as ToastType } from "../types";
import CustomToastsContainer from "../CustomToastsContainer";

function PostsView() {
    document.title = `Просмотр постов`
    const [isLoading, setIsLoading] = useState(true);
    const [posts, setPosts] = useState<Post[]>([]);
    const [error, setError] = useState("");
    const [toasts, setToasts] = useState<ToastType[]>([]);
    const [searchValue, setSearchValue] = useState("");

    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        const text = event.target.value;
        setSearchValue(text);

        const url = text ? `/api/search-posts/${text}` : "/api/posts";
        fetch(url)
            .then(res => {
                if (res.ok) return res.json();
                setToasts(toasts.concat({ headerContent: "Ошибка", bodyContent: "Не удалось загрузить результаты поиска" }));
            })
            .then(data => {
                if (data) setPosts(data);
            });
    }

    async function requestDelete(postId: number) {
        const response = await fetch(`/api/posts/${postId}`, {
            method: "DELETE"
        });

        if (response.ok) {
            setToasts(toasts.concat({ headerContent: "Уведомление", bodyContent: "Пост успешно удалён" }))
        } else {
            setToasts(toasts.concat({ headerContent: "Ошибка", bodyContent: "В процессе удаления поста произошла ошибка" }))
        }
    }

    async function getPosts() {
        try {
            const response = await fetch("/api/posts");
            if (response.ok) {
                const json = await response.json();
                setPosts(json);
            } else {
                setError("При загрузке постов произошла ошибка. Возможно, в консоли (Fn + F12) Вы найдёте дополнительную информацию.");
            }
        } catch {
            setError("При загрузке постов произошла ошибка сети. Проверьте подключение.");
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        getPosts();
    }, []);

    return (
        <>
            <Header />
            <main className="main">
                <h2 className="heading heading-level-2">Все посты</h2>
                <div className="tools">
                    <Form.Label htmlFor="search-posts">Поиск постов</Form.Label>
                    <Form.Control value={searchValue} id="search-posts" placeholder="Введите текст или ID поста" onChange={handleChange} />
                    <Button as="a" href="/posts-create" className="create-button"><Plus /> Создать новый</Button>
                </div>
                <div className="scrollable">
                    {isLoading ? <p>Загрузка...</p> : error ? <p>{error}</p> : posts.length === 0 ? <p>Постов пока нет. <a href="/posts-create">Создать новый?</a></p> : <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th className="table-heading">ID</th>
                                <th className="table-heading">Дата создания</th>
                                <th className="table-heading">Прикреплённые файлы</th>
                                <th className="table-heading">ID пользователей, которым понравился пост</th>
                                <th className="table-heading">Текст</th>
                                <th className="table-heading">Это пост группы?</th>
                                <th className="table-heading">ID пользователя/группы</th>
                                <th className="table-heading"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {posts.map((item) =>
                                <tr>
                                    <td>{item.id}</td>
                                    <td>{item.date.slice(0, 10)}</td>
                                    <td>{item.media.slice(0, 3).map(m => m.url).join(", ") + (item.media.length > 3 ? ` и ещё ${item.media.length - 3}` : "")}</td>
                                    <td>{item.usersLiked.map(user => user.id).slice(0, 3).join(", ") + (item.usersLiked.length > 3 ? ` и ещё ${item.usersLiked.length - 3}` : "")}</td>
                                    <td>{item.text}</td>
                                    <td>{item.isGroup ? "Да" : "Нет"}</td>
                                    <td>{item.userOrGroupId}</td>
                                    <td><a href={`/posts-edit/${item.id}`}>Редактировать</a> /
                                        <Button variant="link"
                                            style={{ padding: 0, border: "none", verticalAlign: "baseline" }}
                                            onClick={() => {
                                                requestDelete(item.id);
                                                setPosts(posts.filter(post => post !== item));
                                            }}>Удалить</Button></td>
                                </tr>
                            )}
                        </tbody>
                    </Table>}
                </div>
                <CustomToastsContainer toasts={toasts} setToasts={setToasts} />
            </main>
        </>
    )
}

export default PostsView;