import { Avatar, TextField } from "@radix-ui/themes";
import Header from "../Header";
import Menu from "../Menu";
import { useState } from "react";
import type { Toast, Group } from "../types";
import { getCookie, getFileFromBase64Safely } from "../auxFunctions";
import "./SearchUsersGroups.css"
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";

function SearchGroups() {
    const [inputValue, setInputValue] = useState("");
    const [searchResults, setSearchResults] = useState<Group[]>([]);
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [myId, setMyId] = useState(-1);

    if (myId < 0) {
        const response = fetch("/api/info-about-me", {
            headers: {
                "Authorization": `Bearer ${getCookie("jwt-token")}`
            }
        });

        response.then(res => {
            if (res.ok) return res.json();
            return { id: 0 }
        }).then(data => setMyId(data.id))
    }

    return (
        <>
            <title>Поиск групп</title>
            <div className="page-wrapper">
                <Header />
                <Menu />
                <main className="main">
                    <h2 className="heading"><label htmlFor="name-or-id">Поиск групп</label></h2>
                    <TextField.Root id="name-or-id" value={inputValue} onChange={event => {
                        if (!event.target.value.includes("/")) {
                            setInputValue(event.target.value);
                            if (event.target.value) {
                                setIsLoading(true);
                                const response = fetch(`/api/search-groups/${event.target.value}`);
                                response.then(res => {
                                    if (res.ok) {
                                        return res.json();
                                    } else {
                                        setToasts(toasts.concat({ headerContent: "Ошибка", bodyContent: "Не удалось загрузить результаты поиска" }));
                                    }
                                }).then(data => {
                                    if (data) setSearchResults(data.filter((item: Group) => item.id !== myId));
                                }).finally(() => {
                                    setIsLoading(false);
                                })
                            } else {
                                setSearchResults([]);
                            }
                        }
                    }} placeholder="Введите имя или ID группы" className="search-groups-input">
                        <TextField.Slot>
                            <MagnifyingGlassIcon height="16" width="16" />
                        </TextField.Slot>
                    </TextField.Root>
                    <ul className="search-results">
                        {
                            searchResults.map(res =>
                                <li className="search-result" key={res.id}>
                                    <Avatar src={getFileFromBase64Safely(res.avatar as string || "")} fallback={res.name[0]} className="group-avatar" />
                                    <h3 className="username heading"><a href={`/groups/${res.id}`} className="user-link">{res.name}</a></h3>
                                </li>
                            )
                        }
                    </ul>
                    {searchResults.length === 0 ? inputValue ? isLoading ? "Загрузка..." : "Ничего не нашлось" : "Начните печатать, чтобы увидеть подходящие результаты" : ""}
                </main>
            </div>
        </>
    )
}

export default SearchGroups;