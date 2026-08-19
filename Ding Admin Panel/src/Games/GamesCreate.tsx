import { useEffect, useState } from "react";
import { type Game, type CreateProps, type Toast } from "../types";
import Header from "../Header";
import { Form, Button, Tabs, Tab } from "react-bootstrap";
import GamePreview from "./GamePreview";
import { useParams } from "react-router";
import CustomToastsConatiner from "../CustomToastsContainer";
import { IMAGE_EXTENSIONS } from "../auxConstants";
import { base64ToFile, fileToBase64 } from "../auxFunctions";

function GamesCreate({ label }: CreateProps) {
    document.title = `${label} игры`;
    const { id: gameId } = useParams();

    const [gameName, setGameName] = useState("");
    const [gameDescription, setGameDescription] = useState("");
    const [gameSrc, setGameSrc] = useState("");
    const [isExternal, setIsExternal] = useState(false);
    const [gamePreview, setGamePreview] = useState<{ url: string, fileData: string | File } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [previewIsLocal, setPreviewIsLocal] = useState(false);
    const [toasts, setToasts] = useState<Toast[]>([]);

    useEffect(() => {
        if (!gameId) {
            setIsLoading(false);
            return;
        }

        if (isLoading) {
            fetch(`/api/games/${gameId}`)
                .then(res => {
                    if (res.ok) return res.json();
                    if (res.status === 404) setError("Игры с таким ID не существует");
                    if (res.status === 502) setError("Не удалось подключиться к серверу. Попробуйте позже.");
                })
                .then((data: Game) => {
                    if (data) {
                        try {
                            if (data.preview) {
                                const file = base64ToFile(data.preview.fileData);
                                setGamePreview({ ...data.preview, fileData: file });
                                setPreviewIsLocal(true);
                            }
                        } catch {
                            setGamePreview(data.preview || null);
                        }

                        setGameName(data.name);
                        setGameDescription(data.description || "");
                        setGameSrc(data.src);
                        setIsExternal(data.isExternal);

                    }
                }).finally(() => {
                    setIsLoading(false);
                });
        }
    }, [gameId]);

    async function postGameData() {
        const fileStr = gamePreview?.fileData instanceof File ? await fileToBase64(gamePreview.fileData) : gamePreview?.fileData || "";

        const responseBody = gameId ? {
            id: gameId,
            name: gameName,
            description: gameDescription,
            src: gameSrc,
            isExternal: isExternal,
            preview: gamePreview ? {
                url: gamePreview.url,
                fileData: fileStr
            } : null
        } : {
            name: gameName,
            description: gameDescription,
            src: gameSrc,
            isExternal: isExternal,
            preview: gamePreview ? {
                url: gamePreview.url,
                fileData: fileStr
            } : null
        };

        const response = await fetch("/api/games", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(responseBody)
        });

        if (response.ok) {
            setToasts([...toasts, { headerContent: "Уведомление", bodyContent: "Данные успешно сохранены" }]);
            setTimeout(() => window.location.href = "/", 500);
        } else {
            setToasts([...toasts, { headerContent: "Ошибка", bodyContent: "Не удалось сохранить данные на сервере" }]);
        }
    }

    function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        if (gameName.trim() && gameSrc.trim()) {
            postGameData();
        } else if (!gameName.trim()) {
            setToasts([...toasts, { headerContent: "Ошибка", bodyContent: "Укажите название игры" }]);
        } else if (!gameSrc.trim()) {
            setToasts([...toasts, { headerContent: "Ошибка", bodyContent: "Укажите ссылку на игру" }]);
        }
    }

    return (
        <>
            <Header />
            <main className="main">
                <h2 className="heading heading-level-2">{label} игры</h2>
                {
                    isLoading ? <p>Загрузка...</p> : error ? <p className="error">Ошибка: {error}</p> :
                        <form className="form" onSubmit={handleSubmit}>
                            <Form.Label>Название игры</Form.Label>
                            <Form.Control type="text" value={gameName} onChange={(e) => setGameName(e.target.value)} />
                            <Form.Label>Описание игры</Form.Label>
                            <Form.Control as="textarea" rows={3} value={gameDescription} onChange={(e) => setGameDescription(e.target.value)} />
                            <Form.Label>Ссылка на файл с игрой</Form.Label>
                            <Form.Control type="text" value={gameSrc} onChange={(e) => setGameSrc(e.target.value)} />
                            <Form.Check id="is-external" type="checkbox" label="Ссылка ведёт на другой сайт" checked={isExternal} onChange={(e) => setIsExternal(e.target.checked)} />
                            <div className="avatar-add-wrapper">
                                <h3 className="heading heading-level-3">Превью игры</h3>
                                <Tabs onSelect={key => {
                                    if (key === "local" && previewIsLocal || key !== "local" && !previewIsLocal) {
                                        setGamePreview({ url: "", fileData: "" });
                                    }
                                    setPreviewIsLocal(key === "local")
                                }} activeKey={previewIsLocal ? "local" : "internet-link"}>
                                    <Tab title="Из Интернета" eventKey="internet-link">
                                        <div className="avatar-add-wrapper">
                                            <Form.Label htmlFor="group-avatar">Ссылка на превью</Form.Label>
                                            <Form.Control id="group-avatar" value={gamePreview?.url || ""} onChange={(event) => setGamePreview(
                                                { url: event.target.value, fileData: event.target.value }
                                            )} />
                                        </div>
                                    </Tab>
                                    <Tab title="Из локального хранилища" eventKey="local">
                                        <div className="avatar-add-wrapper">
                                            <input type="file" id="file-picker" hidden accept="image/*" onChange={event => {
                                                const file = event.target.files?.item(0);
                                                if (file) {
                                                    if (IMAGE_EXTENSIONS.includes(file.name.slice(file.name.lastIndexOf(".")))) {
                                                        setGamePreview({ url: file.name, fileData: file });
                                                    }
                                                }
                                            }} />
                                            <Button onClick={() => {
                                                document.getElementById("file-picker")?.click();
                                            }}>Выбрать файл</Button>
                                        </div>
                                    </Tab>
                                </Tabs>
                                <div className="preview" style={{ marginTop: "10px" }}>
                                    <GamePreview fileData={gamePreview?.fileData || ""} alt="Превью игры" emptyMessage={`${previewIsLocal ? "Выберите файл" : "Введите ссылку"}, чтобы увидеть предпросмотр`} isLocal={previewIsLocal} />
                                </div>
                            </div>
                            <Button type="submit" variant="primary">Сохранить изменения</Button>
                        </form>
                }
                <CustomToastsConatiner  toasts={toasts} setToasts={setToasts} />
            </main>
        </>
    )
}

export default GamesCreate;