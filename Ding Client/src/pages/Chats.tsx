import { useState } from "react";
import Header from "../Header";
import Menu from "../Menu";
import { Button } from "@radix-ui/themes";
import { PlusIcon } from "@radix-ui/react-icons";
import { type Toast, type Chat as ChatType } from "../types";
import Chat from "./Chat";
import { getCookie } from "../auxFunctions";
import ToastsContainer from "../ToastsContainer";
import "./Chats.css"
import CreateChatDialog from "./CreateChatDialog";

function Chats() {   
    const [myChats, setMyChats] = useState<ChatType[]>([]);
    const [myId, setMyId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState({ myId: true, myChats: true });
    const [isCreatingChat, setIsCreatingChat] = useState(false);
    const [toasts, setToasts] = useState<Toast[]>([]);

    if (isLoading.myId) {
        const userResponse = fetch("/api/info-about-me", {
            headers: {
                "Authorization": `Bearer ${getCookie("jwt-token")}`
            }
        });
        userResponse.then(res => {
            if (res.ok) {
                return res.json()
            } else {
                throw new Error("Не удалось получить информацию о текущем пользователе");
            }
        }).then(json => {
            if (json) {
                setMyId(json.id);
            } else {

            }
        }).finally(() => setIsLoading({ ...isLoading, myId: false }));
    }

    if (myId && isLoading.myChats) {
        const response = fetch(`/api/user-chats/${myId}`);
        response.then(res => {
            if (res.ok) {
                return res.json();
            } else {
                setToasts(toasts.concat({ headerContent: "Ошибка", bodyContent: "Не удалось получить информацию о чатах" }));
            }
        }).then(json => {
            if (json) {
                setMyChats(json);
            }
        }).finally(() => setIsLoading({ ...isLoading, myChats: false }));
    }

    return (
        <>
            <title>Мои чаты</title>
            <div className="page-wrapper">
                <Header />
                <Menu />
                <main className="main">
                    <h2 className="heading">Мои чаты</h2>
                    <Button onClick={() => setIsCreatingChat(true)}><PlusIcon /> Создать новый чат</Button>
                    <div className="chats-wrapper">
                        {myChats.length ?
                            myChats.map(chat =>
                                <Chat key={chat.id} chatInfo={chat} currentUserId={myId ? myId : -1} toasts={toasts} setToasts={setToasts} />
                            ) : isLoading.myChats ? <p>Загрузка...</p> : <p>У Вас пока нет чатов</p>
                        }
                    </div>
                    {isCreatingChat ? "" : <ToastsContainer toasts={toasts} />}
                    <CreateChatDialog isOpen={isCreatingChat} setIsOpen={setIsCreatingChat}/>
                </main>
            </div>
        </>
    )
}

export default Chats;