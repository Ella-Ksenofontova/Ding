import { Form, VisuallyHidden } from "radix-ui"
import { Button, Callout, Checkbox } from "@radix-ui/themes"
import { EyeOpenIcon, EyeClosedIcon, ExclamationTriangleIcon } from "@radix-ui/react-icons"
import { useState } from "react"
import logo from "./assets/logo.png";
import "./Auth.css";

type AuthProps = {
    hasAccount: boolean
}

function getCookie(name: string) {
    const cookieArr = document.cookie.split(";");
    for (let cookieProperty of cookieArr) {
        let [key, value] = cookieProperty.split("=");
        if (key == name) {
            return value;
        }
    }
}

function Auth({ hasAccount }: AuthProps) {
    const [phoneOrEmail, setPhoneOrEmail] = useState("");
    const [isPasswordShown, setIsPasswordShown] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState("");

    if (!window.location.href.endsWith("/login") && hasAccount && !getCookie("jwt-token")) window.location.href = "/login";

    if (!window.location.href.endsWith("/sign-up") && !hasAccount && !getCookie("jwt-token")) window.location.href = "/sign-up";

    function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
        event.preventDefault();

        if (hasAccount) {
            const dataToSend = new FormData();
            dataToSend.append("username", phoneOrEmail);
            dataToSend.append("password", password);
            dataToSend.append("remember_me", rememberMe ? "yes" : "no");

            const response = fetch("/api/login", {
                method: "POST",
                body: dataToSend
            });

            response.then(res => {
                if (res.ok) {
                    return res.json()
                } else if (res.status === 400) {
                    setError("Учётные данные указаны неверно")
                }
            }).then(json => {
                if (json) {
                    document.cookie = `jwt-token=${encodeURIComponent(json.access_token)}; max-age=${rememberMe ? 34560000 : 7200}; path=/`;
                    setTimeout(() => window.location.href = "/", 500);
                }
            })
        }
    }

    return (
        <main className="main">
            <img src={logo} alt="Логотип Ding" className="logo" />
            <Form.Root onSubmit={handleSubmit} className="auth-form">
                <title>{hasAccount ? "Вход" : "Регистрация"}</title>
                <h2 className="heading">{hasAccount ? "Вход" : "Регистрация"}</h2>
                {error ? <Callout.Root color="orange" className="auth-error-message">
                    <Callout.Icon><ExclamationTriangleIcon /></Callout.Icon>
                    <Callout.Text>{error}</Callout.Text>
                </Callout.Root> : ""}
                {hasAccount ? "" :
                    <Form.Field className="auth-field" name="username" onInvalid={() => {
                        setError("Введите имя пользователя")
                    }}>
                        <Form.Label htmlFor="username">Имя: </Form.Label>
                        <Form.Control className="auth-control" required id="username" value={username} onChange={event => {
                            setUsername(event.target.value);
                            setError("");
                        }} />
                    </Form.Field>
                }
                <Form.Field name="phoneOrEmail" className="auth-field" onInvalid={() => {
                    setError("Введите телефон или email");
                }}>
                    <Form.Label htmlFor="phone-or-email">Телефон или e-mail: </Form.Label>
                    <Form.Control className="auth-control" required id="phone-or-email" value={phoneOrEmail} onChange={event => {
                        setPhoneOrEmail(event.target.value);
                        setError("");
                    }} />
                </Form.Field>
                <Form.Field name="password" className="auth-field" onInvalid={() => { if (phoneOrEmail) setError("Введите пароль") }}>
                    <Form.Label htmlFor="password">Пароль: </Form.Label>
                    <div className="password-toggle-wrapper">
                        <Form.Control className="auth-control" required id="password" type={isPasswordShown ? "text" : "password"} value={password} onChange={event => {
                            setPassword(event.target.value);
                            setError("");
                        }} />
                        <button className="transparent-button password-toggler" type="button"
                            onClick={() => setIsPasswordShown(!isPasswordShown)}>{isPasswordShown ? <EyeOpenIcon /> : <EyeClosedIcon />}<VisuallyHidden.Root>{isPasswordShown ? "Скрыть пароль" : "Показать пароль"}</VisuallyHidden.Root></button>
                    </div>
                </Form.Field>
                <div className="remember-me-wrapper">
                    <Checkbox id="remember-me" checked={rememberMe} onCheckedChange={(checked: boolean) => setRememberMe(checked)} />
                    <label htmlFor="remember-me">Запомнить меня</label>
                </div>
                <div className="auth-panel">
                    <Button className="auth-button">{hasAccount ? "Войти" : "Регистрация"}</Button>
                    <a href={hasAccount ? "/sign-up" : "/login"}>{hasAccount ? "Регистрация" : "У меня уже есть аккаунт"}</a>
                </div>
            </Form.Root>
        </main>
    )
}

export default Auth;