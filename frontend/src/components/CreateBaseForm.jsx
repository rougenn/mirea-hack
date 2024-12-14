import React, { useState } from 'react';

const CreateBaseForm = ({ onAddBase, onClose, initialFormulas }) => {
    const [baseName, setBaseName] = useState(''); 
    const [customFormulas, setCustomFormulas] = useState([]); // теперь { name, value }
    const [selectedInitialFormulas, setSelectedInitialFormulas] = useState([]); // { name, value }

    // Состояния для добавления новой формулы
    const [newFormulaName, setNewFormulaName] = useState(''); 
    const [newFormulaValue, setNewFormulaValue] = useState('');

    // Обработчик добавления/удаления формулы из исходной базы
    const handleAddInitialFormula = (formula) => {
        if (!selectedInitialFormulas.includes(formula)) {
            setSelectedInitialFormulas(prev => [...prev, formula]);
        } else {
            setSelectedInitialFormulas(prev => prev.filter((f) => f !== formula));
        }
    };

    // Обработчик добавления новой формулы вручную (уже в { name, value } формате)
    const handleAddCustomFormula = () => {
        if (!newFormulaName.trim() || !newFormulaValue.trim()) {
            alert('Пожалуйста, заполните название и формулу.');
            return;
        }
        setCustomFormulas(prev => [...prev, { name: newFormulaName, value: newFormulaValue }]);
        setNewFormulaName(''); 
        setNewFormulaValue('');
    };

    // Обработчик создания новой базы
    const handleCreateBase = () => {
        if (!baseName.trim()) {
            alert('Пожалуйста, введите название базы.');
            return;
        }

        // Формируем таблицу из выбранных и собственных формул (оба массива уже в { name, value } формате)
        const newBase = {
            name: baseName,
            table: [...selectedInitialFormulas, ...customFormulas]
        };

        onAddBase(newBase);
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
                                    {formula.name}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Добавление собственных формул */}
                <div className="custom-formulas">
                    <h4>Добавить собственные формулы (LaTeX):</h4>
                    <div className="add-custom-formula">
                        <input
                            type="text"
                            placeholder="Название формулы"
                            value={newFormulaName}
                            onChange={(e) => setNewFormulaName(e.target.value)}
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
                                    {formula.name}: {formula.value}
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
