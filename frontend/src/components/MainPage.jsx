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
    const [isModalOpen, setIsModalOpen] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        // Проверяем, заходил ли пользователь впервые
        const isFirstVisit = !localStorage.getItem('visited');
        if (isFirstVisit) {
            setIsModalOpen(true);
            localStorage.setItem('visited', 'false');
        }
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            fetchFormulaDBList(token).catch(error => {
                console.error('Ошибка при получении списка баз формул:', error);
            });
        }
    }, []);

    async function tryRefreshTokens() {
        const accessToken = localStorage.getItem('access_token');
        const refreshToken = localStorage.getItem('refresh_token');
        if (!accessToken || !refreshToken) return false;

        try {
            const response = await fetch('http://localhost:8090/api/user/refresh-token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ access_token: accessToken, refresh_token: refreshToken })
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('access_token', data.access_token);
                localStorage.setItem('refresh_token', data.refresh_token);
                return true;
            } else {
                console.error('Не удалось обновить токены, код ответа:', response.status);
                return false;
            }
        } catch (error) {
            console.error('Ошибка при попытке обновить токены:', error);
            return false;
        }
    }

    async function authorizedFetch(url, options = {}) {
        let token = localStorage.getItem('access_token');
        if (!token) {
            console.error('Нет access_token в localStorage');
            navigate('/login');
            return null;
        }

        const response = await fetch(url, {
            ...options,
            headers: {
                ...options.headers,
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 401) {
            // Попытка обновить токен
            const refreshed = await tryRefreshTokens();
            if (refreshed) {
                token = localStorage.getItem('access_token');
                const retryResponse = await fetch(url, {
                    ...options,
                    headers: {
                        ...options.headers,
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                if (!retryResponse.ok) {
                    console.error('Ошибка при повторном запросе:', retryResponse.status);
                    return null;
                }
                return retryResponse;
            } else {
                console.error('Не удалось обновить токен, перенаправляем на логин');
                navigate('/login');
                return null;
            }
        }

        if (!response.ok) {
            console.error('Ошибка при запросе:', response.status);
            return null;
        }

        return response;
    }

    async function fetchFormulaDBList(token) {
        const response = await authorizedFetch('http://localhost:8090/api/formula-db/list', {
            method: 'GET'
        });

        if (response) {
            const data = await response.json();
            if (data && data.dbs) {
                setCustomBases(data.dbs);
            }
        }
    }

    async function addNewBase(newBase) {
        const response = await authorizedFetch('http://localhost:8090/api/formula-db/new', {
            method: 'PUT',
            body: JSON.stringify(newBase)
        });

        if (response) {
            const data = await response.json(); // {"id": "uuid..."}
            setCustomBases(prev => [...prev, { ...newBase, id: data.id }]);
            setIsCreatingBase(false);
        }
    }

    const displayedFormulas = selectedBase && selectedBase.table 
        ? selectedBase.table 
        : defaultBase.table;

    return (
        <Background>
            <Navbar />
            <LatexInput
                isSidePanelOpen={isSidePanelOpen}
                setIsSidePanelOpen={setIsSidePanelOpen}
            />
            <button
                className="toggle-side-panel-button"
                onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
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
            />
            {isCreatingBase && (
                <CreateBaseForm
                    onAddBase={addNewBase}
                    onClose={() => setIsCreatingBase(false)}
                    initialFormulas={defaultBase.table}
                />
            )}
            {/* Модальное окно, если нужно, можно будет вставить сюда */}
        </Background>
    );
}
    