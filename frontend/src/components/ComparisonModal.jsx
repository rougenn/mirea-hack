import React, { useState } from 'react';
import './ComparisonModal.css';
import { useNavigate } from 'react-router-dom';





const ComparisonModal = ({ isOpen, onClose, formulas }) => {
    const [selectedFormulas, setSelectedFormulas] = useState([]);
    const [resultMessage, setResultMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

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

    const handleFormulaSelect = (formula) => {
        if (selectedFormulas.includes(formula)) {
            setSelectedFormulas(selectedFormulas.filter((f) => f !== formula));
        } else {
            setSelectedFormulas([...selectedFormulas, formula]);
        }
    };

    const handleCompareWithDB = async () => {
        if (selectedFormulas.length < 2) {
            alert('Пожалуйста, выберите хотя бы две формулы для сравнения.');
            return;
        }

        const formula1Text = selectedFormulas[0].inputText;
        const formula2Text = selectedFormulas[1].inputText;

        setIsLoading(true);
        setResultMessage('Сравниваю с базой...');

        try {
            const response = await authorizedFetch('http://localhost:8090/api/compare/with-db', {
                method: 'POST',
                body: JSON.stringify({ formula1: formula1Text, formula2: formula2Text }),
            });

            if (!response) {
                setResultMessage('Произошла ошибка при запросе.');
                return;
            }

            const data = await response.json();

            const result = `Результат сравнения:\nФормула 1: ${data.formula1}\nФормула 2: ${data.formula2}\nОценка сходства: ${data.score}%`;
            setResultMessage(result);
        } catch (error) {
            console.error('Ошибка:', error);
            setResultMessage('Произошла ошибка при сравнении с базой данных.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCompareBetween = async () => {
        if (selectedFormulas.length < 2) {
            alert('Пожалуйста, выберите хотя бы две формулы для сравнения между собой.');
            return;
        }

        const formula1Text = selectedFormulas[0].inputText;
        const formula2Text = selectedFormulas[1].inputText;

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
            const result = `Результат сравнения между формулами:\nФормула 1: ${data.formula1}\nФормула 2: ${data.formula2}\nОценка сходства: ${data.score}%`;
            setResultMessage(result);
        } catch (error) {
            console.error('Ошибка:', error);
            setResultMessage('Произошла ошибка при сравнении выбранных формул.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setSelectedFormulas([]);
        setResultMessage(null);
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
                    ) : (
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
                                            <span className="formula-text">{formula.inputText}</span>
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
