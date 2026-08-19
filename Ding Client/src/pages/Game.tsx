import { Card, Inset } from "@radix-ui/themes";
import { base64ToFile } from "../auxFunctions";
import "./Game.css"

type GameProps = {
    id: number;
    name: string;
    description?: string,
    preview?: { url: string, fileData: string },
    isExternal: boolean
};

function Game({ id, name, description, preview }: GameProps) {
    return (
        <Card className="game-card">
            {preview ? <Inset>
                <img src={typeof preview.fileData === "string" ? (preview.url === preview.fileData ?
                    preview.fileData : URL.createObjectURL(base64ToFile(preview.fileData))
                ) : URL.createObjectURL(preview.fileData)} alt={name} className="game-preview" />
            </Inset> : ""}
            <h3 className="heading game-name"><a href={`/games/${id}`} className="game-link">{name}</a></h3>
            <p className="game-description">{description || "У этой игры пока нет описания"}</p>
        </Card>
    )
}

export default Game;