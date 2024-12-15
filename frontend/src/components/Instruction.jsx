// src/components/Instruction.js
import React from 'react';
import './Instruction.css';
const Instruction = () => {
    return (
        <div style={{ padding: '20px', backgroundColor: '#f9f9f9', border: '1px solid #ccc', borderRadius: '5px', color: '#000'}}>
            <div>
                <img src="./assets/exportbtn.png" alt="" />
                <span>для экспорта в различные форматы</span>
            </div>
            <div>
                <img src="./assets/handwritingbtn.png" alt="" />
                <span>анализ/сравнение формул на антиплагиат</span>
            </div>
            <div>
                <img src="./assets//Plus_circle.svg" alt="" />
                <span>добавить поле для ввода формулы</span>
            </div>
            <div>
                <img src="./assets//basebtn.png" alt="" />
                <span>Посмотреть/добавить базы формул</span>
            </div>
            <div>
                <img src="./assets/keyboardbtn.png" alt="" />
                <span>Для графического ввода</span>
            </div>
        </div>
    );
};

export default Instruction;
