import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { Button, Form } from "react-bootstrap";
import Header from "../Header";
import AddByNameOrId from "../AddByNameOrId";
import SearchByNameOrId from "../SearchByNameOrId";
import { type CreateProps, type HasNameAndId, type LoadingStatus, type Toast as ToastType, type Post } from "../types";
import "./PostsCreate.css"
import FileAttachment from "../FileAttachment";
import TextareaWithFormattingButtons from "../TextareaWithFormattingButtons";
import CustomToastsContainer from "../CustomToastsContainer";
import { fileToBase64 } from "../auxFunctions";

async function getPostDataByID(id: number) {
    const response = await fetch(`/api/posts/${id}`);
    if (!response.ok) {
        const errorDetails = await response.json();
        throw new Error(errorDetails.detail || "Ошибка загрузки поста");
    }
    return response.json();
}

async function getGroupOrUser(id: number, group: boolean,) {
    const queryPart = group ? "groups" : "users";
    const response = await fetch(`/api/${queryPart}/${id}`);
    if (response.ok) {
        return response.json();
    }

    return null;
}

function PostsCreate({ label }: CreateProps) {
    document.title = `${label} поста`
    const { id: postId } = useParams();

    const [postDate, setPostDate] = useState(new Date());
    const [isGroup, setIsGroup] = useState(false);
    const [attachedFiles, setAttachedFiles] = useState<{ url: string, fileData: string | File }[]>([]);
    const [isAddingFile, setIsAddingFile] = useState(false);
    const [newFileUrl, setNewFileUrl] = useState("");
    const [text, setText] = useState("");
    const [loadingStatus, setLoadingStatus] = useState<LoadingStatus>({ ok: 0, message: "Подождите, медиа загружается..." });
    const [usersLiked, setUsersLiked] = useState<HasNameAndId[]>([]);
    const [groupOrUser, setGroupOrUser] = useState({ name: "", id: -1 });
    const [groupOrUserValue, setGroupOrUserValue] = useState("");
    const [searchResults, setSearchResults] = useState<HasNameAndId[]>([]);
    const [searchResultsAreLoading, setSearchResultsAreLoading] = useState(false);
    const [toasts, setToasts] = useState<ToastType[]>([]);
    const [error, setError] = useState("");
    const [isDataLoading, setIsDataLoading] = useState(Boolean(postId));

    useEffect(() => {
        if (!postId) {
            setIsDataLoading(false);
            return;
        }

        setIsDataLoading(true);
        getPostDataByID(Number(postId))
            .then((data: Post) => {
                setPostDate(new Date(data.date));
                setIsGroup(data.isGroup);
                setText(data.text);
                setUsersLiked(data.usersLiked.map(item => {
                    return {
                        ...item,
                        name: item.username
                    }
                }));

                type ResType = {
                    id: number,
                    username: string,
                    name: never
                } | {
                    id: number,
                    username: never,
                    name: string
                }

                const userOrGroupId = getGroupOrUser(data.userOrGroupId, data.isGroup);
                userOrGroupId.then((res: ResType) => {
                    const groupOrUserName = res.username ? res.username : res.name

                    setGroupOrUserValue(`${groupOrUserName}, id: ${data.userOrGroupId}`)
                    setGroupOrUser({ id: data.userOrGroupId, name: groupOrUserName });
                    setSearchResults([{ id: data.userOrGroupId, name: groupOrUserName }]);
                    setSearchResultsAreLoading(false);
                });

                setError("");
                setToasts([]);
                setAttachedFiles(data.media);
                setIsAddingFile(false);
            })
            .catch((err: Error) => setError(err.message))
            .finally(() => setIsDataLoading(false));
    }, [postId]);

    function handleSubmit(event: React.SubmitEvent) {
        event.preventDefault();
        let toastsToAdd: ToastType[] = [];

        if (searchResults.includes(groupOrUser) && (text.trim() || attachedFiles.length)) {
            const response = postPostData();
            response.then(res => {
                if (res.ok) {
                    toastsToAdd.push({ headerContent: "Уведомление", bodyContent: "Данные успешно сохранены" });
                    setTimeout(() => window.location.href = "/", 500);
                } else {
                    toastsToAdd.push({ headerContent: "Ошибка", bodyContent: "Не удалось сохранить данные на сервере" });
                }
                setToasts(toasts.concat(toastsToAdd));
            })
        } else {
            if (!searchResults.includes(groupOrUser)) {
                toastsToAdd.push({ headerContent: "Ошибка", bodyContent: "Выберите пользователя или группу" });
            }
            if (!(text.trim() || attachedFiles.length)) {
                toastsToAdd.push({ headerContent: "Ошибка", bodyContent: "У поста должны быть текст и/или прикреплённые файлы" });
            }
            setToasts(toasts.concat(toastsToAdd));
        }
    }

    async function postPostData() {
        let filesToSend = [];
        for (let file of attachedFiles) {
            if (typeof file.fileData === "string") {
                filesToSend.push(file);
            } else {
                const base64Str = await fileToBase64(file.fileData);
                filesToSend.push({
                    ...file,
                    fileData: base64Str
                });
            }
        }

        const reqBody = postId ? {
            id: postId,
            date: postDate,
            media: filesToSend,
            usersLiked: usersLiked,
            text: text,
            isGroup: isGroup,
            userOrGroupId: groupOrUser.id
        } : {
            date: postDate,
            media: filesToSend,
            usersLiked: usersLiked,
            text: text,
            isGroup: isGroup,
            userOrGroupId: groupOrUser.id
        }
        const response = fetch("/api/posts", {
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
            < Header />
            <main className="main">
                <h2>{label} поста</h2>
                {isDataLoading ? <p>Загрузка...</p> : error ? <p>Ошибка: {error}</p> :
                    <form className="create-form" onSubmit={handleSubmit}>
                        <Form.Label htmlFor="post-date">Дата создания поста</Form.Label>
                        <Form.Control type="date" id="post-date" value={`${postDate.getFullYear()}-${String(postDate.getMonth() + 1).padStart(2, "0")}-${String(postDate.getDate()).padStart(2, "0")}`} onChange={event => {
                            let [year, month, day] = event.target.value.split("-").map(item => +item);
                            setPostDate(new Date(year, month - 1, day));
                        }} />
                        <Form.Label htmlFor="post-text">Текст поста</Form.Label>
                        <TextareaWithFormattingButtons id="post-text" text={text} setText={setText}/>
                        <Form.Check label="Это пост группы" id="is-group" checked={isGroup} onChange={() => setIsGroup(!isGroup)} />
                        <Form.Label htmlFor="group-or-user-id">ID {isGroup ? "или название группы" : "или имя пользователя"}</Form.Label>
                        <SearchByNameOrId entityType={isGroup ? "group" : "user"} id="group-or-user-id" inputValue={groupOrUserValue} searchResults={{ resultsArray: searchResults, areLoading: searchResultsAreLoading }} changeSearchResultsArray={setSearchResults} changeInputValue={setGroupOrUserValue} changeSearchResultsStatus={setSearchResultsAreLoading} changeEntity={setGroupOrUser} />
                        <FileAttachment newFileSrc={newFileUrl} setNewFileSrc={setNewFileUrl} loadingStatus={loadingStatus} setLoadingStatus={setLoadingStatus} isAddingFile={isAddingFile} setIsAddingFile={setIsAddingFile} attachedFiles={attachedFiles} setAttachedFiles={setAttachedFiles} />
                        <h3 className="heading heading-level-3">Пользователи, которым понравился пост</h3>
                        <AddByNameOrId entities={usersLiked} ChangeEntities={setUsersLiked} />
                        <Button type="submit" style={{ marginTop: "16px" }}>Сохранить</Button>
                    </form>
                }

                <CustomToastsContainer toasts={toasts} setToasts={setToasts} />
            </main>
        </>
    );
}

export default PostsCreate;