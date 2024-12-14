import './Login.css'
import { useNavigate } from 'react-router-dom'
export default function LoginPage() {
    const navigate = useNavigate()
    const handleLogin = () => {
        navigate('/home')
    }
    return (
        <div className="container">
            <div className="form-container">
                <img src="/icon.svg" alt="Logo" className="logo" />
                <input type="text" placeholder="Логин..." className="input" />
                <input type="password" placeholder="Пароль..." className="input" />
                <button className="btn" onClick={handleLogin}>Вход</button>
            </div>
        </div>
    )
}