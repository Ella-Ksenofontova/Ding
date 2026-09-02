import { useEffect, useState } from "react";
import { type Game, type Toast as ToastType } from "../types";
import Header from "../Header";
import { Button, Table, Form } from "react-bootstrap";
import { Plus } from "react-bootstrap-icons";
import "./GamesView.css";
import CustomToastsContainer from "../CustomToastsContainer";

function GamesView() {
    document.title = "Просмотр игр";
    const [isLoading, setIsLoading] = useState(true);
    const [games, setGames] = useState<Game[]>([]);
    const [toasts, setToasts] = useState<ToastType[]>([]);
    const [searchValue, setSearchValue] = useState("");

    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        const text = event.target.value;
        setSearchValue(text);

        const url = text ? `/api/search-games/${text}` : "/api/games";
        fetch(url)
            .then((response) => {
                if (response.ok) return response.json();
                setToasts(toasts.concat({ headerContent: "Ошибка", bodyContent: "Не удалось загрузить результаты поиска" }));
            })
            .then((data) => {
                if (data) setGames(data);
            });
    }

    useEffect(() => {
        fetch("/api/games")
            .then((response) => {
                if (response.ok) return response.json();
                setToasts(toasts.concat({ headerContent: "Ошибка", bodyContent: "Не удалось загрузить список игр" }));
            })
            .then((data) => {
                if (data) setGames(data);
            }).finally(() => setIsLoading(false));
    }, []);

    async function requestDelete(gameId: number) {
        const response = await fetch(`/api/games/${gameId}`, {
            method: "DELETE"
        });

        if (response.ok) {
            setToasts(toasts.concat({ headerContent: "Уведомление", bodyContent: "Игра успешно удалена" }));
            setGames(games.filter((game) => game.id !== gameId));
        } else {
            setToasts(toasts.concat({ headerContent: "Ошибка", bodyContent: "В процессе удаления игры произошла ошибка" }));
        }
    }

    return (
        <>
            <Header />
            <main className="main">
                <h2 className="heading heading-level-2">Все игры</h2>
                <div className="tools">
                    <Form.Label htmlFor="search-games">Поиск игр</Form.Label>
                    <Form.Control value={searchValue} id="search-games" placeholder="Введите название или ID игры" onChange={handleChange} />
                    <Button as="a" href="/games-create" className="create-button"><Plus /> Создать новую</Button>
                </div>
                <div className="scrollable">
                    {isLoading ? (
                        <p>Загрузка...</p>
                    ) : games.length === 0 ? (
                        <p>Пока нет игр. <a href="/games-create">Создать новую?</a></p>
                    ) : (
                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Название</th>
                                    <th>Описание</th>
                                    <th>Ссылка на игру</th>
                                    <th>Ссылка ведёт на другой сайт?</th>
                                    <th>Превью</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {games.map((game) => (
                                    <tr key={game.id}>
                                        <td>{game.id}</td>
                                        <td>{game.name}</td>
                                        <td>{game.description}</td>
                                        <td>{game.src}</td>
                                        <td>{game.isExternal ? "Да" : "Нет"}</td>
                                        <td className="preview-column">{game.preview ? game.preview.url : "-"}</td>
                                        <td><a href={`/games-edit/${game.id}`}>Редактировать</a> /
                                            <Button variant="link"
                                                style={{ padding: 0, border: "none", verticalAlign: "baseline" }}
                                                onClick={() => {
                                                    requestDelete(game.id);
                                                }}>Удалить</Button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </div>
                <CustomToastsContainer toasts={toasts} setToasts={setToasts} />
            </main>
        </>
    )
}

export default GamesView;