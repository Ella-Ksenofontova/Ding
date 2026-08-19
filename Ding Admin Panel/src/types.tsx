
export type HasNameAndId = {
    name: string,
    id: number
}


export type HasUsernameAndId = {
    username: string,
    id: number
}

export type Toast = {
    headerContent: string,
    bodyContent: string
}

export type Message = {
    id: number,
    chatID: number,
    text: string,
    senderID: number,
    media?: string[],
    imitate_generation?: boolean
}

export type CreateProps = {
    label: "Создание" | "Редактирование"
}


export type Post = {
    id: number,
    date: string,
    media: {url: string, fileData: string}[],
    usersLiked: {username: string, id: number}[],
    text: string,
    isGroup: boolean,
    userOrGroupId: number
}

export type Comment = {
    id: number,
    user_id: number,
    post_id: number,
    date: string,
    text: string
}

export type Group = {
    id: number,
    name: string,
    topic: string,
    members: {username: string, id: number}[],
    avatar: string,
    admins: User[]
}

export type Chat = {
    id: number,
    name: string;
    participants: HasUsernameAndId[];
    avatar?: { url: string, fileData: string };
    admins: HasUsernameAndId[];
};

export type User = {
    username: string,
    id: number,
    isOnline: boolean,
    lastSeen: string,
    status: string,
    avatar: string,
    birthday: string,
    education: string,
    hobbies: string,
    maritalStatus: string,
    friends: {username: string, id: number}[],
    groups: HasNameAndId[],
    email: string,
    phone: string,
    password: string,
    followers: User[],
    followed: User[]
}

export type Notification = {
    id: number,
    text: string,
    isRead: boolean,
    userID: number
}

export type Game = {
    id: number,
    name: string,
    description?: string,
    src: string,
    preview?: {url: string, fileData: string},
    isExternal: boolean
}


export type LoadingStatus = {
    ok: boolean | number,
    message: string
}