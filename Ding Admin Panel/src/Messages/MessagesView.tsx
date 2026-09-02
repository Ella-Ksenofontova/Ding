import { useEffect, useState } from "react"
import Table from "react-bootstrap/Table"
import { Form } from "react-bootstrap"
import { Plus } from "react-bootstrap-icons"
import Header from "../Header";
import Button from "react-bootstrap/Button";
import {type Message} from "../types"
import { type Toast as ToastType } from "../types"
import CustomToastsContainer from "../CustomToastsContainer";

function MessagesView() {
     document.title = `Просмотр сообщений`
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [toasts, setToasts] = useState<ToastType[]>([]);
    const [searchValue, setSearchValue] = useState("");

    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        const text = event.target.value;
        setSearchValue(text);

        const url = text ? `/api/search-messages/${text}` : "/api/messages";
        fetch(url)
            .then(res => {
                if (res.ok) return res.json();
                setToasts(toasts.concat({ headerContent: "Ошибка", bodyContent: "Не удалось загрузить результаты поиска" }));
            })
            .then(data => {
                if (data) setMessages(data);
            });
    }

    async function requestDelete(messageId: number) {
        const response = await fetch(`/api/messages/${messageId}`, {
            method: "DELETE"
        });

        if (response.ok) {
            setToasts(toasts.concat({ headerContent: "Уведомление", bodyContent: "Сообщение успешно удалено" }))
        } else {
            setToasts(toasts.concat({ headerContent: "Ошибка", bodyContent: "В процессе удаления сообщения произошла ошибка" }))
        }
    }

    async function getMessages() {
        try {
            const response = await fetch("/api/messages");
            if (response.ok) {
                const json = await response.json();
                setMessages(json);
            } else {
                setError("При загрузке сообщений произошла ошибка. Возможно, в консоли (Fn + F12) Вы найдёте дополнительную информацию.");
            }
        } catch {
            setError("При загрузке сообщений произошла ошибка сети. Проверьте подключение.");
        } finally {
            setIsLoading(false);
        }
    }

   useEffect(() => {
        getMessages();
    }, []);

    return (
        <>
            <Header />
            <main className="main">
                <h2 className="heading heading-level-2">Все сообщения</h2>
                <div className="tools">
                    <Form.Label htmlFor="search-messages">Поиск сообщений</Form.Label>
                    <Form.Control value={searchValue} id="search-messages" placeholder="Введите текст, ID сообщения или ID чата" onChange={handleChange} />
                    <Button as="a" href="/messages-create" className="create-button"><Plus /> Создать новое</Button>
                </div>
                <div className="scrollable">
                    {messages.length === 0 ? (isLoading ? <p>Загрузка...</p> : error ? <p>{error}</p> : <p>Сообщений нет. <a href="/messages-create">Создать новое?</a></p>) :
                        <Table striped bordered hover>
                            <thead>
                                <th className="table-heading">ID</th>
                                <th className="table-heading">ID чата</th>
                                <th className="table-heading">Текст сообщения</th>
                                <th className="table-heading">ID отправителя</th>
                                <th className="table-heading">Генерируется?</th>
                                <th></th>
                            </thead>
                            <tbody>
                                {
                                    messages.map((item, index) =>
                                        <tr key={index}>
                                            <td>{item.id}</td>
                                            <td>{item.chatID}</td>
                                            <td>{item.text}</td>
                                            <td>{item.senderID}</td>
                                            <td>{item.imitate_generation ? "+" : "-"}</td>
                                            <td><a href={`/messages-edit/${item.id}`}>Редактировать</a> / 
                                                <Button variant="link"
                                                    style={{ padding: 0, border: "none", verticalAlign: "baseline" }}
                                                    onClick={() => {
                                                        requestDelete(item.id);
                                                        setMessages(messages.filter(message => message !== item));
                                                    }}>Удалить</Button></td>
                                        </tr>
                                    )
                                }
                            </tbody>
                        </Table>
                    }
                </div>
                <CustomToastsContainer toasts={toasts} setToasts={setToasts} />
            </main>
        </>
    )
}

export default MessagesView;