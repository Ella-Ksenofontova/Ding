import { useState } from "react";
import { type User, type Post as PostType, type Toast as ToastType } from "../types";
import CreatePost from "../CreatePost";
import InfoAboutUser from "../InfoAboutUser";
import Post from "../Post";
import Header from "../Header";
import ToastsContainer from "../ToastsContainer";
import EditDialog from "../EditDialog";
import DeleteDialog from "../DeleteDialog";
import { getCookie } from "../auxFunctions";
import { TOAST_DURATION } from "../aux_constants";
import "./UserProfile.css";
import Menu from "../Menu";
import { SetToastsContext, ToastsContext, UpdateInfoContext } from "../contexts";

function MyProfile() {
    const [infoAboutMe, setInfoAboutMe] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState({ infoAboutMe: true, posts: true });
    const [myPosts, setMyPosts] = useState<PostType[]>([]);
    const [toasts, setToasts] = useState<ToastType[]>([]);
    const [postToEdit, setPostToEdit] = useState<PostType | null>(null);
    const [postToDeleteId, setPostToDeleteId] = useState<number | null>(null);

    if (isLoading.infoAboutMe) {
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
                setInfoAboutMe(json);
            } else {

            }
        }).finally(() => setIsLoading({ ...isLoading, infoAboutMe: false }));
    }

    if (isLoading.posts && infoAboutMe?.id) {
        const postsResponse = fetch(`/api/user-posts/${infoAboutMe.id}`);
        postsResponse.then(res => {
            if (res.ok) {
                return res.json()
            } else {
                setToasts(toasts.concat({ headerContent: "Ошибка", bodyContent: "Не удалось получить посты с сервера" }));
                setTimeout(() => setToasts(toasts.filter((_, index) => index != toasts.length - 1)), TOAST_DURATION);
                throw new Error("Не удалось получить посты с сервера")
            }
        }).then(json => {
            if (json) setMyPosts(json);
        }).finally(() => {
            setIsLoading({ ...isLoading, posts: false });
        });
    }

    return (
        <>
            <title>Мой профиль</title>
            <div className="page-wrapper">
                <Header />
                <Menu />
                <main className="main">
                    <UpdateInfoContext value={setInfoAboutMe}>
                        <ToastsContext value={toasts}>
                            <SetToastsContext value={setToasts}>
                                <InfoAboutUser infoAboutUser={infoAboutMe} isLoading={isLoading.infoAboutMe} isMyProfile={true} />
                            </SetToastsContext>
                        </ToastsContext>
                    </UpdateInfoContext>
                    <CreatePost currentUserId={infoAboutMe?.id ? infoAboutMe.id : -1} onPostsUpdate={setMyPosts} />
                    <div className="posts-wrapper">
                        {
                            myPosts.length === 0 ? isLoading.posts ? <p>Загрузка...</p> : <p>Постов пока нет</p> :
                                myPosts.map(item =>
                                    <Post
                                        key={item.id}
                                        id={item.id}
                                        date={item.date}
                                        media={item.media}
                                        userOrGroupId={infoAboutMe?.id ? infoAboutMe.id : -1}
                                        usersLiked={item.usersLiked}
                                        text={item.text}
                                        isGroup={false}
                                        currentUser={{ username: infoAboutMe?.username || "", id: infoAboutMe?.id || -1 }}
                                        onPostDelete={setPostToDeleteId}
                                        onPostEdit={setPostToEdit}
                                    />
                                )
                        }
                    </div>
                    {postToEdit && infoAboutMe ? <EditDialog
                        currentUser={infoAboutMe}
                        postToEdit={postToEdit}
                        setPostToEdit={setPostToEdit}
                        setPosts={setMyPosts}
                        toasts={toasts}
                        setToasts={setToasts}
                        userPageId={infoAboutMe.id}
                    /> : ""}
                    {postToDeleteId ? <DeleteDialog
                        postToDeleteId={postToDeleteId}
                        setPostToDeleteId={setPostToDeleteId}
                        toasts={toasts}
                        setToasts={setToasts}
                        posts={myPosts}
                        setPosts={setMyPosts}
                    />
                        : ""}
                    {!postToDeleteId && !postToEdit ? <ToastsContainer toasts={toasts} /> : ""}
                </main>
            </div>
        </>
    )
}

export default MyProfile;