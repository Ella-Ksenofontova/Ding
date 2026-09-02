import { type LoadingStatus } from "./types";
import React, { type SetStateAction } from "react";
import "./FilePreview.css"

const IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"];
const VIDEO_EXTENSIONS = [".mp4", ".mov", ".mkv", ".wmv", ".webm"];
const AUDIO_EXTENSIONS = [".mp3", ".ogg", ".m4a", ".wav", ".aiff"];

type FilePreviewProps = {
    fileName: string,
    fileObj: File | null,
    loadingStatus: LoadingStatus,
    setLoadingStatus: React.Dispatch<SetStateAction<LoadingStatus>>,
    newFileSrc: string
}

function FilePreview({ fileName, fileObj, loadingStatus, setLoadingStatus, newFileSrc }: FilePreviewProps) {
    const extension = fileName.slice(fileName.lastIndexOf("."));
    const [previewSrc, setPreviewSrc] = React.useState<string>("");
    if (!previewSrc && fileObj) setPreviewSrc(URL.createObjectURL(fileObj));

    if (IMAGE_EXTENSIONS.includes(extension)) {
        return <img className="preview-img" onLoad={() => {
            if (!loadingStatus.ok) setLoadingStatus({ message: "Предпросмотр изображения", ok: 1 });
        }
        } onError={() => setLoadingStatus({ ok: 0, message: "Не удалось загрузить картинку" })} alt={loadingStatus.message} src={previewSrc || newFileSrc} />
    } else if (VIDEO_EXTENSIONS.includes(extension)) {
        return (<>
            <p>{loadingStatus.message}</p>
            <video controls src={previewSrc || newFileSrc} className="preview-video" onCanPlay={() => {
                if (!loadingStatus.ok) setLoadingStatus({ message: "Предпросмотр видео", ok: 1 });
            }} onError={() => setLoadingStatus({ ok: 0, message: "Не удалось загрузить видео" })} />
        </>)
    } else if (AUDIO_EXTENSIONS.includes(extension)) {
        return (<>
            <p>{loadingStatus.message}</p><audio controls src={previewSrc || newFileSrc} className="preview-audio" onCanPlay={() => {
                if (!loadingStatus.ok) setLoadingStatus({ message: "Предпросмотр аудио", ok: 1 })
            }} onError={() => setLoadingStatus({ ok: 0, message: "Не удалось загрузить аудио" })} />
        </>)
    } else {
        return <p className="error-message">Расширение не поддерживается</p>
    }
}

export default FilePreview;
