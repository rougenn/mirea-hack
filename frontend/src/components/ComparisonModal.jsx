import React, { useState } from 'react';
import './ComparisonModal.css';

const ComparisonModal = ({ isOpen, onClose, formulas }) => {
    const [selectedFormulas, setSelectedFormulas] = useState([]);
    const [resultMessage, setResultMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false); // Индикатор загрузки

    // Обработчик выбора формулы
    const handleFormulaSelect = (formula) => {
        if (selectedFormulas.includes(formula)) {
            setSelectedFormulas(selectedFormulas.filter((f) => f !== formula));
        } else {
            setSelectedFormulas([...selectedFormulas, formula]);
        }
    };

    // Обработчик кнопки "Сравнить с базой данных"
    const handleCompareWithDB = async () => {
        if (selectedFormulas.length < 2) {
            alert('Пожалуйста, выберите хотя бы две формулы для сравнения.');
            return;
        }

        // Берём первые две выбранные формулы
        const formula1Text = selectedFormulas[0].inputText;
        const formula2Text = selectedFormulas[1].inputText;

        setIsLoading(true);
        setResultMessage('Сравниваю с базой...');

        try {
            const response = await fetch('http://localhost:8090/api/compare/with-formula', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ formula1: formula1Text, formula2: formula2Text }),
            });

            if (!response.ok) {
                throw new Error('Ошибка при запросе к серверу');
            }

            const data = await response.json();
            // Пример ответа:
            // {
            //   "formula1": "s(q(r(;tx;)))",
            //   "formula2": "s(q(r(;t;(;2;;x;))))",
            //   "score": 75
            // }

            // Формируем сообщение результата
            const result = `Результат сравнения:
            Формула 1: ${data.formula1}
            Формула 2: ${data.formula2}
            Оценка сходства: ${data.score}%`;

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

        // Здесь можно реализовать свою логику сравнения между собой.
        // Ниже просто пример установки результата без реального запроса:
        setResultMessage('Сравниваю выбранные формулы между собой...');
        // Если нужно - аналогично делаем запрос к вашему эндпоинту.
    };

    // Обработчик кнопки "Закрыть"
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
                            {isLoading ? <h2>Загрузка...</h2> : <h2>{resultMessage}</h2>}
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
