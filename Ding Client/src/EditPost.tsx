import { Button, IconButton, Popover } from "@radix-ui/themes";
import { PlusIcon, InfoCircledIcon } from "@radix-ui/react-icons";
import { useState, type SetStateAction } from "react";
import TextareaWithFormattingButtons from "./TextareaWithFormattingButtons";
import { type Toast as ToastType, type Post } from "./types";
import "./CreateEditPost.css"
import { fileToBase64, base64ToFile, getFileFromBase64Safely } from "./auxFunctions";
import { AUDIO_EXTENSIONS, IMAGE_EXTENSIONS, VIDEO_EXTENSIONS } from "./aux_constants";


function checkIfExtensionIsApproved(src: string) {
    const extension = src.slice(src.lastIndexOf("."));
    return IMAGE_EXTENSIONS.includes(extension) || VIDEO_EXTENSIONS.includes(extension) || AUDIO_EXTENSIONS.includes(extension);
}


type EditPostProps = {
    currentUserId: number,
    postId: number,
    postFiles: { url: string, fileData: string }[],
    postText: string,
    onPostsUpdate: React.Dispatch<SetStateAction<Post[]>>,
    onClose: () => void,
    toasts?: ToastType[],
    setToasts?: React.Dispatch<SetStateAction<ToastType[]>>,
    userPageId?: number
}

function EditPost({ currentUserId, postId, postFiles, postText, onPostsUpdate, onClose, toasts, setToasts, userPageId }: EditPostProps) {
    const [text, setText] = useState(postText);
    const [attachedFiles, setAttachedFiles] = useState<{ url: string, fileData: string | File }[]>(postFiles);
    const [filesSources, setFilesSources] = useState<string[]>([]);

    if (filesSources.length !== attachedFiles.length) {
        setFilesSources(attachedFiles.map(file => typeof file.fileData === "string" ? getFileFromBase64Safely(file.fileData) : URL.createObjectURL(file.fileData)));
    }


    async function getAttachedFilesAsBase64() {
        const files = [] as { url: string, fileData: string | File }[];

        for (let file of attachedFiles) {
            if (typeof file.fileData === "string") {
                files.push(file);
            } else {
                const fileDataAsBase64 = await fileToBase64(file.fileData);
                files.push({
                    ...file,
                    fileData: fileDataAsBase64
                })
            }
        }

        return files;
    }

    function handleSubmit() {
        const files = getAttachedFilesAsBase64();

        files.then(res => {
            const responseBody = {
                id: postId,
                date: new Date(),
                media: res,
                text: text,
                isGroup: false,
                userOrGroupId: currentUserId
            }

            const response = fetch(`/api/posts`, {
                method: "POST",
                body: JSON.stringify(responseBody),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            response.then(res => {
                if (res.ok) {
                    if (setToasts && toasts) setToasts(toasts.concat({ headerContent: "Уведомление", bodyContent: "Пост изменён" }));
                    updatePosts();
                    setText("");
                    setAttachedFiles([]);
                } else {
                    if (setToasts && toasts) setToasts(toasts.concat({ headerContent: "Ошибка", bodyContent: "Произошла ошибка" }));
                }
            });
        })
    }

    function updatePosts() {
        const latestPostResponse = userPageId ? fetch(`/api/user-posts/${userPageId}`) : fetch("/api/latest-posts/1");

        latestPostResponse.then(res => {
            if (res.ok) {
                return res.json();
            } else {
                if (setToasts && toasts) setToasts(toasts.concat({ headerContent: "Ошибка", bodyContent: "Не удалось получить посты с сервера" }));
            }
        }).then(json => {
            if (json) {
                onPostsUpdate(json)
                onClose();
            };
        });
    }

    return (
        <div className="edit-post-wrapper">
            <TextareaWithFormattingButtons id="text" text={text} setText={setText} />
            <input type="file" hidden id="file-selector" accept="audio/*,image/*,video/*" onChange={(event) => {
                const selectedFiles = event.target.files;
                let filesToAdd: { url: string, fileData: string | File }[] = [];
                let toastsToAdd: ToastType[] = [];
                if (selectedFiles) {
                    for (let i = 0; i < Math.min(selectedFiles.length, 10 - attachedFiles.length); i++) {
                        const selectedFile = selectedFiles[i];
                        if (checkIfExtensionIsApproved(selectedFile.name)) {
                            filesToAdd.push({ url: selectedFile.name, fileData: selectedFile });
                        } else {
                            toastsToAdd.push({ headerContent: "Уведомление", bodyContent: `Расширение файла ${selectedFile.name} не поддерживается, поэтому он не был добавлен` })
                        }
                    }

                    setAttachedFiles(attachedFiles.concat(filesToAdd));
                    if (setToasts && toasts) setToasts(toasts.concat(toastsToAdd));
                }
            }} multiple />
            <div className="select-file-wrapper">
                <Button variant="ghost" onClick={() => document.getElementById("file-selector")?.click()} disabled={attachedFiles.length === 10}><PlusIcon /> Прикрепить файлы</Button>
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
                {attachedFiles.length ? "" : "Файлы не выбраны"}
                <div className="attached-images">
                    {
                        attachedFiles.filter(item => IMAGE_EXTENSIONS.includes(item.url.slice(item.url.lastIndexOf(".")))).map((item, index) =>
                            <div className="file-wrapper">
                                <img className="attached-img" src={filesSources[attachedFiles.indexOf(item)]} key={index} alt={`Изображение ${index + 1}`} />
                                <Button color="red" onClick={() => setAttachedFiles(attachedFiles.filter(i => i !== item))}>Удалить</Button>
                            </div>
                        )
                    }
                </div>
                <div className="attached-videos">
                    {
                        attachedFiles.filter(item => VIDEO_EXTENSIONS.includes(item.url.slice(item.url.lastIndexOf(".")))).map((item, index) =>
                            <div className="file-wrapper">
                                <video controls className="attached-video" src={filesSources[attachedFiles.indexOf(item)]} key={index} />
                                <Button color="red" onClick={() => setAttachedFiles(attachedFiles.filter(i => i !== item))}>Удалить</Button>
                            </div>
                        )
                    }
                </div>
                <div className="attached-audios">
                    {
                        attachedFiles.filter(item => AUDIO_EXTENSIONS.includes(item.url.slice(item.url.lastIndexOf(".")))).map((item, index) =>
                            <div className="file-wrapper">
                                <audio controls className="attached-audio" src={filesSources[attachedFiles.indexOf(item)]} key={index} />
                                <Button color="red" onClick={() => setAttachedFiles(attachedFiles.filter(i => i !== item))}>Удалить</Button>
                            </div>
                        )
                    }
                </div>
            </div>
            <div className="post-edit-buttons-panel">
                <Button onClick={onClose} variant="soft" className="Button" color="gray">Отмена</Button>
                <Button onClick={() => {
                    if (!text && !attachedFiles.length) {
                        if (setToasts && toasts) setToasts(toasts.concat({ headerContent: "Ошибка", bodyContent: "Добавьте текст и/или изображения" }))
                    } else {
                        handleSubmit();
                        onClose();
                    }
                }}
                    disabled={currentUserId < 0 || (postText === text && postFiles === attachedFiles)}
                    color="amber"
                    className="Button">
                    Сохранить изменения</Button>
            </div>
        </div>
    )
}

export default EditPost;