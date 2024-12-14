import './Login.css'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

export default function LoginPage() {
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    
    const handleLogin = async () => {
        try {
            const response = await fetch('http://localhost:8090/api/user/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            })
            
            if (response.ok) {
                const data = await response.json()
                // Сохраняем токены в localStorage (или sessionStorage)
                localStorage.setItem('access_token', data.access_token)
                localStorage.setItem('refresh_token', data.refresh_token)

                // Перенаправляем на /home
                navigate('/home')
            } else {
                // Обработка ошибки
                console.error('Ошибка при логине:', response.status)
            }
        } catch (error) {
            console.error('Ошибка:', error)
        }
    }

    return (
        <div className="container">
            <div className="form-container">
                <img src="/assets/icon.svg" alt="Logo" className="logo" />

                <input 
                    type="text" 
                    placeholder="Логин..." 
                    className="input" 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                />

                <input 
                    type="password" 
                    placeholder="Пароль..." 
                    className="input"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                />

                <button className="btn" onClick={handleLogin}>Вход</button>
            </div>
        </div>
    )
}
