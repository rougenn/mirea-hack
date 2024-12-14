import React, { useState } from 'react';
import Latex from 'react-latex-next';
import 'katex/dist/katex.min.css';
import './SidePanel.css';

const SidePanel = ({
    isOpen,
    onClose,
    formulas,
    customBases,
    selectedBase,
    setSelectedBase,
    onCreateBase,
}) => {
    const [hoveredIndex, setHoveredIndex] = useState(null);

    return (
        <div className={`side-panel ${isOpen ? 'open' : ''}`}>
            <div className="side-panel-content">
                {/* Кнопка для создания новой базы */}
                <button onClick={onCreateBase}>Создать новую базу</button>

                {/* Выбор базы формул */}
                <div className="base-selector">
                    <label>Выберите базу формул:</label>
                    <select
                        value={selectedBase ? selectedBase.name : ''}
                        onChange={(e) =>
                            setSelectedBase(customBases.find((base) => base.name === e.target.value))
                        }
                    >
                        <option value="">Исходная база</option>
                        {customBases.map((base, index) => (
                            <option key={index} value={base.name}>
                                {base.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Отображение формул */}
                {formulas.map((formula, index) => (
                    <div
                        key={index}
                        className="formula-item"
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                    >
                        <div className="formula-title">
                            {formula.title}
                        </div>
                        {hoveredIndex === index && (
                            <div className="formula-body">
                                <Latex>{`$${formula.formula}$`}</Latex>
                            </div>
                        )}
                    </div>
                ))}

                {/* Кнопка закрытия панели */}
                <button className="close-button" onClick={onClose}>
                    <img src="./backbtn.png" alt="Close Side Panel" />
                </button>
            </div>
        </div>
    );
};

export default SidePanel;