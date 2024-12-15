import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import LatexInput from './Input';
import Background from './Background';
import SidePanel from './SidePanel';
import CreateBaseForm from './CreateBaseForm';
import Instruction from './Instruction'; // Импорт компонента "Инструкция"
import 'katex/dist/katex.min.css';
import defaultBase from './formulas.json';
import { useNavigate } from 'react-router-dom';
import ComparisonModal from './ComparisonModal'; // Импортируем ComparisonModal
import './MainPage.css'

export default function MainPage() {
    const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
    const [customBases, setCustomBases] = useState([]);
    const [selectedBase, setSelectedBase] = useState(null);
    const [isCreatingBase, setIsCreatingBase] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false); 
    const [isInstrucntionOpen, setIsInstructionOpen] = useState(true)// Состояние для управления модальным окном

    const navigate = useNavigate();

    useEffect(() => {
        const isFirstVisit = !localStorage.getItem('visited');
        const token = localStorage.getItem('access_token');

        if (isFirstVisit && token) {
            // Сначала загружаем базы, затем открываем модальное окно
            fetchFormulaDBList(token)
                .then(() => {
                    setIsModalOpen(true);
                    localStorage.setItem('visited', 'false');
                })
                .catch(error => {
                    console.error('Ошибка при получении списка баз формул:', error);
                });
        } else if (token) {
            // Если не первая визита, просто загружаем базы
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
            console.log('Базы формул:', data); // Отладка
            if (data && data.dbs) {
                console.log('Пользовательские базы:', data.dbs); // Отладка
                setCustomBases(data.dbs);
            } else {
                console.warn('В ответе нет поля dbs или оно пустое');
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
            const newCustomBase = { ...newBase, id: data.id };
            console.log('Добавлена новая база:', newCustomBase); // Отладка
            setCustomBases(prev => [...prev, newCustomBase]);
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
            <button
                className="toggle-instruction-button"
                onClick={() => setIsModalOpen(!isModalOpen)} // Переключение состояния модального окна
            >
                💡
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

            <ComparisonModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                formulas={displayedFormulas}        // Формулы для сравнения, те что отображаются в данный момент
            />

            {isInstrucntionOpen && (
                <div className="modal">
                    <div className="modal-content">
                        <button className="close-button-instructions" onClick={() => setIsInstructionOpen(false)}>
                            &times; {/* Крестик для закрытия */}
                        </button>
                        <Instruction />
                    </div>
                </div>
            )}
        </Background>
    );
}
 