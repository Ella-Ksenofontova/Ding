import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from "react-router";
import './index.css'
import Homepage from './Homepage.tsx'
import Auth from './Auth.tsx';
import "@radix-ui/themes/styles.css";
import { Theme } from '@radix-ui/themes';
import MyProfile from './pages/MyProfile.tsx';
import { getCookie } from './auxFunctions.ts';
import Chats from './pages/Chats.tsx';
import Groups from './pages/Groups.tsx';
import Friends from './pages/Friends.tsx';
import Games from './pages/Games.tsx';
import ChatPage from './pages/ChatPage.tsx';
import UserProfile from './pages/UserProfile.tsx';
import GroupPage from './pages/GroupPage.tsx';
import GamePage from './pages/GamePage.tsx';
import SearchUsers from './pages/SearchUsers.tsx';
import SearchGroups from './pages/SearchGroups.tsx';


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Theme accentColor='amber' grayColor='olive'>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={getCookie("jwt-token") ? <Homepage /> : <Auth hasAccount={true} />} />
          <Route path="/login" element={<Auth hasAccount={true} />} />
          <Route path="/sign-up" element={<Auth hasAccount={false} />} />
          <Route path="/my-profile" element={getCookie("jwt-token") ? <MyProfile /> : <Auth hasAccount={true} />} />
          <Route path="/chats" element={getCookie("jwt-token") ? <Chats /> : <Auth hasAccount={true} />} />
          <Route path="/groups" element={getCookie("jwt-token") ? <Groups /> : <Auth hasAccount={true} />} />
          <Route path="/friends" element={getCookie("jwt-token") ? <Friends /> : <Auth hasAccount={true} />} />
          <Route path="/games" element={getCookie("jwt-token") ? <Games /> : <Auth hasAccount={true} />} />
          <Route path="/chats/:id" element={getCookie("jwt-token") ? <ChatPage /> : <Auth hasAccount={true} />} />
          <Route path="/users/:id" element={<UserProfile />} />
          <Route path="/groups/:id" element={<GroupPage />} />
          <Route path="/games/:id" element={getCookie("jwt-token") ? <GamePage /> : <Auth hasAccount={true} />} />
          <Route path="/search-users" element={<SearchUsers />} />
          <Route path="/search-groups" element={<SearchGroups />} />
        </Routes>
      </BrowserRouter>
    </Theme>
  </StrictMode>,
)
