import React from "react";
import "./Line.css";

type LineProps = {
    cells: string[];
};

const Line: React.FC<LineProps> = ({ cells }) => {
    return (
        <ul className="Line">
            {cells.map((cell, index) => (
                <li key={index} className="Cell">
                    {cell}
                </li>
            ))}
        </ul>
    );
};

export default Line;
