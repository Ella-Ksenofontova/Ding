import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router";
import type { Game, Toast } from "../types";
import Header from "../Header";
import Menu from "../Menu";
import "./GamePage.css"
import ToastsContainer from "../ToastsContainer";

function GamePage() {
    const { id: gameId } = useParams();
    const [isLoading, setIsLoading] = useState({ infoAboutGame: true, gameFile: true, rufflePlayer: true });
    const [gameInfo, setGameInfo] = useState<Game | null>(null);
    const [error, setError] = useState("");
    const [toasts, setToasts] = useState<Toast[]>([]);

    const scriptRef = useRef<HTMLScriptElement | null>(null);

    useEffect(() => {
        const response = fetch(`/api/games/${gameId}`);
        response.then(res => {
            if (res.ok) return res.json();
            if (res.status === 404) {
                setError("Игры с таким ID не существует");
            } else {
                setError("Неизвестная ошибка");
            }
        }).then(data => {
            if (data) setGameInfo(data);
        }).finally(() => setIsLoading({ ...isLoading, infoAboutGame: false }));
    }, []);

    if (isLoading.rufflePlayer && scriptRef.current) {
        scriptRef.current.addEventListener("load", () => setIsLoading({ ...isLoading, rufflePlayer: false }));
    }

    if (gameInfo && !gameInfo.isExternal && isLoading.gameFile && !isLoading.rufflePlayer) {
        try {
            window.RufflePlayer = window.RufflePlayer || {};
            window.RufflePlayer.config = {
                scale: "showAll",
                forceScale: true
            };
            const ruffle = window.RufflePlayer.newest();
            const player = ruffle.createPlayer();
            const container = document.getElementById("game-container");
            if (container) container.appendChild(player);

            player.addEventListener('loadedmetadata', () => {
                const meta = player.ruffle().metadata;
                if (meta) {
                    player.style.maxWidth = `100%`;
                    player.style.width = `min(${meta.width}px, 100%)`;
                    player.style.height = "unset";
                    player.style.aspectRatio = `${meta.width} / ${meta.height}`
                }
            });

            player.ruffle().load(gameInfo.src);
        } catch {
            setToasts(toasts.concat({ headerContent: "Ошибка", bodyContent: "Не удалось загрузить игру" }));
        } finally {
            setIsLoading({ ...isLoading, gameFile: false })
        }
    }

    return (
        <>
            <title>{isLoading.infoAboutGame ? "Загрузка..." : gameInfo ? gameInfo.name : "Ошибка"}</title>
            <div className="page-wrapper">
                <Header />
                <Menu />
                <main className="main">
                    {
                        gameInfo ?
                            <>
                                <h2 className="heading">{gameInfo.name}</h2>
                                {
                                    gameInfo.isExternal ? <iframe src={gameInfo.src} className="game-frame" /> :
                                        <div id="game-container" className="game-container">
                                            <p className="loading-game-message" hidden={!isLoading.rufflePlayer}>Загрузка...</p>
                                        </div>
                                }
                                <p>{gameInfo.description}</p>
                            </>
                            : isLoading.infoAboutGame ? <p>Загрузка</p> : <p>Ошибка: {error}</p>
                    }
                </main>
                <ToastsContainer toasts={toasts} />
                <script src="https://unpkg.com/@ruffle-rs/ruffle" async ref={scriptRef}></script>
            </div>
        </>
    )
}

export default GamePage;