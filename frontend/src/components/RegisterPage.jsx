import './Register.css'
import { useNavigate } from 'react-router-dom'


export default function RegisterPage() {
    const navigate = useNavigate()
    const handleRegister = () => {
        navigate('/')
    }
    return (
        <div className="container">
            <div className="form-container">
                <img src="/icon.svg" alt="Logo" className="logo" />
                <input type="text" placeholder="Логин..." className="input" />
                <input type="password" placeholder="Пароль..." className="input" />
                <input type="password" placeholder="Повторите пароль..." className="input" />   
                <button className="btn-reg-reg" onClick={handleRegister}>Регистрация</button>
            </div>  
        </div>
    )
}