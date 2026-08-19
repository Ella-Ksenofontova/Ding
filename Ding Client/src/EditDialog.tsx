import { Theme } from "@radix-ui/themes";
import { Dialog } from "radix-ui";
import EditPost from "./EditPost";
import type { HasUsernameAndId, Post, Toast } from "./types";
import type { SetStateAction } from "react";
import ToastsContainer from "./ToastsContainer";
import "./Dialog.css"
import { TOAST_DURATION } from "./aux_constants";

type EditDialogProps = {
    currentUser: HasUsernameAndId,
    postToEdit: Post,
    setPostToEdit: React.Dispatch<SetStateAction<Post | null>>
    setPosts: React.Dispatch<SetStateAction<Post[]>>,
    toasts: Toast[],
    setToasts: React.Dispatch<SetStateAction<Toast[]>>,
    userPageId?: number
}

function EditDialog({currentUser, postToEdit, setPostToEdit, setPosts, toasts, setToasts, userPageId}: EditDialogProps) {
    return (
        <Dialog.Root open>
            <Dialog.Portal>
                <Dialog.Overlay className="DialogOverlay" />
                <Theme accentColor='amber' grayColor='olive'>
                    <Dialog.Content className='DialogContent radix-themes'>
                        <Dialog.Title className='heading'>Редактировать пост</Dialog.Title>
                        <EditPost currentUserId={currentUser.id} postId={postToEdit.id} postFiles={postToEdit.media} postText={postToEdit.text} onPostsUpdate={setPosts} onClose={() => setPostToEdit(null)} toasts={toasts} setToasts={(val) => {
                            setToasts(val);
                            setTimeout(() => setToasts(toasts.filter((item, index) => index != toasts.length - 1)), TOAST_DURATION);
                        }} userPageId={userPageId}/>
                    </Dialog.Content>
                    <ToastsContainer toasts={toasts} />
                </Theme>
            </Dialog.Portal>
        </Dialog.Root>
    )
}

export default EditDialog;