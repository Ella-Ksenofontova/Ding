import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { Button, Form } from "react-bootstrap";
import Header from "../Header";
import { type CreateProps, type LoadingStatus, type Toast as ToastType, type HasNameAndId } from "../types";
import FileAttachment from "../FileAttachment";
import SearchByNameOrId from "../SearchByNameOrId";
import TextareaWithFormattingButtons from "../TextareaWithFormattingButtons";
import CustomToastsContainer from "../CustomToastsContainer";

async function getCommentDataByID(id: number) {
    const response = await fetch(`/api/comments/${id}`);
    if (response.ok) {
        const json = response.json();
        return json;
    }
    const errorDetails = await response.json();
    throw new Error(errorDetails.detail);
}

async function getUserName(userId: number) {
    const response = await fetch(`/api/users-admin/${userId}`);
    if (response.ok) {
        const json = await response.json();
        return json.username;
    }

    return null;
}


type Comment = {
    userOrGroupID: number,
    post_id: number,
    date: string,
    text: string
}

function CommentsCreate({ label }: CreateProps) {
    document.title = `${label} комментария`
    const { id: commentId } = useParams();

    const [userValue, setUserValue] = useState("");
    const [user, setUser] = useState({ name: "", id: -1 });
    const [userSearchResults, setUserSearchResults] = useState<HasNameAndId[]>([]);
    const [areSearchResultsLoading, setAreSearchResultsLoading] = useState(false);
    const [postID, setPostID] = useState("");
    const [date, setDate] = useState("");
    const [text, setText] = useState("");
    const [toasts, setToasts] = useState<ToastType[]>([]);
    const [error, setError] = useState("");
    const [isDataLoading, setIsDataLoading] = useState(Boolean(commentId));
    const [attachedFiles, setAttachedFiles] = useState<{ url: string, fileData: string | File }[]>([]);
    const [isAddingFile, setIsAddingFile] = useState(false);
    const [newFileUrl, setNewFileUrl] = useState("");
    const [loadingStatus, setLoadingStatus] = useState<LoadingStatus>({ ok: 0, message: "Подождите, медиа загружается..." });

    useEffect(() => {
        if (!commentId) {
            setIsDataLoading(false);
            return;
        }

        const data = getCommentDataByID(Number(commentId));
        data.then((res: Comment) => {
            const userName = getUserName(res.userOrGroupID);
            userName.then(nameRes => {
                const newUser = { id: res.userOrGroupID, name: nameRes }
                setUser(newUser);
                setUserSearchResults([newUser]);
                setUserValue(`${nameRes}, ID: ${res.userOrGroupID}`)
            });
            setPostID(String(res.post_id));
            setDate(res.date.slice(0, 16) || "");
            setText(res.text);
            setError("");
        })
            .catch((err: Error) => setError(err.message))
            .finally(() => setIsDataLoading(false))
    }, [commentId]);

    function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
        event.preventDefault();

        if (userSearchResults.includes(user) && postID.trim() && text.trim()) {
            const response = postCommentData();
            response.then(res => {
                if (res.ok) {
                    setToasts([...toasts, { headerContent: "Уведомление", bodyContent: "Данные успешно сохранены" }]);
                    setTimeout(() => window.location.href = "/", 500);
                } else {
                    setToasts([...toasts, { headerContent: "Ошибка", bodyContent: "Не удалось сохранить данные на сервере" }]);
                }
            });
        } else {
            const validationErrors = [] as ToastType[];
            if (!userSearchResults.includes(user)) validationErrors.push({ headerContent: "Ошибка", bodyContent: "Выберите пользователя" });
            if (!postID.trim()) validationErrors.push({ headerContent: "Ошибка", bodyContent: "Введите ID поста" });
            if (!text.trim()) validationErrors.push({ headerContent: "Ошибка", bodyContent: "Введите текст комментария" });
            setToasts([...toasts, ...validationErrors]);
        }
    }

    function postCommentData() {
        const reqBody = commentId ? {
            id: commentId,
            post_id: postID,
            userOrGroupID: user.id,
            date: date,
            text: text
        } : {
            post_id: postID,
            userOrGroupID: user.id,
            date: date,
            text: text
        }
        const response = fetch("/api/comments", {
            method: "POST",
            body: JSON.stringify(reqBody),
            headers: {
                'Content-Type': 'application/json'
            },
        });

        return response;
    }

    return (
        <>
            <Header />
            <main className="main">
                <h2 className="heading heading-level-2">{label} комментария</h2>
                {isDataLoading ? <p>Загрузка...</p> : error ? <p>Ошибка: {error}</p> :
                    <form className="create-form" onSubmit={handleSubmit}>
                        <Form.Label htmlFor="comment-user-id">Пользователь</Form.Label>
                        <SearchByNameOrId id="comment-user-id" inputValue={userValue} searchResults={{ resultsArray: userSearchResults, areLoading: areSearchResultsLoading }} changeSearchResultsArray={setUserSearchResults} changeSearchResultsStatus={setAreSearchResultsLoading} changeEntity={setUser} changeInputValue={setUserValue} />
                        <Form.Label htmlFor="comment-post-id">ID поста</Form.Label>
                        <Form.Control id="comment-post-id" type="number" value={postID} onChange={(event) => setPostID(event.target.value)} />
                        <Form.Label htmlFor="comment-date">Дата</Form.Label>
                        <Form.Control id="comment-date" type="datetime-local" value={date} onChange={(event) => setDate(event.target.value)} />
                        <Form.Label htmlFor="comment-text">Текст</Form.Label>
                        <TextareaWithFormattingButtons id="comment-text" text={text} setText={setText} />
                        <FileAttachment newFileSrc={newFileUrl} setNewFileSrc={setNewFileUrl} loadingStatus={loadingStatus} setLoadingStatus={setLoadingStatus} isAddingFile={isAddingFile} setIsAddingFile={setIsAddingFile} attachedFiles={attachedFiles} setAttachedFiles={setAttachedFiles} />
                        <Button type="submit" style={{ marginTop: "16px" }}>Сохранить</Button>
                    </form>
                }

                <CustomToastsContainer toasts={toasts} setToasts={setToasts} />
            </main>
        </>
    );
}

export default CommentsCreate;
