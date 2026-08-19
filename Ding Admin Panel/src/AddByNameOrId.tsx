import { Button, Form } from "react-bootstrap";
import React, { useState } from "react";
import { PlusCircle, Trash } from "react-bootstrap-icons";
import SearchByNameOrId from "./SearchByNameOrId";
import "./AddByNameOrId.css"
import { type Toast, type HasNameAndId } from "./types";

type AddEntityProps = {
    entities: HasNameAndId[],
    entityType?: string,
    ChangeEntities: React.Dispatch<React.SetStateAction<HasNameAndId[]>>,
    toasts?: Toast[],
    changeToasts?: React.Dispatch<React.SetStateAction<Toast[]>>,
    buttonLabel?: string,
    infoLabel?: string,
    inputLabel?: string,
    condition?: (result: HasNameAndId) => void
}

function getMessageByEntityType(entityType: string) {
    switch (entityType) {
        case "user":
            return "Пользователь уже в списке"
        case "group":
            return "Группа уже в списке"
        case "chat":
            return "Чат уже в списке"
        default:
            return ""
    }
}

function AddByNameOrId({ entities, entityType = "user", ChangeEntities, toasts, changeToasts, buttonLabel = "Добавить пользователя", infoLabel = "Пользователи не выбраны", inputLabel = "Имя или ID пользователя", condition }: AddEntityProps) {
    const [isEntityBeingAdded, setIsEntityBeingAdded] = useState(false);
    const [newEntity, setNewEntity] = useState<HasNameAndId>({ name: "", id: -1 });
    const [searchResults, setSearchResults] = useState<HasNameAndId[]>([]);
    const [areSearchResultsLoading, setAreSearchResultsLoading] = useState(false);
    const [newEntityValue, setNewEntityValue] = useState("");
    
    function clearEntityAddWrapper() {
        setIsEntityBeingAdded(false);
        setNewEntity({ name: "", id: -1 });
        setSearchResults([]);
        setAreSearchResultsLoading(false);
        setNewEntityValue("");
    }

    return (
        <>
            <Button type="button" onClick={() => setIsEntityBeingAdded(true)} style={{ flexBasis: "fit-content", width: "fit-content" }}><div className="button-wrapper"><PlusCircle /><span>{buttonLabel}</span></div></Button>
            <div className="entity-add-wrapper" hidden={!isEntityBeingAdded}>
                <div>
                    <Form.Label htmlFor="entity">{inputLabel}</Form.Label>
                </div>
                <SearchByNameOrId entityType={entityType} id="entity" inputValue={newEntityValue} searchResults={{ resultsArray: searchResults, areLoading: areSearchResultsLoading }} changeInputValue={setNewEntityValue} changeSearchResultsStatus={setAreSearchResultsLoading} changeSearchResultsArray={(results) => setSearchResults(results.filter(condition || (() => true)))} changeEntity={setNewEntity} />
                <div className="buttons-panel">
                    <Button variant="light" onClick={clearEntityAddWrapper}>Отмена</Button>
                    <Button disabled={areSearchResultsLoading} onClick={() => {
                        if (searchResults.includes(newEntity) && !entities.includes(newEntity)) {
                            ChangeEntities(
                                entities.concat(newEntity)
                            );
                            clearEntityAddWrapper();
                        } else if (entities.includes(newEntity) && toasts && changeToasts) {
                            changeToasts(toasts.concat({ "headerContent": "Уведомление", "bodyContent": getMessageByEntityType(entityType) }))
                        } else if (toasts && changeToasts) {
                            const newToast = {
                                headerContent: "Ошибка",
                                bodyContent: newEntityValue.length === 0 ? "Укажите имя участника" : "Выберите участника из списка" //TODO: update message
                            };

                            changeToasts(toasts.concat(newToast));
                        }
                    }}>ОК</Button>
                </div>
            </div>
            <ul className="entities-list">
                {
                    entities.length === 0 ? <p className="info-paragraph">{infoLabel}</p> :
                        entities.map((entity, index) =>
                            <li key={index} className="entities-list-item">{entity.name} <Button variant="danger" onClick={() => ChangeEntities(entities.filter(item => (item.name !== entity.name)))}><Trash /><span className="visually-hidden">Удалить участника</span></Button>
                            </li>
                        )
                }
            </ul>
        </>
    )
}

export default AddByNameOrId;
