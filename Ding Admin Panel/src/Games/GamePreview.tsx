function GamePreview({ fileData, alt, emptyMessage, isLocal }: { fileData: string | File; alt: string; emptyMessage: string; isLocal: boolean }) {    
    if (!fileData) {
        return <p>{emptyMessage}</p>;
    }
    return <img src={isLocal ? URL.createObjectURL(fileData as File) : fileData as string} alt={alt} className="game-preview" />
}

export default GamePreview;