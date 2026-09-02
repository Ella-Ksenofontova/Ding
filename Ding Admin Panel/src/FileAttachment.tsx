import type { SetStateAction } from "react";
import { useState } from "react";
import type React from "react";
import { Button, Form, Tabs, Tab } from "react-bootstrap";
import { PlusCircle } from "react-bootstrap-icons";
import { type LoadingStatus } from "./types";
import "./FileAttachment.css"
import FilePreview from "./FilePreview";
import { IMAGE_EXTENSIONS, VIDEO_EXTENSIONS, AUDIO_EXTENSIONS } from "./auxConstants";
import { base64ToFile, getSrcFromBase64Safely } from "./auxFunctions";

type FileAttachmentProps = {
    newFileSrc: string,
    setNewFileSrc: React.Dispatch<SetStateAction<string>>,
    loadingStatus: LoadingStatus,
    setLoadingStatus: React.Dispatch<SetStateAction<LoadingStatus>>
    isAddingFile: boolean,
    setIsAddingFile: React.Dispatch<SetStateAction<boolean>>,
    attachedFiles: { url: string, fileData: string | File }[],
    setAttachedFiles: React.Dispatch<SetStateAction<{ url: string, fileData: string | File }[]>>
}

function checkIfExtensionIsApproved(src: string) {
    const extension = src.slice(src.lastIndexOf("."));
    return IMAGE_EXTENSIONS.includes(extension) || VIDEO_EXTENSIONS.includes(extension) || AUDIO_EXTENSIONS.includes(extension);
}

function FileAttachment({ newFileSrc, setNewFileSrc, loadingStatus, setLoadingStatus, isAddingFile, setIsAddingFile, attachedFiles, setAttachedFiles }: FileAttachmentProps) {
    const [fileObj, setFileObj] = useState<null | File>(null);
    const [attachedFilesSources, setAttachedFilesSources] = useState<string[]>([]);

    if (attachedFiles.length !== Object.keys(attachedFilesSources).length) {
        setAttachedFilesSources(attachedFiles.map(item => typeof item.fileData === "string" ? getSrcFromBase64Safely(item.fileData) : URL.createObjectURL(item.fileData)));
    }

    return (
        <>
            <h3 className="heading heading-level-3">Прикреплённые файлы</h3>
            <Button onClick={() => setIsAddingFile(true)}><div className="button-wrapper"><PlusCircle /> <span>Добавить файл</span></div></Button>
            <div className="add-file-wrapper" hidden={!isAddingFile}>
                <Tabs onSelect={(key) => {
                    if (key === "local" && !fileObj || key !== "local" && fileObj) {
                        setNewFileSrc("");
                        setFileObj(null);
                    }
                }}>
                    <Tab title="Из Интернета" eventKey="internet-link">
                        <div className="add-file-wrapper">
                            <Form.Label htmlFor="post-file">Ссылка на файл</Form.Label>
                            <Form.Control type="text" id="post-file" value={newFileSrc} onInput={event => setNewFileSrc(event.currentTarget.value)} />
                            <div className="preview">
                                {newFileSrc ? (fileObj ? <FilePreview fileName={fileObj ? fileObj.name : newFileSrc} fileObj={fileObj} loadingStatus={loadingStatus} setLoadingStatus={setLoadingStatus} newFileSrc={newFileSrc} /> : <p className="error-message">Расширение не поддерживается</p>) : "После выбора файла будет доступен предпросмотр"}
                            </div>
                        </div>
                    </Tab>
                    <Tab title="Из локального хранилища" eventKey="local">
                        <div className="add-file-wrapper">
                            <input type="file" id="file-picker" hidden accept="audio/*,image/*,video/*" onChange={event => {
                                const file = event.target.files?.item(0);
                                if (file) {
                                    if (!checkIfExtensionIsApproved(file.name)) {
                                        setLoadingStatus({ ok: 0, message: "Расширение не поддерживается" })
                                    } else {
                                        setLoadingStatus({ ok: 0, message: "Подождите, медиа загружается..." });
                                        setNewFileSrc(file.name);
                                        setFileObj(file);
                                    }
                                }
                            }} />
                            <Button onClick={() => {
                                document.getElementById("file-picker")?.click();
                            }}>Выбрать файл</Button>
                            <div className="preview">
                                {newFileSrc ? (fileObj ? <FilePreview fileName={fileObj ? fileObj.name : newFileSrc} fileObj={fileObj} loadingStatus={loadingStatus} setLoadingStatus={setLoadingStatus} newFileSrc={newFileSrc} /> : <p className="error-message">Расширение не поддерживается</p>) : "После выбора файла будет доступен предпросмотр"}
                            </div>
                        </div>
                    </Tab>
                </Tabs>
                <div className="buttons-panel">
                    <Button variant="light" onClick={() => {
                        setIsAddingFile(false);
                        setLoadingStatus({ ok: 0, message: "Подождите, медиа загружается..." });
                        setNewFileSrc("");
                    }}>Отмена</Button>
                    <Button disabled={!loadingStatus.ok} onClick={() => {
                        setAttachedFiles(attachedFiles.concat({ url: fileObj ? fileObj.name : newFileSrc, fileData: fileObj || newFileSrc }))
                        setLoadingStatus({ ok: 0, message: "Подождите, медиа загружается..." });
                        setNewFileSrc("");
                        setIsAddingFile(false);
                    }}>ОК</Button>
                </div>
            </div>
            <div className="attached-files">
                {attachedFiles.length ? "" : "Файлы не выбраны"}
                <div className="attached-images">
                    {
                        attachedFiles.filter(item => IMAGE_EXTENSIONS.includes(item.url.slice(item.url.lastIndexOf(".")))).map((item, index) =>
                            <div className="file-wrapper">
                                <img className="attached-img" src={attachedFilesSources[attachedFiles.indexOf(item)]} key={index} alt={`Изображение ${index + 1}`} />
                                <Button variant="danger" onClick={() => setAttachedFiles(attachedFiles.filter(i => i !== item))}>Удалить</Button>
                            </div>
                        )
                    }
                </div>
                <div className="attached-videos">
                    {
                        attachedFiles.filter(item => VIDEO_EXTENSIONS.includes(item.url.slice(item.url.lastIndexOf(".")))).map((item, index) =>
                            <div className="file-wrapper">
                                <video controls className="attached-video" src={attachedFilesSources[attachedFiles.indexOf(item)]} key={index} />
                                <Button variant="danger" onClick={() => setAttachedFiles(attachedFiles.filter(i => i !== item))}>Удалить</Button>
                            </div>
                        )
                    }
                </div>
                <div className="attached-audios">
                    {
                        attachedFiles.filter(item => AUDIO_EXTENSIONS.includes(item.url.slice(item.url.lastIndexOf(".")))).map((item, index) =>
                            <div className="file-wrapper">
                                <audio controls className="attached-audio" src={attachedFilesSources[attachedFiles.indexOf(item)]} key={index} />
                                <Button variant="danger" onClick={() => setAttachedFiles(attachedFiles.filter(i => i !== item))}>Удалить</Button>
                            </div>
                        )
                    }
                </div>
            </div>
        </>
    )
}

export default FileAttachment;