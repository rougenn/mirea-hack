import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import LatexInput from './Input';
import Background from './Background';
import SidePanel from './SidePanel'; 
import CreateBaseForm from './CreateBaseForm';
import 'katex/dist/katex.min.css';
import defaultBase from './formulas.json'; 
import { useNavigate } from 'react-router-dom';

export default function MainPage() {
    const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
    const [customBases, setCustomBases] = useState([]); 
    const [selectedBase, setSelectedBase] = useState(null); 
    const [isCreatingBase, setIsCreatingBase] = useState(false); 
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            fetchFormulaDBList(token).catch(error => {
                console.error('Ошибка при получении баз формул:', error);
            });
        }
    }, []);

    useEffect(() => {
        const isFirstVisit = !localStorage.getItem('visited');
        if (isFirstVisit) {
            localStorage.setItem('visited', 'true');
        }
    }, []);

    async function fetchFormulaDBList(token) {
        let response = await fetch('http://localhost:8090/api/formula-db/list', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 401) {
            const refreshed = await tryRefreshTokens();
            if (refreshed) {
                const newAccessToken = localStorage.getItem('access_token');
                response = await fetch('http://localhost:8090/api/formula-db/list', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${newAccessToken}`,
                        'Content-Type': 'application/json'
                    }
                });
            } else {
                console.error('Не удалось обновить токен, перенаправляем на логин');
                navigate('/login');
                return;
            }
        }

        if (!response.ok) {
            throw new Error(`Ошибка при загрузке баз: ${response.status}`);
        }

        const data = await response.json();
        if (data && data.dbs) {
            setCustomBases(data.dbs);
        }
    }

    async function tryRefreshTokens() {
        const accessToken = localStorage.getItem('access_token');
        const refreshToken = localStorage.getItem('refresh_token');
        if (!accessToken || !refreshToken) return false;

        const response = await fetch('http://localhost:8090/api/user/refresh-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ "access_token": accessToken, "refresh_token": refreshToken })
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('access_token', data.access_token);
            localStorage.setItem('refresh_token', data.refresh_token);
            return true;
        } else {
            return false;
        }
    }

    const addNewBase = async (newBase) => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            console.error('Нет токена для сохранения новой базы');
            return;
        }

        let response = await fetch('http://localhost:8090/api/formula-db/new', {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newBase)
        });

        if (response.status === 401) {
            const refreshed = await tryRefreshTokens();
            if (refreshed) {
                const newAccessToken = localStorage.getItem('access_token');
                response = await fetch('http://localhost:8090/api/formula-db/new', {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${newAccessToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(newBase)
                });
            } else {
                console.error('Не удалось обновить токен, перенаправляем на логин');
                navigate('/login');
                return;
            }
        }

        if (!response.ok) {
            console.error('Ошибка при создании новой базы:', response.status);
            return;
        }

        const data = await response.json();
        setCustomBases(prev => [...prev, { ...newBase, id: data.id }]);
        setIsCreatingBase(false);
    };

    const displayedFormulas = selectedBase && selectedBase.table 
        ? selectedBase.table 
        : defaultBase.table;

    return (
        <Background>
            <Navbar />
            <LatexInput
                isSidePanelOpen={isSidePanelOpen}
                setIsSidePanelOpen={setIsSidePanelOpen}
                title="Введите LaTeX-формулу для отображения" // Подсказка
            />
            <button
                className="toggle-side-panel-button"
                onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
                title="Открыть/закрыть панель с базами формул" // Подсказка
            >
                <img src="/assets/basebtn.png" alt="Toggle Side Panel" />
            </button>
            <SidePanel
                isOpen={isSidePanelOpen}
                onClose={() => setIsSidePanelOpen(false)}
                formulas={displayedFormulas}
                customBases={customBases}
                selectedBase={selectedBase}
                setSelectedBase={setSelectedBase}
                onCreateBase={() => setIsCreatingBase(true)}
                title="Панель для выбора и управления базами формул" // Подсказка
            />
            {isCreatingBase && (
                <CreateBaseForm
                    onAddBase={addNewBase}
                    onClose={() => setIsCreatingBase(false)}
                    initialFormulas={defaultBase.table}
                    title="Форма для создания новой базы формул" // Подсказка
                />
            )}
        </Background>
    );
}