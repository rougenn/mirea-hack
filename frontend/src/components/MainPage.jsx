import React, { useState } from 'react';
import Navbar from './Navbar';
import LatexInput from './Input';
import Background from './Background';
import SidePanel from './SidePanel'; // Импортируем компонент боковой панели
import CreateBaseForm from './CreateBaseForm'; // Импортируем компонент для создания баз формул
import 'katex/dist/katex.min.css';
import formulas from './formulas.json'; // Исходные формулы

export default function MainPage() {
    const [isSidePanelOpen, setIsSidePanelOpen] = useState(false); // Состояние для управления панелью
    const [customBases, setCustomBases] = useState([]); // Пользовательские базы формул
    const [selectedBase, setSelectedBase] = useState(null); // Выбранная база формул
    const [isCreatingBase, setIsCreatingBase] = useState(false); // Состояние для отображения формы создания базы

    // Функция для добавления новой базы формул
    const addNewBase = (newBase) => {
        setCustomBases([...customBases, newBase]);
        setIsCreatingBase(false); // Закрываем форму создания базы
    };

    // Формулы для отображения (либо изначальные, либо выбранная база)
    const displayedFormulas = selectedBase ? selectedBase.formulas : formulas;

    return (
        <Background>
            <Navbar />
            <LatexInput
                isSidePanelOpen={isSidePanelOpen} // Передаем состояние в компонент LatexInput
                setIsSidePanelOpen={setIsSidePanelOpen} // Передаем функцию для управления состоянием
            />

            {/* Кнопка для открытия/закрытия боковой панели (картинка) */}
            <button
                className="toggle-side-panel-button"
                onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
            >
                <img src="./basebtn.png" alt="Toggle Side Panel" />
            </button>

            {/* Боковая панель */}
            <SidePanel
                isOpen={isSidePanelOpen} // Передаем состояние в компонент SidePanel
                onClose={() => setIsSidePanelOpen(false)} // Функция для закрытия панели
                formulas={displayedFormulas} // Передаем формулы в SidePanel
                customBases={customBases} // Передаем пользовательские базы
                selectedBase={selectedBase} // Передаем выбранную базу
                setSelectedBase={setSelectedBase} // Функция для выбора базы
                onCreateBase={() => setIsCreatingBase(true)} // Функция для открытия формы создания базы
            />

            {/* Модальное окно для создания новой базы */}
            {isCreatingBase && (
                <CreateBaseForm
                    onAddBase={addNewBase} // Функция для добавления новой базы
                    onClose={() => setIsCreatingBase(false)} // Функция для закрытия формы
                    initialFormulas={formulas} // Передаем исходные формулы
                />
            )}
        </Background>
    );
}