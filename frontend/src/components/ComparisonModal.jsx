import React, { useState } from 'react';
import './ComparisonModal.css';

const ComparisonModal = ({ isOpen, onClose, formulas, onCompare }) => {
    const [selectedFormulas, setSelectedFormulas] = useState([]);
    const [similarFormulas, setSimilarFormulas] = useState([]); // Результаты сравнения

    // Обработчик выбора формулы
    const handleFormulaSelect = (formula) => {
        if (selectedFormulas.includes(formula)) {
            setSelectedFormulas(selectedFormulas.filter((f) => f !== formula));
        } else {
            setSelectedFormulas([...selectedFormulas, formula]);
        }
    };

    // Обработчик сравнения
    const handleCompare = () => {
        if (selectedFormulas.length === 0) {
            alert('Пожалуйста, выберите хотя бы одну формулу.');
            return;
        }

        // Эмуляция ответа с бэкенда (5 случайных формул с процентами схожести)
        const similarFormulas = formulas
            .filter((f) => !selectedFormulas.includes(f)) // Исключаем выбранные формулы
            .sort(() => Math.random() - 0.5) // Случайный порядок
            .slice(0, 5) // Берем 5 формул
            .map((formula) => ({
                ...formula,
                similarity: Math.floor(Math.random() * 101), // Случайный процент схожести (0-100%)
            }));

        // Сохраняем результаты сравнения
        setSimilarFormulas(similarFormulas);

        // Передаем результаты в родительский компонент (если нужно)
        onCompare(similarFormulas);
    };

    return (
        isOpen && (
            <div className="modal-overlay">
                <div className="modal-content">
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
                        <button className="compare-button" onClick={handleCompare}>
                            Выбрать
                        </button>
                        <button className="close-button-compare" onClick={onClose}>
                            Закрыть
                        </button>
                    </div>

                    {/* Отображение результатов сравнения */}
                    {similarFormulas.length > 0 && (
                        <div className="similar-formulas">
                            <h3>Самые похожие формулы:</h3>
                            <ul>
                                {similarFormulas.map((formula, index) => (
                                    <li key={index}>
                                        <strong>Формула {formula.id}:</strong> {formula.inputText} (
                                        {formula.similarity}%)
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        )
    );
};

export default ComparisonModal;