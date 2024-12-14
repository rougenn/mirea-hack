import './Register.css';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function RegisterPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const handleRegister = async () => {
        if (password !== confirmPassword) {
            setError('Пароли не совпадают');
            return;
        }

        try {
            const response = await fetch('http://localhost:8090/api/user/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (response.status === 201) {
                navigate('/login');
            } else {
                const errorData = await response.json();
                setError(errorData.error || 'Ошибка регистрации');
            }
        } catch (err) {
            setError('Ошибка соединения с сервером');
        }
    };

    return (
        <div className="container">
            <div className="form-container">
                <img src="/assets/icon.svg" alt="Logo" className="logo" />
                {error && <div className="error">{error}</div>}
                <input
                    type="text"
                    placeholder="Логин..."
                    className="input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Пароль..."
                    className="input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Повторите пароль..."
                    className="input"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button className="btn-reg-reg" onClick={handleRegister}>
                    Регистрация
                </button>
            </div>
        </div>
    );
}
