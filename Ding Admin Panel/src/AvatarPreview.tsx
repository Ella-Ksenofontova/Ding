import "./AvatarPreview.css";
import { IMAGE_EXTENSIONS } from "./auxConstants";

type AvatarPreviewProps = {
    url?: string;
    alt?: string;
    emptyMessage?: string;
    isLocal: boolean
};

function AvatarPreview({alt = "Превью", emptyMessage = "Введите ссылку на аватар, чтобы увидеть предпросмотр", url, isLocal = false }: AvatarPreviewProps) {
    if (!url?.trim()) {
        return <p className="avatar-preview-empty">{emptyMessage}</p>;
    }

    const extension = url.slice(url.lastIndexOf(".")).toLowerCase();
    if (!IMAGE_EXTENSIONS.includes(extension) && !isLocal) {
        return <p className="avatar-preview-empty">Ссылка не ведёт на изображение</p>;
    }

    return <img className="avatar-preview-image" src={url} alt={alt} />;
}

export default AvatarPreview;
