
import { ChatBubbleIcon, ExitIcon, FaceIcon, Link2Icon, PersonIcon, PlusIcon, ReaderIcon, RocketIcon } from "@radix-ui/react-icons";
import "./Menu.css"
import { Popover } from "@radix-ui/themes";

function Menu() {
    return (
        <aside className="menu">
            <ul className="menu-list">
                <li className="menu-list-item"><a href="/" className="menu-link"><ReaderIcon />Лента</a></li>
                <li className="menu-list-item"><a href="/my-profile" className="menu-link"><FaceIcon />Мой профиль</a></li>
                <li className="menu-list-item"><a href="/chats" className="menu-link"><ChatBubbleIcon />Чаты</a></li>
                <li className="menu-list-item"><a href="/friends" className="menu-link"><Link2Icon />Друзья</a></li>
                <li className="menu-list-item"><a href="/groups" className="menu-link"><PersonIcon />Группы</a></li>
                <li className="menu-list-item mobile-hidden"><a href="/games" className="menu-link"><RocketIcon />Игры</a></li>
                <li className="menu-list-item mobile-hidden"><a href="/login" onClick={() => document.cookie = "jwt-token=''"} className="menu-link"><ExitIcon />Выход</a></li>
                <Popover.Root>
                    <li className="menu-list-item mobile-visible-only"><Popover.Trigger><button className="transparent-button menu-item-button"><PlusIcon /><span>Ещё</span></button></Popover.Trigger></li>
                    <Popover.Content sideOffset={5} className="popover-content">
                        <ul className="menu-list popover-menu-list">
                            <li className="menu-list-item popover-menu-item"><a href="/games" className="menu-link popover-menu-link"><RocketIcon />Игры</a></li>
                            <li className="menu-list-item popover-menu-item"><a href="/login" onClick={() => document.cookie = "jwt-token=None"} className="menu-link popover-menu-link"><ExitIcon />Выход</a></li>
                        </ul>
                    </Popover.Content>
                </Popover.Root>
            </ul>
        </aside>
    )
}

export default Menu;