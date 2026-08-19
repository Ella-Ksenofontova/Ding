import { Skeleton, Avatar, Button, Popover, IconButton } from "@radix-ui/themes"
import { HeartIcon, HeartFilledIcon, ChatBubbleIcon, Share2Icon, DotsHorizontalIcon, PlusIcon, InfoCircledIcon } from "@radix-ui/react-icons";
import { VisuallyHidden } from "radix-ui";
import { type Post as PostType, type Toast as ToastType, type Group, type User, type HasUsernameAndId, type Comment } from "./types"
import { useState, type SetStateAction, useRef } from "react"
import { marked } from "https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js";
import DOMPurify from "dompurify";
import "./Post.css"
import { base64ToFile, fileToBase64, getFileFromBase64Safely } from "./auxFunctions";
import { AUDIO_EXTENSIONS, IMAGE_EXTENSIONS, VIDEO_EXTENSIONS } from "./aux_constants";
import ToastsContainer from "./ToastsContainer";
import TextareaWithFormattingButtons from "./TextareaWithFormattingButtons";

type PostProps = PostType & { currentUser?: HasUsernameAndId & { avatar?: string }, onPostEdit?: React.Dispatch<SetStateAction<PostType | null>>, onPostDelete?: React.Dispatch<SetStateAction<number | null>> };
type PostAuthor = {
    id: number,
    name: string,
    avatar?: string | File,
}


function checkIfExtensionIsApproved(src: string) {
    const extension = src.slice(src.lastIndexOf("."));
    return IMAGE_EXTENSIONS.includes(extension) || VIDEO_EXTENSIONS.includes(extension) || AUDIO_EXTENSIONS.includes(extension);
}


function Post(props: PostProps) {
    const [postInfo, setPostInfo] = useState(props);
    const [isAuthorDataLoading, setIsAuthorDataLoading] = useState(true);
    const [authorData, setAuthorData] = useState<PostAuthor | null>(null);
    const [toasts, setToasts] = useState<ToastType[]>([]);
    const [areCommentsOpen, setAreCommentsOpen] = useState(false);
    const [comments, setComments] = useState<Comment[]>([]);
    const [currentCommentText, setCurrentCommentText] = useState("");
    const [currentCommentMedia, setCurrentCommentMedia] = useState<File[]>([]);
    const [areCommentsLoading, setAreCommentsLoading] = useState(true);
    const postWrapper = useRef<HTMLDivElement | null>(null);

    if (postWrapper.current) {
        const files = postWrapper.current.querySelectorAll(".attached-img, .attached-video, .attached-audio, .comment-img, .comment-video, .comment-audio") as NodeListOf<HTMLImageElement | HTMLVideoElement | HTMLAudioElement>;
        for (let file of files) {
            const src = file.src;
            try {
                URL.revokeObjectURL(src);
            } catch {
                // Here we don't have to do anythiing:)
            }
        }
    }

    if (isAuthorDataLoading) {
        let response;
        if (postInfo.isGroup) {
            response = fetch(`/api/groups/${postInfo.userOrGroupId}`);
        } else {
            response = fetch(`/api/users/${postInfo.userOrGroupId}`);
        }

        response.then(res => {
            if (res.ok) {
                return res.json();
            } else {
                setToasts(toasts.concat({ headerContent: "Ошибка", bodyContent: "Не удалось получить данные об авторе поста" }));
            }
        }).then((json: Group | User) => {
            try {
                const avatar = base64ToFile(json.avatar || "");
                setAuthorData({
                    name: "name" in json ? json.name : json.username,
                    avatar: URL.createObjectURL(avatar),
                    id: json.id
                })

            } catch {
                setAuthorData({
                    name: "name" in json ? json.name : json.username,
                    avatar: json.avatar,
                    id: json.id
                })
            }

        }).finally(() => setIsAuthorDataLoading(false))
    }

    if (areCommentsLoading) {
        const response = fetch(`/api/post-comments/${postInfo.id}`);
        response.then(res => {
            if (res.ok) return res.json();
            setToasts(toasts.concat({ headerContent: "Ошибка", bodyContent: "Не удалось загрузить комментарии" }));
        }).then(data => {
            if (data) setComments(data);
        }).finally(() => setAreCommentsLoading(false));
    }

    async function handleSubmit() {
        if (props.currentUser) {
            let commentMediaAsBase64 = [] as { url: string, fileData: string }[];

            for (let item of currentCommentMedia) {
                const base64Str = await fileToBase64(item);
                commentMediaAsBase64.push({ url: item.name, fileData: base64Str });
            }

            const reqBody = {
                user_id: props.currentUser.id,
                post_id: props.id,
                date: new Date(),
                text: currentCommentText,
                media: commentMediaAsBase64
            };

            const response = fetch("/api/comments", {
                method: "POST",
                body: JSON.stringify(reqBody),
                headers: {
                    "Content-Type": "application/json"
                }
            });

            response.then(res => {
                if(res.ok) {
                    setCurrentCommentMedia([]);
                    setCurrentCommentText("");
                    setAreCommentsLoading(true);
                } else {
                    setToasts(toasts.concat({ headerContent: "Упс...", bodyContent: "При отправке комментария произошла ошибка" }));
                }
            })
        }
    }

    return (
        <>
            <div className="post-wrapper" ref={postWrapper}>
                <div className="author-info">
                    <Skeleton loading={isAuthorDataLoading}>
                        <Avatar src={authorData && authorData.avatar ? typeof authorData.avatar === "string" ? authorData.avatar : URL.createObjectURL(authorData.avatar) : ""} fallback={authorData?.name[0] || "U"} />
                    </Skeleton>
                    <Skeleton loading={isAuthorDataLoading}><a className="post-author-link" href={`/${postInfo.isGroup ? "groups" : "users"}/${postInfo.userOrGroupId}`}>{authorData?.name || "Неизвестный пользователь"}</a></Skeleton>
                    {postInfo.currentUser?.id === authorData?.id ?
                        <Popover.Root>
                            <div className="post-actions">
                                <Popover.Trigger>
                                    <Button><DotsHorizontalIcon /><VisuallyHidden.Root>Опции</VisuallyHidden.Root></Button>
                                </Popover.Trigger>
                            </div>

                            <Popover.Content>
                                <ul className="post-options">
                                    <li className="post-option"><Button variant="ghost" className="post-option-button" onClick={() => {
                                        if (postInfo.onPostEdit) {
                                            postInfo.onPostEdit(postInfo)
                                        };
                                    }}>Редактировать</Button></li>
                                    <li className="post-option"><Button variant="ghost" className="post-option-button" onClick={() => {
                                        if (postInfo.onPostDelete) {
                                            postInfo.onPostDelete(postInfo.id)
                                        }
                                    }}>Удалить</Button></li>
                                </ul>
                            </Popover.Content>
                        </Popover.Root>
                        : ""
                    }
                </div>
                <p className="post-text" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(marked(postInfo.text)) }}>
                </p>
                <div className="attached-files">
                    <div className="attached-images">
                        {
                            postInfo.media.filter(item => IMAGE_EXTENSIONS.includes(item.url.slice(item.url.lastIndexOf(".")))).map((item, index) =>
                                <div className="file-wrapper" key={index}>
                                    <img className="attached-img" src={typeof item.fileData === "string" ? (item.fileData === item.url ? item.fileData : URL.createObjectURL(base64ToFile(item.fileData))) : URL.createObjectURL(item.fileData)} key={index} alt={`Изображение ${index + 1}`} />
                                </div>
                            )
                        }
                    </div>
                    <div className="attached-videos">
                        {
                            postInfo.media.filter(item => VIDEO_EXTENSIONS.includes(item.url.slice(item.url.lastIndexOf(".")))).map((item, index) =>
                                <div className="file-wrapper" key={index}>
                                    <video controls className="attached-video" src={typeof item.fileData === "string" ? (item.fileData === item.url ? item.fileData : URL.createObjectURL(base64ToFile(item.fileData))) : URL.createObjectURL(item.fileData)} key={index} />
                                </div>
                            )
                        }
                    </div>
                    <div className="attached-audios">
                        {
                            postInfo.media.filter(item => AUDIO_EXTENSIONS.includes(item.url.slice(item.url.lastIndexOf(".")))).map((item, index) =>
                                <div className="file-wrapper" key={index}>
                                    <audio controls className="attached-audio" src={typeof item.fileData === "string" ? (item.fileData === item.url ? item.fileData : URL.createObjectURL(base64ToFile(item.fileData))) : URL.createObjectURL(item.fileData)} key={index} />
                                </div>
                            )
                        }
                    </div>
                </div>
                <div className="post-interaction-panel">
                    <div><button className="transparent-button" onClick={
                        () => {
                            let updatedPostInfo = postInfo;

                            if (postInfo.currentUser && postInfo.usersLiked.map(item => item.id).includes(postInfo.currentUser.id)) {
                                updatedPostInfo = {
                                    ...postInfo,
                                    usersLiked: postInfo.usersLiked.filter(item => item.id != postInfo.currentUser?.id)
                                }
                                setPostInfo(updatedPostInfo);
                            } else if (postInfo.currentUser) {
                                updatedPostInfo = {
                                    ...postInfo,
                                    usersLiked: postInfo.usersLiked.concat(postInfo.currentUser)
                                };
                            }

                            setPostInfo(updatedPostInfo);

                            fetch("/api/posts", {
                                method: "POST",
                                body: JSON.stringify(updatedPostInfo),
                                headers: {
                                    "Content-Type": "application/json"
                                }
                            });
                        }
                    }>{postInfo.currentUser && postInfo.usersLiked.map(item => item.id).includes(postInfo.currentUser.id) ? <HeartFilledIcon color="#e08326" /> : <HeartIcon color="#e08326" />}<VisuallyHidden.Root>Нравится</VisuallyHidden.Root></button>{postInfo.usersLiked.length ? postInfo.usersLiked.length : ""}</div>
                    <button className="transparent-button" onClick={() => setAreCommentsOpen(!areCommentsOpen)}><ChatBubbleIcon color="#e08326" /><VisuallyHidden.Root>Оставить комментарий</VisuallyHidden.Root></button>
                    <button className="transparent-button" onClick={() => {
                        navigator.clipboard
                        .writeText(`http://localhost:8080/posts/${props.id}`)
                        .then(_ => {
                            setToasts(toasts.concat({headerContent: "Уведомление", bodyContent: "Ссылка на пост скопирована в буфер обмена"}));
                        }, _=> setToasts(toasts.concat({headerContent: "Упс...", bodyContent: "Не удалось скопировать ссылку на пост"})));
                    }}><Share2Icon color="#e08326" /><VisuallyHidden.Root>Поделиться</VisuallyHidden.Root></button>
                </div>
                <div className="comments-panel" hidden={!areCommentsOpen}>
                    <div className="write-comment-panel">
                        <TextareaWithFormattingButtons id="text" text={currentCommentText} setText={setCurrentCommentText} />
                        <input type="file" hidden id="file-selector" accept="audio/*,image/*,video/*" onChange={(event) => {
                            const selectedFiles = event.target.files;
                            let filesToAdd: File[] = [];
                            let toastsToAdd: ToastType[] = [];
                            if (selectedFiles) {
                                for (let i = 0; i < Math.min(selectedFiles.length, 10 - currentCommentMedia.length); i++) {
                                    const selectedFile = selectedFiles[i];
                                    if (checkIfExtensionIsApproved(selectedFile.name)) {
                                        filesToAdd.push(selectedFile);
                                    } else {
                                        toastsToAdd.push({ headerContent: "Уведомление", bodyContent: `Расширение файла ${selectedFile.name} не поддерживается, поэтому он не был добавлен` })
                                    }
                                }

                                setCurrentCommentMedia(currentCommentMedia.concat(filesToAdd));
                                setToasts(toasts.concat(toastsToAdd));
                            }
                        }} multiple />
                        <div className="select-file-wrapper">
                            <Button variant="ghost" onClick={() => document.getElementById("file-selector")?.click()} disabled={currentCommentMedia.length === 10}><PlusIcon /> Прикрепить файлы</Button>
                            <Popover.Root>
                                <Popover.Trigger>
                                    <IconButton><InfoCircledIcon /></IconButton>
                                </Popover.Trigger>
                                <Popover.Content maxWidth={"300px"}>
                                    <ul>
                                        <li>Не более 10 файлов</li>
                                        <li>Поддерживаемые расширения: </li>
                                        <ul>
                                            <li>.png, .jpg, .jpeg, .webp, .gif, .svg</li>
                                            <li>.mp4, .mov, .mkv, .wmv, .webm</li>
                                            <li>.mp3, .ogg, .m4a, .wav, .aiff</li>
                                        </ul>
                                    </ul>
                                </Popover.Content>
                            </Popover.Root>
                        </div>
                        <div className="attached-files-preview">
                            {currentCommentMedia.length ? "" : "Файлы не выбраны"}
                            <div className="attached-images">
                                {
                                    currentCommentMedia.filter(item => IMAGE_EXTENSIONS.includes(item.name.slice(item.name.lastIndexOf(".")))).map((item, index) =>
                                        <div className="file-wrapper">
                                            <img className="attached-img" src={URL.createObjectURL(item)} key={index} alt={`Изображение ${index + 1}`} />
                                            <Button color="red" onClick={() => setCurrentCommentMedia(currentCommentMedia.filter(i => i !== item))}>Удалить</Button>
                                        </div>
                                    )
                                }
                            </div>
                            <div className="attached-videos">
                                {
                                    currentCommentMedia.filter(item => VIDEO_EXTENSIONS.includes(item.name.slice(item.name.lastIndexOf(".")))).map((item, index) =>
                                        <div className="file-wrapper">
                                            <video controls className="attached-video" src={URL.createObjectURL(item)} key={index} />
                                            <Button color="red" onClick={() => setCurrentCommentMedia(currentCommentMedia.filter(i => i !== item))}>Удалить</Button>
                                        </div>
                                    )
                                }
                            </div>
                            <div className="attached-audios">
                                {
                                    currentCommentMedia.filter(item => AUDIO_EXTENSIONS.includes(item.name.slice(item.name.lastIndexOf(".")))).map((item, index) =>
                                        <div className="file-wrapper">
                                            <audio controls className="attached-audio" src={URL.createObjectURL(item)} key={index} />
                                            <Button color="red" onClick={() => setCurrentCommentMedia(currentCommentMedia.filter(i => i !== item))}>Удалить</Button>
                                        </div>
                                    )
                                }
                            </div>
                        </div>
                        <Button onClick={() => {
                            if (!currentCommentText && !currentCommentMedia.length) {
                                setToasts(toasts.concat({ headerContent: "Ошибка", bodyContent: "Добавьте текст и/или изображения" }))
                            } else {
                                handleSubmit();
                            }
                        }}
                            disabled={!props.currentUser || props.currentUser.id < 0}>Опубликовать</Button>
                    </div>
                    {
                        comments.map(comment => <div className="comment" key={comment.id}>
                            <div className="comment-author-wrapper">
                                <Avatar src={getFileFromBase64Safely(comment.user.avatar)} fallback={comment.user.username[0]} />
                                <h3 className="comment-author-name heading"><a href={`/users/${comment.user.id}`} className="comment-author-link">{comment.user.username}</a></h3>
                            </div>
                            <div className="comment-text" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(marked(comment.text)) }} />
                            <div className="comment-media">
                                <div className="comment-images">
                                    {
                                        comment.media.filter(item => IMAGE_EXTENSIONS.includes(item.url.slice(item.url.lastIndexOf(".")))).map((item, index) =>
                                            <div className="file-wrapper" key={index}>
                                                <img className="comment-img" src={typeof item.fileData === "string" ? (item.fileData === item.url ? item.fileData : URL.createObjectURL(base64ToFile(item.fileData))) : URL.createObjectURL(item.fileData)} key={index} alt={`Изображение ${index + 1}`} />
                                            </div>
                                        )
                                    }
                                </div>
                                <div className="comment-videos">
                                    {
                                        comment.media.filter(item => VIDEO_EXTENSIONS.includes(item.url.slice(item.url.lastIndexOf(".")))).map((item, index) =>
                                            <div className="file-wrapper" key={index}>
                                                <video controls className="comment-video" src={typeof item.fileData === "string" ? (item.fileData === item.url ? item.fileData : URL.createObjectURL(base64ToFile(item.fileData))) : URL.createObjectURL(item.fileData)} key={index} />
                                            </div>
                                        )
                                    }
                                </div>
                                <div className="comment-audios">
                                    {
                                        comment.media.filter(item => AUDIO_EXTENSIONS.includes(item.url.slice(item.url.lastIndexOf(".")))).map((item, index) =>
                                            <div className="file-wrapper" key={index}>
                                                <audio controls className="comment-audio" src={typeof item.fileData === "string" ? (item.fileData === item.url ? item.fileData : URL.createObjectURL(base64ToFile(item.fileData))) : URL.createObjectURL(item.fileData)} key={index} />
                                            </div>
                                        )
                                    }
                                </div>
                            </div>
                        </div>)
                    }
                </div>
            </div>
            <ToastsContainer toasts={toasts} />
        </>
    )
}

export default Post;