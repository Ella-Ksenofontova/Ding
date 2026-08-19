import { useState } from "react";
import Header from "../Header";
import Menu from "../Menu";
import { type Toast, type Game as GameType } from "../types";
import Game from "./Game";
import "./Games.css"

function Games() {
    const files = document.querySelectorAll(".game-preview") as NodeListOf<HTMLImageElement>;
    for (let file of files) {
        const src = file.src;
        try {
            URL.revokeObjectURL(src);
        } catch {
            // Here we don't have to do anythiing:)
        }
    }
    
    const [games, setGames] = useState<GameType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [toasts, setToasts] = useState<Toast[]>([]);

    if (isLoading) {
        const response = fetch("/api/games");

        response.then((res) => {
            if (res.ok) return res.json();
            setToasts(toasts.concat({ headerContent: "Ошибка", bodyContent: "Не удалось получить список игр" }))
        }).then((data) => {
            if (data) setGames(data)
        }).finally(() => setIsLoading(false));
    }

    return (
        <>
            <title>Игры</title>
            <div className="page-wrapper">
                <Header />
                <Menu />
                <main className="main">
                    <h2 className="heading">Игры</h2>
                    <div className="games-wrapper">
                        {games.length ? games.map(item =>
                            <Game key={item.id} name={item.name} id={item.id} isExternal={item.isExternal} description={item.description} preview={item.preview} />
                        ) : isLoading ? <p>Загрузка...</p> : <p>Игр пока нет. Следите за обновлениями!</p>}
                    </div>
                </main>
            </div>
        </>
    )
}

export default Games;