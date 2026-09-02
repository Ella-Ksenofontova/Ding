import { Button, Theme } from "@radix-ui/themes";
import { Dialog } from "radix-ui";
import type { SetStateAction } from "react";
import ToastsContainer from "./ToastsContainer";
import { type Post, type Toast } from "./types";
import "./Dialog.css";
import { TOAST_DURATION } from "./aux_constants";

type DeleteDialogProps = {
    postToDeleteId: number | null,
    setPostToDeleteId: React.Dispatch<SetStateAction<number | null>>,
    toasts: Toast[],
    setToasts: React.Dispatch<SetStateAction<Toast[]>>,
    posts: Post[],
    setPosts: React.Dispatch<SetStateAction<Post[]>>
}

function DeleteDialog({postToDeleteId, setPostToDeleteId, toasts, setToasts, posts, setPosts}: DeleteDialogProps) {
    return (
        <Dialog.Root open>
            <Dialog.Portal>
              <Dialog.Overlay className="DialogOverlay" />
              <Theme accentColor='amber' grayColor='olive'>
                <Dialog.Content className="DialogContent radix-themes">
                  <Dialog.Title className='heading'>Вы уверены?</Dialog.Title>
                  <Dialog.Description>Отменить это действие будет невозможно.</Dialog.Description>
                  <div className='delete-post-buttons-wrapper'>
                    <Dialog.Close onClick={() => setPostToDeleteId(null)} asChild>
                      <Button variant="soft" color="gray" className='Button'>
                        Отмена
                      </Button>
                    </Dialog.Close>
                    <Dialog.Close onClick={() => {
                      const response = fetch(`/api/posts/${postToDeleteId}`, {
                        method: "DELETE"
                      });

                      response.then(res => {
                        if (res.ok) {
                          setToasts(toasts.concat({ headerContent: "Уведомление", bodyContent: "Пост успешно удалён" }));
                          setTimeout(() => setToasts(toasts.filter((_, index) => index != toasts.length - 1)), TOAST_DURATION);
                          setPosts(posts.filter(item => item.id !== postToDeleteId));
                          setPostToDeleteId(null);
                        } else {
                          setToasts(toasts.concat({ headerContent: "Уведомление", bodyContent: "Произошла ошибка" })); setTimeout(() => setToasts(toasts.filter((_, index) => index != toasts.length - 1)), TOAST_DURATION);
                        }
                      })
                    }} asChild>
                      <Button color='amber' className='Button'>ОК</Button>
                    </Dialog.Close>
                  </div>
                </Dialog.Content>
                <ToastsContainer toasts={toasts} />
              </Theme>
            </Dialog.Portal>
          </Dialog.Root>
    )
}

export default DeleteDialog;