import React, { useState } from 'react';

const CreateBaseForm = ({ onAddBase, onClose, initialFormulas }) => {
    const [baseName, setBaseName] = useState(''); // Название новой базы
    const [customFormulas, setCustomFormulas] = useState([]); // Собственные формулы
    const [selectedInitialFormulas, setSelectedInitialFormulas] = useState([]); // Выбранные формулы из исходной базы

    // Состояния для добавления новой формулы
    const [newFormulaTitle, setNewFormulaTitle] = useState(''); // Название новой формулы
    const [newFormulaValue, setNewFormulaValue] = useState(''); // Значение новой формулы

    // Обработчик добавления формулы из исходной базы
    const handleAddInitialFormula = (formula) => {
        if (!selectedInitialFormulas.includes(formula)) {
            setSelectedInitialFormulas([...selectedInitialFormulas, formula]);
        } else {
            setSelectedInitialFormulas(selectedInitialFormulas.filter((f) => f !== formula));
        }
    };

    // Обработчик добавления новой формулы вручную
    const handleAddCustomFormula = () => {
        if (!newFormulaTitle.trim() || !newFormulaValue.trim()) {
            alert('Пожалуйста, заполните название и формулу.');
            return;
        }
        setCustomFormulas([...customFormulas, { title: newFormulaTitle, formula: newFormulaValue }]);
        setNewFormulaTitle(''); // Очищаем поле названия
        setNewFormulaValue(''); // Очищаем поле формулы
    };

    // Обработчик создания новой базы
    const handleCreateBase = () => {
        if (!baseName.trim()) {
            alert('Пожалуйста, введите название базы.');
            return;
        }

        // Создаем новую базу
        const newBase = {
            name: baseName,
            formulas: [...selectedInitialFormulas, ...customFormulas],
        };

        // Передаем новую базу в SidePanel
        onAddBase(newBase);

        // Закрываем окно
        onClose();
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3>Создать новую базу формул</h3>

                {/* Название базы */}
                <input
                    type="text"
                    placeholder="Название базы"
                    value={baseName}
                    onChange={(e) => setBaseName(e.target.value)}
                />

                {/* Добавление формул из исходной базы */}
                <div className="initial-formulas">
                    <h4>Добавить формулы из исходной базы:</h4>
                    <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                        {initialFormulas.map((formula, index) => (
                            <div key={index} className="formula-item">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={selectedInitialFormulas.includes(formula)}
                                        onChange={() => handleAddInitialFormula(formula)}
                                    />
                                    {formula.title}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Добавление собственных формул */}
                <div className="custom-formulas">
                    <h4>Добавить собственные формулы:</h4>
                    <div className="add-custom-formula">
                        <input
                            type="text"
                            placeholder="Название формулы"
                            value={newFormulaTitle}
                            onChange={(e) => setNewFormulaTitle(e.target.value)}
                        />
                        <textarea
                            placeholder="Введите формулу (LaTeX)"
                            value={newFormulaValue}
                            onChange={(e) => setNewFormulaValue(e.target.value)}
                        />
                        <button onClick={handleAddCustomFormula}>Добавить формулу</button>
                    </div>
                    <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                        <ul>
                            {customFormulas.map((formula, index) => (
                                <li key={index}>
                                    {formula.title}: {formula.formula}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Кнопки */}
                <div className="modal-buttons">
                    <button onClick={handleCreateBase}>Создать базу</button>
                    <button onClick={onClose}>Закрыть</button>
                </div>
            </div>
        </div>
    );
};

export default CreateBaseForm;