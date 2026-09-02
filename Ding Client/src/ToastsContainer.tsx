import { Toast } from "radix-ui"
import { type Toast as ToastType } from "./types"
import "./ToastsContainer.css"

type ToastsProps = {
    toasts: ToastType[]
}

function ToastsContainer({ toasts }: ToastsProps) {
    return (
        <Toast.Provider swipeDirection="right">
            {toasts.map((item, index) =>
                <Toast.Root className="ToastRoot" key={index}>
                    <Toast.Title className="ToastTitle">{item.headerContent}</Toast.Title>
                    <Toast.Description className="ToastDescription">{item.bodyContent}</Toast.Description>
                </Toast.Root>
            )}
            <Toast.Viewport className="ToastViewport" label="Уведомления (F8)" />
        </Toast.Provider>
    )
}

export default ToastsContainer;