import React, { useState, useEffect } from 'react';
import './ComparisonModal.css';
import { useNavigate } from 'react-router-dom';
import defaultBase from './formulas.json'; // Импортируем дефолтную базу напрямую

const ComparisonModal = ({ 
    isOpen, 
    onClose, 
    formulas // Получаем только формулы из пропсов
}) => {
    const [customBases, setCustomBases] = useState([]);
    const [resultMessage, setResultMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const [isSelectingBase, setIsSelectingBase] = useState(false);
    const [selectedBaseIndex, setSelectedBaseIndex] = useState(null);

    const navigate = useNavigate();

    // Состояние для отслеживания выбранных формул
    const [selectedFormulas, setSelectedFormulas] = useState([]);

    // Fetch customBases when modal opens
    useEffect(() => {
        if (isOpen) {
            console.log('ComparisonModal opened');
            fetchCustomBases();
        }
    }, [isOpen]);

    const fetchCustomBases = async () => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            console.error('Нет access_token в localStorage');
            navigate('/login');
            return;
        }

        try {
            const response = await fetch('http://localhost:8090/api/formula-db/list', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data && data.dbs) {
                    setCustomBases(data.dbs);
                    console.log('Пользовательские базы:', data.dbs);
                } else {
                    console.warn('В ответе нет поля dbs или оно пустое');
                }
            } else if (response.status === 401) {
                const refreshed = await tryRefreshTokens();
                if (refreshed) {
                    // Retry fetch
                    fetchCustomBases();
                } else {
                    console.error('Не удалось обновить токен, перенаправляем на логин');
                    navigate('/login');
                }
            } else {
                console.error('Ошибка при запросе списка баз:', response.status);
            }
        } catch (error) {
            console.error('Ошибка при запросе списка баз:', error);
        }
    };

    // Функция обновления токенов
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

    // Функция авторизованного запроса
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

    // Обработчик выбора формулы
    const handleFormulaSelect = (formula) => {
        if (selectedFormulas.includes(formula)) {
            setSelectedFormulas(selectedFormulas.filter((f) => f !== formula));
        } else {
            setSelectedFormulas([...selectedFormulas, formula]);
        }
    };

    // Обработчик кнопки "Сравнить с базой данных"
    const handleCompareWithDB = () => {
        if (selectedFormulas.length !== 1) {
            alert('Для сравнения с базой выберите ровно одну формулу.');
            return;
        }

        // Переходим к выбору базы
        setIsSelectingBase(true);
    };

    // Обработчик подтверждения выбора базы
    const handleConfirmBaseSelection = async () => {
        if (selectedBaseIndex === null) {
            alert('Пожалуйста, выберите базу для сравнения.');
            return;
        }

        const formula1Text = selectedFormulas[0].inputText; // Используем 'inputText'

        let chosenBase = null;
        if (selectedBaseIndex === 0) {
            chosenBase = defaultBase;
        } else {
            chosenBase = customBases[selectedBaseIndex - 1];
        }

        // Отладка выбранной базы
        console.log('Selected Base Index:', selectedBaseIndex);
        console.log('Chosen Base:', chosenBase);

        if (!chosenBase || !chosenBase.table) {
            console.error('Выбрана база без таблицы формул или база не найдена');
            setResultMessage('Ошибка при выборе базы.');
            setIsSelectingBase(false);
            return;
        }

        // Извлекаем 'value' из выбранной базы
        const formulaValues = chosenBase.table.map(f => f.value);
        console.log('Formula Values:', formulaValues);

        setIsLoading(true);
        setResultMessage('Сравниваю с выбранной базой...');
        setIsSelectingBase(false);

        try {
            const response = await authorizedFetch('http://localhost:8090/api/compare/with-db', {
                method: 'POST',
                body: JSON.stringify({ 
                    formula: formula1Text,
                    formuladb: formulaValues
                }),
            });

            if (!response) {
                setResultMessage('Произошла ошибка при запросе.');
                return;
            }

            const data = await response.json();
            console.log('Результат сравнения:', data);

            let result = 'Результат сравнения с базой:\n';
            if (data.top5 && data.top5.length > 0) {
                data.top5.forEach((item, idx) => {
                    result += `${idx+1}. Формула: ${item.formula}, Сходство: ${item.score}%\n`;
                });
            } else {
                result += 'Нет результатов для отображения.';
            }
            setResultMessage(result);
        } catch (error) {
            console.error('Ошибка:', error);
            setResultMessage('Произошла ошибка при сравнении с базой данных.');
        } finally {
            setIsLoading(false);
        }
    };

    // Обработчик кнопки "Сравнить между собой"
    const handleCompareBetween = async () => {
        if (selectedFormulas.length < 2) {
            alert('Пожалуйста, выберите хотя бы две формулы для сравнения между собой.');
            return;
        }

        const formula1Text = selectedFormulas[0].inputText; // 'inputText'
        const formula2Text = selectedFormulas[1].inputText; // 'inputText' is CORRECT!!

        setIsLoading(true);
        setResultMessage('Сравниваю выбранные формулы между собой...');

        try {
            const response = await authorizedFetch('http://localhost:8090/api/compare/with-formula', {
                method: 'POST',
                body: JSON.stringify({ formula1: formula1Text, formula2: formula2Text }),
            });

            if (!response) {
                setResultMessage('Произошла ошибка при запросе.');
                return;
            }

            const data = await response.json();
            console.log('Результат сравнения между формулами:', data);

            const result = `Результат сравнения между формулами:\nФормула 1: ${data.formula1}\nФормула 2: ${data.formula2}\nОценка сходства: ${data.score}%`;
            setResultMessage(result);
        } catch (error) {
            console.error('Ошибка:', error);
            setResultMessage('Произошла ошибка при сравнении выбранных формул.');
        } finally {
            setIsLoading(false);
        }
    };

    // Обработчик закрытия модального окна
    const handleClose = () => {
        setSelectedFormulas([]);
        setResultMessage(null);
        setIsSelectingBase(false);
        setSelectedBaseIndex(null);
        onClose();
    };

    return (
        isOpen && (
            <div className="modal-overlay">
                <div className="modal-content">
                    {resultMessage ? (
                        <div className="result-message">
                            {isLoading ? <h2>Загрузка...</h2> : <pre style={{ whiteSpace: 'pre-wrap' }}>{resultMessage}</pre>}
                            {!isLoading && (
                                <button className="close-button-compare" onClick={handleClose}>
                                    Закрыть
                                </button>
                            )}
                        </div>
                    ) : isSelectingBase ? (
                        // Интерфейс выбора базы
                        <div>
                            <h2>Выберите базу для сравнения</h2>
                            <select
                                value={selectedBaseIndex !== null ? selectedBaseIndex : ''}
                                onChange={(e) => setSelectedBaseIndex(e.target.value ? Number(e.target.value) : null)}
                            >
                                <option value="">-- Выберите базу --</option>
                                <option value={0}>Дефолтная база: {defaultBase.name}</option>
                                {customBases && customBases.length > 0 ? (
                                    customBases.map((cb, idx) => (
                                        <option key={cb.id} value={idx + 1}>{cb.name}</option>
                                    ))
                                ) : (
                                    <option disabled>Нет пользовательских баз</option>
                                )}
                            </select>
                            <div className="modal-buttons">
                                <button className="compare-button" onClick={handleConfirmBaseSelection}>
                                    Подтвердить выбор базы
                                </button>
                                <button className="close-button-compare" onClick={handleClose}>
                                    Отмена
                                </button>
                            </div>
                        </div>
                    ) : (
                        // Интерфейс выбора формул
                        <>
                            <h2>Выберите формулы для сравнения</h2>
                            <div className="formulas-list">
                                {formulas.map((formula, index) => (
                                    <div key={index} className="formula-item">
                                        <input
                                            type="checkbox"
                                            id={`formula-${index}`}
                                            checked={selectedFormulas.includes(formula)}
                                            onChange={() => handleFormulaSelect(formula)}
                                        />
                                        <label htmlFor={`formula-${index}`}>
                                            <span className="formula-number">{index + 1}</span>
                                            <span className="formula-text">{formula.inputText}</span> {/* Используем 'inputText' */}
                                        </label>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="modal-buttons">
                                <button className="compare-button" onClick={handleCompareWithDB}>
                                    Сравнить с базой данных
                                </button>
                                <button className="compare-button" onClick={handleCompareBetween}>
                                    Сравнить между собой
                                </button>
                                <button className="close-button-compare" onClick={handleClose}>
                                    Закрыть
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        )
    );

};

export default ComparisonModal;
