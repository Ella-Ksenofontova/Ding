import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Route, Routes } from 'react-router'
import './index.css'
import Homepage from './Homepage.tsx'
import ChatsViewPage from './Chats/ChatsView.tsx'
import ChatsCreate from './Chats/ChatsCreate.tsx'
import MessagesView from './Messages/MessagesView.tsx'
import MessagesCreate from './Messages/MessagesCreate.tsx'
import PostsView from './Posts/PostsView.tsx'
import PostsCreate from './Posts/PostsCreate.tsx'
import CommentsView from './Comments/CommentsView.tsx'
import CommentsCreate from './Comments/CommentsCreate.tsx'
import GroupsView from './Groups/GroupsView.tsx'
import GroupsCreate from './Groups/GroupsCreate.tsx'
import UsersView from './Users/UsersView.tsx'
import UsersCreate from './Users/UsersCreate.tsx'
import NotificationsView from './Notifications/NotificationsView.tsx'
import NotificationsCreate from './Notifications/NotificationsCreate.tsx'
import GamesView from './Games/GamesView.tsx'
import GamesCreate from './Games/GamesCreate.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/chats-view" element={<ChatsViewPage />} />
        <Route path="/chats-create" element={<ChatsCreate label="Создание" />} />
        <Route path="/chats-edit/:id" element={<ChatsCreate label="Редактирование" />} />
        <Route path="/messages-view" element={<MessagesView />} />
        <Route path="/messages-create" element={<MessagesCreate label="Создание" />} />
        <Route path="/messages-edit/:id" element={<MessagesCreate label="Редактирование" />} />
        <Route path="/posts-view" element={<PostsView />} />
        <Route path="/posts-create" element={<PostsCreate label="Создание" />} />
        <Route path="/posts-edit/:id" element={<PostsCreate label="Редактирование" />} />
        <Route path="/comments-view" element={<CommentsView />} />
        <Route path="/comments-create" element={<CommentsCreate label="Создание" />} />
        <Route path="/comments-edit/:id" element={<CommentsCreate label="Редактирование" />} />
        <Route path="/groups-view" element={<GroupsView />} />
        <Route path="/groups-create" element={<GroupsCreate label="Создание" />} />
        <Route path="/groups-edit/:id" element={<GroupsCreate label="Редактирование" />} />
        <Route path="/users-view" element={<UsersView />} />
        <Route path="/users-create" element={<UsersCreate label="Создание" />} />
        <Route path="/users-edit/:id" element={<UsersCreate label="Редактирование" />} />
        <Route path="/notifications-view" element={<NotificationsView />} />
        <Route path="/notifications-create" element={<NotificationsCreate label="Создание" />} />
        <Route path="/notifications-edit/:id" element={<NotificationsCreate label="Редактирование" />} />
        <Route path="/games-view" element={<GamesView />} />
        <Route path="/games-create" element={<GamesCreate label="Создание" />} />
        <Route path="/games-edit/:id" element={<GamesCreate label="Редактирование" />} />
      </Routes>
    </Router>
  </StrictMode >
)
