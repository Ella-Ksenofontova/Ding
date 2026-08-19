import { TextArea, Button } from "@radix-ui/themes";
import { useState } from "react";
import "./TextareaWithFormatingButtons.css"

type TextareaProps = {
    id: string,
    text: string,
    setText: (text: string) => void,
    readOnly?: boolean
}

function TextareaWithFormattingButtons({ id, text, setText, readOnly }: TextareaProps) {
    const [isUrlFieldOpen, setIsUrlFieldOpen] = useState(false);
    const [url, setUrl] = useState("");
    const [selectedPositions, setSelectedPositions] = useState({ start: 0, end: 0 });
    const [eventListenerAdded, setEventListenerAdded] = useState(false);

    function wrapSelection(wrapper: string) {
        if (selectedPositions.start < selectedPositions.end) {
            const selection = text.slice(selectedPositions.start, selectedPositions.end);
            setText(`${text.slice(0, selectedPositions.start)}${wrapper}${selection}${wrapper}${text.slice(selectedPositions.end)}`);
            setSelectedPositions({ start: 0, end: 0 });
        }
    }

    function addLink(url: string) {
        if (selectedPositions.start < selectedPositions.end) {
            const selection = text.slice(selectedPositions.start, selectedPositions.end);
            setText(`${text.slice(0, selectedPositions.start)}[${selection}](${url})${text.slice(selectedPositions.end + 1)}`);
            setSelectedPositions({ start: 0, end: 0 });
        }
    }

    function handleBlur(event: React.FocusEvent<HTMLInputElement | HTMLButtonElement | HTMLTextAreaElement>) {
        const related = event.relatedTarget as HTMLElement;
        checkTarget(related);
    }

    if (!eventListenerAdded) {
        document.body.addEventListener("click", event => {
            const target = event.target as HTMLElement;
            checkTarget(target);
        });

        setEventListenerAdded(true);
    }

    function checkTarget(target: HTMLElement | null) {
        if (target) {
            if (target.classList.contains("url-input-field") || target.classList.contains("formatting-button") || target.classList.contains("url-input-button") || target.classList.contains("textarea-with-text") || target.parentElement?.classList.contains("textarea-with-text") || target.classList.contains("link-like")) return;

            setSelectedPositions({ start: 0, end: 0 });
            setIsUrlFieldOpen(false);
        }
    }

    return (
        <div className="text-edit-wrapper">
            <div>
                <TextArea id={id} value={text} onChange={(event) => setText(event.target.value)}
                    onSelect={event => {
                        const area = event.target as HTMLTextAreaElement;
                        setSelectedPositions({ start: area.selectionStart, end: area.selectionEnd });
                    }} className="textarea-with-text" onBlur={handleBlur} readOnly={readOnly} />
                <div className="formatting-buttons-panel">
                    <button onClick={() => wrapSelection("**")} type="button" disabled={selectedPositions.start == selectedPositions.end} className="formatting-button formatting-button-bold" onBlur={handleBlur}><b>B</b></button>
                    <button onClick={() => wrapSelection("*")} type="button" disabled={selectedPositions.start == selectedPositions.end} className="formatting-button formatting-button-italic" onBlur={handleBlur}><i>I</i></button>
                    <div className="link-wrapper">
                        <button onClick={() => {
                            setIsUrlFieldOpen(true);
                        }} type="button" disabled={selectedPositions.start == selectedPositions.end} className="formatting-button formatting-button-anchor" onBlur={handleBlur}>
                            <span className="link-like">A</span>
                        </button>
                        <div className="url-input" hidden={!isUrlFieldOpen}>
                            <label htmlFor="url">URL:</label>
                            <input className="url-input-field" id="url" value={url} onChange={event => setUrl(event.target.value)} autoComplete="off" />
                            <Button type="button" variant="soft" onClick={() => {
                                setIsUrlFieldOpen(false);
                                setSelectedPositions({ start: 0, end: 0 })
                                setUrl("");
                            }} className="url-input-button" onBlur={handleBlur}>Отмена</Button>
                            <Button type="button" variant="solid" disabled={!url.trim()}
                                onClick={() => {
                                    addLink(url);
                                    setIsUrlFieldOpen(false);
                                    setUrl("");
                                }} onBlur={handleBlur} className="url-input-button">OK</Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TextareaWithFormattingButtons;