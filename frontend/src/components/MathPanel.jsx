import React, { useState } from 'react';
import './MathPanel.css';

const MathPanel = ({ onInsert }) => {
    const [isPanelOpen, setIsPanelOpen] = useState(false); // Состояние панели
    const [selectedSymbol, setSelectedSymbol] = useState(null);
    const [inputValues, setInputValues] = useState([]);

    const mathSymbols = [
        { id: 'sqrt', label: '√', latex: '\\sqrt[#1]{#2}', placeholders: ['Индекс (необязательно)', 'Подкоренное выражение'] },
        { id: 'frac', label: '÷', latex: '\\frac{#1}{#2}', placeholders: ['Числитель', 'Знаменатель'] },
        { id: 'int', label: '∫', latex: '\\int_{#1}^{#2} #3 \\, dx', placeholders: ['Нижний предел', 'Верхний предел', 'Интеграл'] },
        { id: 'sum', label: '∑', latex: '\\sum_{#1}^{#2} #3', placeholders: ['Нижний предел', 'Верхний предел', 'Сумманда'] },
        { id: 'power', label: '⌃', latex: '#1^{#2}', placeholders: ['Основание', 'Показатель'] },
        { id: 'parentheses', label: '()', latex: '({#1})', placeholders: ['Выражение'] },
    ];

    const handleSymbolSelect = (symbol) => {
        setSelectedSymbol(symbol);
        setInputValues(new Array(symbol.placeholders.length).fill(''));
    };

    const handleInputChange = (index, value) => {
        setInputValues((prev) => {
            const newValues = [...prev];
            newValues[index] = value;
            return newValues;
        });
    };

    const formatLatex = (symbol, inputValues) => {
        if (!symbol) return '';
        let formatted = symbol.latex;
        inputValues.forEach((value, idx) => {
            formatted = formatted.replace(`#${idx + 1}`, value || '');
        });
        return formatted;
    };

    const insertSymbol = () => {
        if (selectedSymbol) {
            const latex = formatLatex(selectedSymbol, inputValues);
            onInsert(latex);
            setSelectedSymbol(null); // Сбрасываем выбор
        }
    };

    return (
        <div className="math-panel-container">
            <button
                className="toggle-panel-button"
                onClick={() => setIsPanelOpen(!isPanelOpen)}
            >
                <img src="/assets/keyboardbtn.png" alt="Math Panel" />
            </button>

            {isPanelOpen && (
                <div className="math-panel">
                    {mathSymbols.map((symbol) => (
                        <button
                            key={symbol.id}
                            className={`math-symbol ${selectedSymbol?.id === symbol.id ? 'selected' : ''}`}
                            onClick={() => handleSymbolSelect(symbol)}
                        >
                            {symbol.label}
                        </button>
                    ))}

                    {selectedSymbol && (
                        <div className="input-section">
                            {selectedSymbol.placeholders.map((placeholder, index) => (
                                <input
                                    key={index}
                                    type="text"
                                    className="symbol-input"
                                    placeholder={placeholder}
                                    value={inputValues[index] || ''}
                                    onChange={(e) => handleInputChange(index, e.target.value)}
                                />
                            ))}
                            <button className="insert-button" onClick={insertSymbol}>
                                Вставить
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MathPanel;
