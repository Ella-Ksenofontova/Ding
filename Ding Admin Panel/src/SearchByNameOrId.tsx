import { Col, Form } from "react-bootstrap";
import React, { type SetStateAction } from "react";
import "./SearchByNameOrId.css"
import { type HasNameAndId } from "./types";

type ComponentProps = {
    entityType?: string,
    id: string,
    inputValue: string,
    searchResults: {
        resultsArray: HasNameAndId[],
        areLoading: boolean
    },
    changeInputValue: React.Dispatch<SetStateAction<string>>,
    changeSearchResultsStatus: React.Dispatch<SetStateAction<boolean>>,
    changeSearchResultsArray: (results: HasNameAndId[]) => void,
    changeEntity: React.Dispatch<SetStateAction<HasNameAndId>>
}

function getQueryByEntityType(entityType: string) {
    switch (entityType) {
        case "user":
            return "users"
        case "group":
            return "groups"
        case "chat":
            return "chats"
    }
}

function SearchByNameOrId({ entityType = "user", id, inputValue, searchResults, changeInputValue, changeSearchResultsStatus, changeSearchResultsArray, changeEntity }: ComponentProps) {
    const queryPart = getQueryByEntityType(entityType);
    async function fetchResults(query: string) {
        if (queryPart) {
            const response = await fetch(`/api/search-${queryPart}/${query}`);
            let json = await response.json();
            if (Array.isArray(json)) {
                json = json.map(item => {
                    if (item.name !== undefined && item.participants) {
                        return {
                            id: item.id,
                            name: item.name,
                            participants: item.participants
                        }
                    } else if (item.name) {
                        return {
                            id: item.id,
                            name: item.name,
                        }
                    } else {
                        return {
                            id: item.id,
                            username: item.username,
                            name: item.username
                        }
                    }
                })
            }

            changeSearchResultsArray(json);
            changeSearchResultsStatus(false);
        }
    }

    return (
        <>
            <Col sm="9" md="6">
                <Form.Control id={id} type="text" value={inputValue} onChange={(event) => {
                    if (!event.target.value.includes("/")) {
                        changeInputValue(event.target.value);
                        if (event.target.value.length) {
                            changeSearchResultsStatus(true);
                            fetchResults(event.target.value);
                        } else {
                            changeSearchResultsStatus(false);
                            changeSearchResultsArray([]);
                        }
                    }
                }} />
            </Col>
            <div className="search-results">
                {
                    searchResults.areLoading ? <p>Загрузка...</p> : searchResults.resultsArray.length === 0 ? (inputValue.length ? <p>Ничего не нашлось</p> : <p>Начните печатать, чтобы увидеть подходящие результаты</p>) :
                        searchResults.resultsArray.map((item, index) => <div className="search-result" key={index} onClick={() => {
                            changeEntity(item);
                            changeInputValue(`${item.name || `${entityType === "chat" ? "Чат с автогенерируемым названием" : "Без названия"}`}, id: ${item.id}`);
                            changeSearchResultsArray([item]);
                        }}>{item.name || `${entityType === "chat" ? "Чат с автогенерируемым названием" : "Без названия"}`}, id: {item.id}</div>
                        )
                }
            </div>
        </>
    )
}

export default SearchByNameOrId;