
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
    media?: { url: string, fileData: string }[],
    imitate_generation?: boolean
}


export type Post = {
    id: number,
    date: string,
    media: { url: string, fileData: string }[],
    usersLiked: { username: string, id: number }[],
    text: string,
    isGroup: boolean,
    userOrGroupId: number
}

export type Comment = {
    id: number,
    user: HasUsernameAndId & { avatar: string },
    post_id: number,
    date: string,
    text: string,
    media: { url: string, fileData: string }[]
}

export type Group = {
    id: number,
    name: string,
    topic: string,
    members: { username: string, id: number, avatar?: string }[],
    avatar?: { url: string, fileData: string | File },
    admins: HasUsernameAndId[]
}

export type User = {
    username: string,
    id: number,
    isOnline: boolean,
    lastSeen: string,
    status: string,
    avatar?: string,
    birthday: string,
    education: string,
    hobbies: string,
    maritalStatus: string,
    friends: { username: string, id: number }[],
    groups: HasNameAndId[],
    email: string,
    phone: string,
    password: string,
    followers: HasUsernameAndId[],
    followed: HasUsernameAndId[]
}

export type Notification = {
    id: number,
    text: string,
    isRead: boolean,
    userID: number
}


export type LoadingStatus = {
    ok: boolean | number,
    message: string
}

export type Chat = {
    id: number,
    name: string,
    participants: (HasUsernameAndId & { avatar?: { url: string, fileData: string | File } })[],
    is_name_auto_generated: boolean,
    avatar?: { url: string, fileData: string | File },
    admins: HasUsernameAndId[]
}


export type Game = {
    id: number,
    name: string,
    description?: string,
    src: string,
    preview?: { url: string, fileData: string },
    isExternal: boolean
}