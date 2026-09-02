import Header from './Header';
import Post from "./Post";
import CreatePost from './CreatePost';
import Menu from './Menu';
import './Homepage.css'
import { useEffect, useState } from 'react';
import { type Post as PostType, type Toast as ToastType } from './types';
import ToastsContainer from './ToastsContainer';
import DeleteDialog from './DeleteDialog';
import EditDialog from './EditDialog';
import { TOAST_DURATION, POSTS_CHUNK_LENGTH } from './aux_constants';
import { CheckCircledIcon } from '@radix-ui/react-icons';
import { Button } from '@radix-ui/themes';
import loading from "./assets/loading.gif"

function getCookie(name: string) {
  const cookieArr = document.cookie.split(";");
  for (let cookieProperty of cookieArr) {
    let [key, value] = cookieProperty.split("=");
    if (key == name) {
      return value;
    }
  }
}

function Homepage() {
  const [posts, setPosts] = useState<(PostType)[]>([]);
  const [allPostsLoaded, setAllPostsLoaded] = useState(false);
  const [arePostsLoading, setArePostsLoading] = useState(true);
  const [isCurrentUserLoading, setIsCurrentUserLoading] = useState(true);
  const [toasts, setToasts] = useState<ToastType[]>([]);
  const [currentUser, setCurrentUser] = useState({ username: "", id: -1 });
  const [postToEdit, setPostToEdit] = useState<PostType | null>(null);
  const [postToDeleteId, setPostToDeleteId] = useState<number | null>(null);

  useEffect(() => {
    const postsResponse = fetch(`/api/latest-posts/${posts.length + 1}`);
    postsResponse.then(res => {
      if (res.ok) {
        return res.json()
      } else {
        setToasts(toasts.concat({ headerContent: "Ошибка", bodyContent: "Не удалось получить посты с сервера" }));
        setTimeout(() => setToasts(toasts.filter((_, index) => index != toasts.length - 1)), TOAST_DURATION);
        throw new Error("Не удалось получить посты с сервера")
      }
    }).then(json => {
      if (json) setPosts(posts.concat(json));
      if (json.length < POSTS_CHUNK_LENGTH) setAllPostsLoaded(true);
    }).finally(() => {
      setArePostsLoading(false);
    });
  }, []);

  if (isCurrentUserLoading) {
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
        setCurrentUser(json);
      } else {

      }
    }).finally(() => setIsCurrentUserLoading(false));
  }

  return (
    <>
      <title>Домашняя страница</title>
      <div className="page-wrapper">
        <Header />
        <Menu />
        <main className='main'>
          <CreatePost currentUserId={currentUser.id} onPostsUpdate={setPosts} />
          <h2 className='heading'>Свежие посты</h2>
          <div className="posts">
            {arePostsLoading && !posts?.length ? <p>Загрузка...</p> : ""}
            {posts?.length ? posts.map((post) =>
              <Post {...post} key={post.id} currentUser={currentUser} onPostDelete={setPostToDeleteId} onPostEdit={setPostToEdit} />
            ) : arePostsLoading ? "" : <p>Постов пока нет</p>}
          </div>
          {allPostsLoaded ? <div className='all-posts-loaded'><CheckCircledIcon /> Вы посмотрели все посты!</div> :
          posts.length ?
            <Button className='load-more-button' onClick={() => setArePostsLoading(true)} disabled={arePostsLoading}>
              {arePostsLoading ? <img src={loading} alt="Новые посты загружаются" height={20} width={20}/> : ""}
              Загрузить ещё
            </Button> : ""}
          {postToEdit ? <EditDialog
            currentUser={currentUser}
            postToEdit={postToEdit}
            setPostToEdit={setPostToEdit}
            setPosts={setPosts}
            toasts={toasts}
            setToasts={setToasts} /> : ""}
          {postToDeleteId ? <DeleteDialog
            postToDeleteId={postToDeleteId}
            setPostToDeleteId={setPostToDeleteId}
            toasts={toasts}
            setToasts={setToasts}
            posts={posts}
            setPosts={setPosts}
          />
            : ""}
        </main>
      </div>
      {!postToDeleteId && !postToEdit ? <ToastsContainer toasts={toasts} /> : ""}
    </>
  )
}

export default Homepage;
