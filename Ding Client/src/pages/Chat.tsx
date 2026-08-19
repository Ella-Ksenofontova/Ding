import { useState, type SetStateAction } from "react";
import { type Message, type Chat as ChatType, type Toast, type User } from "../types";
import { base64ToFile } from "../auxFunctions";
import noProfilePhoto from "../assets/noprofilephoto.png";
import { IMAGE_EXTENSIONS, VIDEO_EXTENSIONS, AUDIO_EXTENSIONS } from "../aux_constants";
import "./Chat.css"

type ChatProps = {
    chatInfo: ChatType,
    currentUserId: number,
    toasts: Toast[],
    setToasts: React.Dispatch<SetStateAction<Toast[]>>
}

function getAttachedFileString(files: { url: string, fileData: string }[]) {
    const numberOfImages = files.filter(file => IMAGE_EXTENSIONS.includes(file.url.slice(file.url.lastIndexOf(".")))).length;
    const numberOfVideos = files.filter(file => VIDEO_EXTENSIONS.includes(file.url.slice(file.url.lastIndexOf(".")))).length;
    const numberOfAudios = files.filter(file => AUDIO_EXTENSIONS.includes(file.url.slice(file.url.lastIndexOf(".")))).length;

    const partsOfString = [] as string[];

    if (numberOfImages) partsOfString.push(`${numberOfImages} фото`);
    if (numberOfVideos) partsOfString.push(`${numberOfVideos} видео`);
    if (numberOfAudios) partsOfString.push(`${numberOfAudios} аудио`);

    if (!partsOfString.length) return "Ошибка: в сообщении нет ни текста, ни прикреплённых файлов!"

    return partsOfString.join(", ")
}

function Chat({ chatInfo, currentUserId, toasts, setToasts }: ChatProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [avatar, setAvatar] = useState<{url: string, fileData: string | File} | null>(chatInfo.avatar || null);

    if (isLoading) {
        const response = fetch(`/api/chat-messages/${chatInfo.id}`);
        response.then(res => {
            if (res.ok) {
                return res.json()
            } else {
                setToasts(toasts.concat({ headerContent: "Ошибка", bodyContent: "Не удалось получить сообщения чата" }));
            }
        }).then(json => {
            if (json) setMessages(json);
        }).finally(() => setIsLoading(false));
    }

    function updateAvatar(userId: number) {
        const response = fetch(`/api/users/${userId}`);
        response.then(res => {
            if (res.ok) return res.json();
        }).then((data: User) => {
            if (data) {
                const avatar = data.avatar;
                if (avatar) {
                    try {
                        const fileData = base64ToFile(avatar);
                        setAvatar({ url: "Аватар", fileData: fileData });
                    } catch {
                        setAvatar({ url: avatar, fileData: avatar });
                    }
                }
            }
        })
    }

    if ((!chatInfo.avatar || !chatInfo.avatar.fileData) && (!avatar || !avatar.fileData) && chatInfo.participants.length === 2) {
        const secondUser = chatInfo.participants.filter(item => item.id !== currentUserId)[0];
        updateAvatar(secondUser.id);
    }

    return (
        <div className="chat">
            {avatar && avatar.fileData ? <img src={typeof avatar.fileData === "string" ? (avatar.fileData === avatar.url ? avatar.fileData : URL.createObjectURL(base64ToFile(avatar.fileData))) : URL.createObjectURL(avatar.fileData)} alt="Фото чата" className="chat-avatar" /> : <img src={noProfilePhoto} alt="Фото чата по умолчанию" className="chat-avatar" />}
            <h3 className="heading chat-name"><a className="chat-link" href={`/chats/${chatInfo.id}`}>{chatInfo.is_name_auto_generated ? chatInfo.participants.filter(item => item.id != currentUserId)[0].username : chatInfo.name}</a></h3>
            <div className="last-message">{messages.length ? (messages[messages.length - 1].text ? messages[messages.length - 1].text : (getAttachedFileString(messages[messages.length - 1].media || []))) : (isLoading ? "Загрузка..." : "Нет сообщений")}</div>
        </div>
    )
}

export default Chat;