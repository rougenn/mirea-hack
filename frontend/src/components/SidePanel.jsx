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
                <button onClick={onCreateBase}>Создать новую базу</button>

                <div className="base-selector">
                    <label>Выберите базу формул:</label>
                    <select
                        value={selectedBase ? selectedBase.name : ''}
                        onChange={(e) =>
                            setSelectedBase(
                                e.target.value === '' 
                                    ? null 
                                    : customBases.find((base) => base.name === e.target.value)
                            )
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

                {formulas.map((formula, index) => (
                    <div
                        key={index}
                        className="formula-item"
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                    >
                        <div className="formula-title">
                            {formula.name}
                        </div>
                        {hoveredIndex === index && (
                            <div className="formula-body">
                                <Latex>{`$${formula.value}$`}</Latex>
                            </div>
                        )}
                    </div>
                ))}

                <button className="close-button" onClick={onClose}>
                    <img src="/assets/backbtn.png" alt="Close Side Panel" />
                </button>
            </div>
        </div>
    );
};

export default SidePanel;
