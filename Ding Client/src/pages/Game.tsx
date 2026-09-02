import { Card, Inset } from "@radix-ui/themes";
import { getFileFromBase64Safely } from "../auxFunctions";
import "./Game.css"
import { useEffect, useState } from "react";

type GameProps = {
    id: number;
    name: string;
    description?: string,
    preview?: { url: string, fileData: string },
    isExternal: boolean
};

function Game({ id, name, description, preview }: GameProps) {
    const [previewSrc, setPreviewSrc] = useState("");
    useEffect(() => {
        setPreviewSrc(preview ? getFileFromBase64Safely(preview.fileData) : "");
    }, []);

    return (
        <Card className="game-card">
            {preview ? <Inset>
                <img src={previewSrc} alt={name} className="game-preview" />
            </Inset> : ""}
            <h3 className="heading game-name"><a href={`/games/${id}`} className="game-link">{name}</a></h3>
            <p className="game-description">{description || "У этой игры пока нет описания"}</p>
        </Card>
    )
}

export default Game;