import Header from "./Header"
import { CardImage, PlusCircle } from "react-bootstrap-icons"
import './Homepage.css'

function Homepage() {
  document.title = "Панель управления Ding"

  return (
    <>
      <Header />
      <main className="homepage main">
        <h2 className="heading heading-level-2">Добро пожаловать</h2>
        <div className="options-container">
          <div className="view-container">
            <h3 className="heading heading-level-3"><CardImage />Просмотр</h3>
            <ul className="list">
              <li className="list-item"><a href="/chats-view">Чаты</a></li>
              <li className="list-item"><a href="/messages-view">Сообщения</a></li>
              <li className="list-item"><a href="/posts-view">Посты</a></li>
              <li className="list-item"><a href="/comments-view">Комментарии</a></li>
              <li className="list-item"><a href="/groups-view">Группы</a></li>
              <li className="list-item"><a href="/users-view">Пользователи</a></li>
              <li className="list-item"><a href="/notifications-view">Уведомления</a></li>
              <li className="list-item"><a href="/games-view">Игры</a></li>
            </ul>
          </div>
          <div className="create-container">
            <h3 className="heading heading-level-3"><PlusCircle />Создать...</h3>
            <ul className="list">
              <li className="list-item"><a href="/chats-create">Чат</a></li>
              <li className="list-item"><a href="/messages-create">Сообщение</a></li>
              <li className="list-item"><a href="/posts-create">Пост</a></li>
              <li className="list-item"><a href="/comments-create">Комментарий</a></li>
              <li className="list-item"><a href="/groups-create">Группу</a></li>
              <li className="list-item"><a href="/users-create">Пользователя</a></li>
              <li className="list-item"><a href="/notifications-create">Уведомление</a></li>
              <li className="list-item"><a href="/games-create">Игру</a></li>
            </ul>
          </div>
        </div>
      </main >
    </>
  )
}

export default Homepage
