import React, { useState } from 'react';
import './ComparisonModal.css';

const ComparisonModal = ({ isOpen, onClose, formulas }) => {
    const [selectedFormulas, setSelectedFormulas] = useState([]);
    const [resultMessage, setResultMessage] = useState(null); // Сообщение с результатом

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
        if (selectedFormulas.length === 0) {
            alert('Пожалуйста, выберите хотя бы одну формулу.');
            return;
        }

        // Установка сообщения о сравнении с базой данных
        setResultMessage('Сравниваю с базой...');
    };

    // Обработчик кнопки "Сравнить между собой"
    const handleCompareBetween = () => {
        if (selectedFormulas.length < 2) {
            alert('Пожалуйста, выберите хотя бы две формулы для сравнения между собой.');
            return;
        }

        // Установка сообщения о сравнении между собой
        setResultMessage('Сравниваю между собой...');
    };

    // Обработчик кнопки "Закрыть"
    const handleClose = () => {
        setSelectedFormulas([]); // Сбрасываем выбранные формулы
        setResultMessage(null); // Сбрасываем сообщение результата
        onClose(); // Вызываем исходный обработчик закрытия
    };

    return (
        isOpen && (
            <div className="modal-overlay">
                <div className="modal-content">
                    {/* Если есть сообщение результата, показываем его вместо интерфейса */}
                    {resultMessage ? (
                        <div className="result-message">
                            <h2>{resultMessage}</h2>
                            <button className="close-button-compare" onClick={handleClose}>
                                Закрыть
                            </button>
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
