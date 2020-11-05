import React from "react";
import "./Line.css";
import { Cell } from "./App";

type LineProps = {
    lineNum: number;
    cells: Cell[];
};

const Line: React.FC<LineProps> = ({ cells, lineNum }) => {
    return (
        <ul className="Line">
            {cells.map((cell, index) => (
                <li key={index} className={`Cell ${cell.isOriginal && "text-red"} ${[2, 5].includes(index) && "border-right"} ${[2, 5].includes(lineNum) && "border-bottom"}`}>
                    {cell.value}
                </li>
            ))}
        </ul>
    );
};

export default Line;
