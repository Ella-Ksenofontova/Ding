import ToastContainer from "react-bootstrap/esm/ToastContainer";
import { type Toast as ToastType } from "./types";
import { Toast, ToastHeader, ToastBody } from "react-bootstrap";

type ToastsContainerProps = {
    toasts: ToastType[];
    setToasts: React.Dispatch<React.SetStateAction<ToastType[]>>;
};

function CustomToastsConatiner({ toasts, setToasts }: ToastsContainerProps) {
    return (
        <ToastContainer hidden={!toasts.length} position="bottom-end" containerPosition="fixed" style={{ padding: "10px" }}>
            {toasts.map((item, index) => (
                <Toast key={index} autohide onClose={() => setToasts(toasts.filter((toast) => toast !== item))}>
                    <ToastHeader>{item.headerContent}</ToastHeader>
                    <ToastBody>{item.bodyContent}</ToastBody>
                </Toast>
            ))}
        </ToastContainer>
    )
}

export default CustomToastsConatiner;