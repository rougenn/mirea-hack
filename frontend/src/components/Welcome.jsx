import { useNavigate } from 'react-router-dom'
import './Welcome.css'
export default function Welcome() {
    const Navigate = useNavigate()
    const handleLogin = () => {
        Navigate('/login')
    }
    const handleRegister = () => {
        Navigate('/register')
    }
    const HandleGuest = () => {
        Navigate('/home')
    }
    return (
        <div className="container">
            <img src="/icon.svg" alt="Logo" className="logo" />
            <button className="btn-log" onClick={handleLogin}>Вход</button>
            <button className="btn-reg" onClick={handleRegister}>Регистрация</button>
            <button className="btn-guest" onClick={HandleGuest}>Войти как гость</button>
            <div className="line"></div>
        </div>
    );
}
