import { Button, IconButton, Popover } from "@radix-ui/themes";
import { PlusIcon, InfoCircledIcon } from "@radix-ui/react-icons";
import { useState, type SetStateAction } from "react";
import TextareaWithFormattingButtons from "./TextareaWithFormattingButtons";
import { type Toast as ToastType, type Post } from "./types";
import "./CreateEditPost.css"
import { fileToBase64 } from "./auxFunctions";
import ToastsContainer from "./ToastsContainer";
import { AUDIO_EXTENSIONS, IMAGE_EXTENSIONS, VIDEO_EXTENSIONS } from "./aux_constants";


function checkIfExtensionIsApproved(src: string) {
    const extension = src.slice(src.lastIndexOf("."));
    return IMAGE_EXTENSIONS.includes(extension) || VIDEO_EXTENSIONS.includes(extension) || AUDIO_EXTENSIONS.includes(extension);
}

type CreatePostProps = {
    currentUserId: number,
    onPostsUpdate: React.Dispatch<SetStateAction<Post[]>>
}

function CreatePost({ currentUserId, onPostsUpdate }: CreatePostProps) {
    const [text, setText] = useState("");
    const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
    const [toasts, setToasts] = useState<ToastType[]>([]);
    const [filesSources, setFilesSources] = useState<string[]>([]);

    if (filesSources.length !== attachedFiles.length) {
        setFilesSources(attachedFiles.map(file => URL.createObjectURL(file)));
    }

    async function getAttachedFilesAsBase64() {
        const files = [] as { url: string, fileData: string }[];

        for (let file of attachedFiles) {
            const fileAsBase64 = await fileToBase64(file);
            files.push({ url: file.name, fileData: fileAsBase64 });
        }

        return files;
    }

    function handleSubmit() {
        const files = getAttachedFilesAsBase64();

        files.then(res => {
            const responseBody = {
                date: new Date(),
                media: res,
                text: text,
                isGroup: false,
                userOrGroupId: currentUserId
            }

            const response = fetch("/api/posts", {
                method: "POST",
                body: JSON.stringify(responseBody),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            response.then(res => {
                if (res.ok) {
                    setToasts(toasts.concat({ headerContent: "Уведомление", bodyContent: "Пост опубликован" }));
                    onPostsUpdate(prev => [{...responseBody, id: prev[0]?.id + 1, usersLiked: [], date: responseBody.date.toISOString() }, ...prev]);
                    setText("");
                    setAttachedFiles([]);
                } else {
                    setToasts(toasts.concat({ headerContent: "Ошибка", bodyContent: "Произошла ошибка" }));
                }
            });
        })
    }

    return (
        <div className="create-post-wrapper">
            <h2 className="heading"><label htmlFor="text">О чём думаете?</label></h2>
            <TextareaWithFormattingButtons id="text" text={text} setText={setText} />
            <input type="file" hidden id="file-selector" accept="audio/*,image/*,video/*" onChange={(event) => {
                const selectedFiles = event.target.files;
                let filesToAdd: File[] = [];
                let toastsToAdd: ToastType[] = [];
                if (selectedFiles) {
                    for (let i = 0; i < Math.min(selectedFiles.length, 10 - attachedFiles.length); i++) {
                        const selectedFile = selectedFiles[i];
                        if (checkIfExtensionIsApproved(selectedFile.name)) {
                            filesToAdd.push(selectedFile);
                        } else {
                            toastsToAdd.push({ headerContent: "Уведомление", bodyContent: `Расширение файла ${selectedFile.name} не поддерживается, поэтому он не был добавлен` })
                        }
                    }

                    setAttachedFiles(attachedFiles.concat(filesToAdd));
                    setToasts(toasts.concat(toastsToAdd));
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
                        attachedFiles.filter(item => IMAGE_EXTENSIONS.includes(item.name.slice(item.name.lastIndexOf(".")))).map((item, index) =>
                            <div className="file-wrapper">
                                <img className="attached-img" src={filesSources[attachedFiles.indexOf(item)]} key={index} alt={`Изображение ${index + 1}`} />
                                <Button color="red" onClick={() => setAttachedFiles(attachedFiles.filter(i => i !== item))}>Удалить</Button>
                            </div>
                        )
                    }
                </div>
                <div className="attached-videos">
                    {
                        attachedFiles.filter(item => VIDEO_EXTENSIONS.includes(item.name.slice(item.name.lastIndexOf(".")))).map((item, index) =>
                            <div className="file-wrapper">
                                <video controls className="attached-video" src={filesSources[attachedFiles.indexOf(item)]} key={index} />
                                <Button color="red" onClick={() => setAttachedFiles(attachedFiles.filter(i => i !== item))}>Удалить</Button>
                            </div>
                        )
                    }
                </div>
                <div className="attached-audios">
                    {
                        attachedFiles.filter(item => AUDIO_EXTENSIONS.includes(item.name.slice(item.name.lastIndexOf(".")))).map((item, index) =>
                            <div className="file-wrapper">
                                <audio controls className="attached-audio" src={filesSources[attachedFiles.indexOf(item)]} key={index} />
                                <Button color="red" onClick={() => setAttachedFiles(attachedFiles.filter(i => i !== item))}>Удалить</Button>
                            </div>
                        )
                    }
                </div>
            </div>
            <Button onClick={() => {
                if (!text && !attachedFiles.length) {
                    setToasts(toasts.concat({ headerContent: "Ошибка", bodyContent: "Добавьте текст и/или изображения" }))
                } else {
                    handleSubmit();
                }
            }}
                disabled={currentUserId < 0}>Опубликовать</Button>

            <ToastsContainer toasts={toasts} />
        </div>
    )
}

export default CreatePost;