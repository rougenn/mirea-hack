import React, { useState } from 'react';
import Latex from 'react-latex-next';
import 'katex/dist/katex.min.css';
import './Input.css';
import MathPanel from './MathPanel';
import ComparisonModal from './ComparisonModal';
import { toPng } from 'html-to-image';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, MathRun } from 'docx';

const LatexInput = ({ isSidePanelOpen, setIsSidePanelOpen }) => {
    const [rows, setRows] = useState([{ id: 1, inputText: '' }]);
    const [activeRowId, setActiveRowId] = useState(null);
    const [isPanelOpen, setIsPanelOpen] = useState(true);
    const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);
    const [similarFormulas, setSimilarFormulas] = useState([]);
    const [exportModalOpen, setExportModalOpen] = useState(false);
    const [exportRowId, setExportRowId] = useState(null);

    const handleInputChange = (id, value) => {
        setRows((prevRows) =>
            prevRows.map((row) =>
                row.id === id ? { ...row, inputText: value } : row
            )
        );
    };

    const addRow = () => {
        if (rows.length < 4) {
            setRows((prevRows) => [
                ...prevRows,
                { id: prevRows.length + 1, inputText: '' },
            ]);
        } else {
            alert('Можно добавить не более 4 строк.');
        }
    };

    const removeRow = (id) => {
        setRows((prevRows) => prevRows.filter((row) => row.id !== id));
    };

    const handleInsertSymbol = (symbol) => {
        if (activeRowId !== null) {
            setRows((prevRows) =>
                prevRows.map((row) =>
                    row.id === activeRowId
                        ? { ...row, inputText: row.inputText + symbol }
                        : row
                )
            );
        }
    };

    const getWrappedText = (text, maxCharsPerLine = 40) => {
        const regex = new RegExp(`.{1,${maxCharsPerLine}}`, 'g');
        return text.match(regex) || [];
    };

    const handleExportTxt = (text) => {
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `formula_${new Date().toISOString()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        setExportModalOpen(false);
    };

    const handleExportDocx = (text) => {
        const doc = new Document({
            sections: [
                {
                    children: [
                        new Paragraph({
                            children: [new MathRun(text)], // MathRun создает формулу для Word
                        }),
                    ],
                },
            ],
        });

        Packer.toBlob(doc).then((blob) => {
            saveAs(blob, `formula_${new Date().toISOString()}.docx`);
        });
        setExportModalOpen(false);
    };

    const handleExportPng = async (id) => {
        const formulaElement = document.getElementById(`formula-${id}`);
        if (!formulaElement) return;

        try {
            const image = await toPng(formulaElement);
            saveAs(image, `formula_${new Date().toISOString()}.png`);
        } catch (error) {
            console.error('Ошибка при генерации PNG:', error);
        }
        setExportModalOpen(false);
    };

    const openExportModal = (rowId) => {
        setExportRowId(rowId);
        setExportModalOpen(true);
    };

    return (
        <div className="dynamic-inputs-container">
            <button
                className="toggle-side-panel-button"
                onClick={() => setIsSidePanelOpen(true)}
            >
                <img src="./basebtn.png" alt="Open Side Panel" />
            </button>

            {!isSidePanelOpen && (
                <>
                    {rows.map((row) => (
                        <div
                            key={row.id}
                            className="row-container"
                            onFocus={() => setActiveRowId(row.id)}
                        >
                            <div className="input-section">
                                <div className="gradient-bar">
                                    <span className="number">{row.id}</span>
                                </div>
                                <input
                                    type="text"
                                    className="text-input"
                                    value={row.inputText}
                                    onChange={(e) =>
                                        handleInputChange(row.id, e.target.value)
                                    }
                                    placeholder="Введите формулу..."
                                />
                                <button
                                    className="remove-row-button"
                                    onClick={() => removeRow(row.id)}
                                >
                                    Удалить
                                </button>
                            </div>
                            <div className="output-section">
                                <span className="output-number">{row.id}</span>
                                <div
                                    className="latex-output"
                                    id={`formula-${row.id}`}
                                >
                                    {getWrappedText(row.inputText).map((line, index) => (
                                        <div key={index}>
                                            <Latex>{`$${line}$`}</Latex>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <button
                                className="export-button"
                                onClick={() => openExportModal(row.id)}
                            >
                                <img src="./exportbtn.png" alt="Export" />
                            </button>
                        </div>
                    ))}

                    <button
                        className="toggle-panel-button"
                        onClick={() => setIsPanelOpen(!isPanelOpen)}
                    >
                        <img src="./keyboardbtn.png" alt="Open Math Panel" />
                    </button>

                    {isPanelOpen && <MathPanel onInsert={handleInsertSymbol} />}

                    <button onClick={addRow} className="add-button">
                        <img src="./Plus_circle.svg" alt="add-btn" />
                    </button>

                    <ComparisonModal
                        isOpen={isComparisonModalOpen}
                        onClose={() => setIsComparisonModalOpen(false)}
                        formulas={rows}
                        onCompare={(similarFormulas) => {
                            console.log('Результаты сравнения:', similarFormulas);
                            setSimilarFormulas(similarFormulas);
                        }}
                    />
                </>
            )}

            <button
                className="fixed-compare-button"
                onClick={() => setIsComparisonModalOpen(true)}
            >
                Сравнить формулы
            </button>

            {similarFormulas.length > 0 && (
                <div className="similar-formulas">
                    <h2>Самые похожие формулы:</h2>
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

            {exportModalOpen && (
                <div className="export-modal">
                    <h2>Выберите формат для экспорта</h2>
                    <button
                        onClick={() =>
                            handleExportTxt(
                                rows.find((row) => row.id === exportRowId)?.inputText || ''
                            )
                        }
                    >
                        Экспортировать как TXT
                    </button>
                    <button
                        onClick={() =>
                            handleExportDocx(
                                rows.find((row) => row.id === exportRowId)?.inputText || ''
                            )
                        }
                    >
                        Экспортировать как DOCX
                    </button>
                    <button
                        onClick={() =>
                            handleExportPng(exportRowId)
                        }
                    >
                        Экспортировать как PNG
                    </button>
                    <button onClick={() => setExportModalOpen(false)}>Отмена</button>
                </div>
            )}
        </div>
    );
};

export default LatexInput;
