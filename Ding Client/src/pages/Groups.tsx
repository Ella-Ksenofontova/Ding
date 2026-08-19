import { useState } from "react";
import { type Group as GroupType, type Toast } from "../types";
import { getCookie } from "../auxFunctions";
import Group from "./Group";
import Header from "../Header";
import Menu from "../Menu";
import { Button } from "@radix-ui/themes";
import { MagnifyingGlassIcon, PlusIcon } from "@radix-ui/react-icons";
import ToastsContainer from "../ToastsContainer";
import "./Groups.css"
import CreateGroupDialog from "./CreateGroupDialog";

function Groups() {
    const files = document.querySelectorAll(".group-avatar") as NodeListOf<HTMLImageElement | HTMLVideoElement | HTMLAudioElement>;
    for (let file of files) {
        const src = file.src;
        try {
            URL.revokeObjectURL(src);
        } catch {
            // Here we don't have to do anythiing:)
        }
    }

    const [myGroups, setMyGroups] = useState<GroupType[]>([]);
    const [myId, setMyId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState({ myId: true, myGroups: true });
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

    if (isLoading.myId) {
        const userResponse = fetch("/api/info-about-me", {
            headers: {
                "Authorization": `Bearer ${getCookie("jwt-token")}`
            }
        });
        userResponse.then(res => {
            if (res.ok) {
                return res.json()
            } else {
                throw new Error("Не удалось получить информацию о текущем пользователе");
            }
        }).then(json => {
            if (json) {
                setMyId(json.id);
            } else {

            }
        }).finally(() => setIsLoading({ ...isLoading, myId: false }));
    }

    if (myId && isLoading.myGroups) {
        const response = fetch(`/api/user-groups/${myId}`);
        response.then(res => {
            if (res.ok) {
                return res.json();
            } else {
                setToasts(toasts.concat({ headerContent: "Ошибка", bodyContent: "Не удалось получить информацию о группах" }));
            }
        }).then(json => {
            if (json) {
                setMyGroups(json);
            }
        }).finally(() => setIsLoading({ ...isLoading, myGroups: false }));
    }

    return (
        <>
            <title>Мои группы</title>
            <div className="page-wrapper">
                <Header />
                <Menu />
                <main className="main">
                    <h2 className="heading">Мои группы</h2>
                    <div className="groups-buttons-panel">
                        <Button onClick={() => setIsCreateDialogOpen(true)}><PlusIcon /> Создать новую группу</Button>
                        <Button><MagnifyingGlassIcon /><a href="/search-groups">Искать группы</a></Button>
                    </div>
                    <div className="groups-wrapper">
                        {myGroups.length ?
                            myGroups.map(group =>
                                <Group key={group.id} groupInfo={group} />
                            ) : isLoading.myGroups ? <p>Загрузка...</p> : <p>Вы пока не состоите ни в одной группе</p>
                        }
                    </div>
                    <ToastsContainer toasts={toasts} />
                    <CreateGroupDialog isOpen={isCreateDialogOpen} setIsOpen={setIsCreateDialogOpen}/>
                </main>
            </div>
        </>
    )
}

export default Groups;