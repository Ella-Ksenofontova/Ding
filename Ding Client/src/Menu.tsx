
import "./Menu.css"

function Menu() {
    return(
        <aside className="menu">
            <ul className="menu-list">
                <li className="menu-list-item"><a href="/" className="menu-link">Лента</a></li>
                <li className="menu-list-item"><a href="/my-profile" className="menu-link">Мой профиль</a></li>
                <li className="menu-list-item"><a href="/chats" className="menu-link">Чаты</a></li>
                <li className="menu-list-item"><a href="/friends" className="menu-link">Друзья</a></li>
                <li className="menu-list-item"><a href="/groups" className="menu-link">Группы</a></li>
                <li className="menu-list-item"><a href="/games" className="menu-link">Игры</a></li>
                <li className="menu-list-item"><a href="/login" onClick={() => document.cookie = "jwt-token=''"} className="menu-link">Выход</a></li>
            </ul>
        </aside>
    )
}

export default Menu;