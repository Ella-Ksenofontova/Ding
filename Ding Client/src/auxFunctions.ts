
export function getCookie(name: string) {
    const cookieArr = document.cookie.split(";");
    for (let cookieProperty of cookieArr) {
        let [key, value] = cookieProperty.split("=");
        if (key == name) {
            return value;
        }
    }
}

export function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const res = reader.result as string;
            resolve(res.split(',')[1].replace(/[\s\n\r]/g, ""));
        }
        reader.onerror = error => reject(error);
    })
}

export function base64ToFile(base64String: string) {
    const arr = base64String.split(',');

    if (arr.length === 2) {
        const mimeArr = arr[0].match(/:(.*?);/);

        if (mimeArr) {
            const mime = mimeArr[1];

            const bstr = atob(arr[1]);

            let n = bstr.length;
            const u8arr = new Uint8Array(n);
            while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
            }

            return new File([u8arr], "avatar", { type: mime });
        }

        throw new Error("Не удалось определить MIME-тип!")
    } else if (arr.length) {
        const bstr = atob(arr[0]);

        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }

        return new File([u8arr], "file", { type: "image/*" })
    }

    throw new Error("Строка не является Base64!")
}

export function getFileFromBase64Safely(fileStr: string) {
    try {
        const previewAsFile = base64ToFile(fileStr);
        return URL.createObjectURL(previewAsFile);
    } catch {
        return fileStr;
    }
}

export function isSurrogatePair(lead: string, trail: string) {
    const high = lead.charCodeAt(0);
    const low = trail.charCodeAt(0);
    return (high >= 0xD800 && high <= 0xDBFF) && (low >= 0xDC00 && low <= 0xDFFF);
}

export function getSrc(img: string | File) {
    if (typeof img === "string") return getFileFromBase64Safely(img);
    return URL.createObjectURL(img);
}