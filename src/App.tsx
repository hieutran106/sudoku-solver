import React from "react";
import Line from "./Line";
import { randomSudoku } from "./sudokus";

interface IProps {}

interface Selection {
    selections: string[];
    pos: number;
    boardPos: number;
}

export interface Cell {
    isOriginal: boolean;
    value: string;
}

interface IState {
    board: Cell[][];
    stack: Selection[];
    timeoutId: number;
    status: "init" | "solving" | "solved";
}

const ANIMATION_DURATION = 10;

class App extends React.Component<IProps, IState> {
    constructor(props: any) {
        super(props);
        const initState = this.randomNewBoard();

        this.state = initState;

        this.solveSudokuHandler = this.solveSudokuHandler.bind(this);
        this.nextState = this.nextState.bind(this);
        this.randomHandle = this.randomHandle.bind(this);
    }

    randomHandle() {
        const state = this.randomNewBoard();
        this.setState(state);
    }

    nextEmptyCell(pos: number, board: Cell[][]) {
        let newPos = pos + 1;
        while (newPos < 81 && board[Math.floor(newPos / 9)][newPos % 9].value !== ".") {
            newPos++;
        }
        return newPos;
    }

    randomNewBoard(): IState {
        const timeoutId = this.state?.timeoutId;
        if (timeoutId) {
            clearTimeout(timeoutId);
        }

        // const premitiveBoard = [
        //     // block 0
        //     ["5", "3", ".", ".", "7", ".", ".", ".", "."],
        //     ["6", ".", ".", "1", "9", "5", ".", ".", "."],
        //     [".", "9", "8", ".", ".", ".", ".", "6", "."],
        //     // block 1
        //     ["8", ".", ".", ".", "6", ".", ".", ".", "3"],
        //     ["4", ".", ".", "8", ".", "3", ".", ".", "1"],
        //     ["7", ".", ".", ".", "2", ".", ".", ".", "6"],
        //     //block 2
        //     [".", "6", ".", ".", ".", ".", "2", "8", "."],
        //     [".", ".", ".", "4", "1", "9", ".", ".", "5"],
        //     [".", ".", ".", ".", "8", ".", ".", "7", "9"],
        // ];
        // const premitiveBoard = [
        //     // block 0
        //     ["5", "3", "4", "6", "7", "8", ".", ".", "."],
        //     ["6", ".", ".", "1", "9", "5", ".", ".", "."],
        //     [".", "9", "8", ".", ".", ".", ".", "6", "."],
        //     // block 1
        //     ["8", ".", ".", ".", "6", ".", ".", ".", "3"],
        //     ["4", ".", ".", "8", ".", "3", ".", ".", "1"],
        //     ["7", ".", ".", ".", "2", ".", ".", ".", "6"],
        //     //block 2
        //     [".", "6", ".", ".", ".", ".", "2", "8", "."],
        //     [".", ".", ".", "4", "1", "9", ".", ".", "5"],
        //     [".", ".", ".", ".", "8", ".", ".", "7", "9"],
        // ];

        // const premitiveBoard = [
        //     // block 0
        //     ["5", "3", "4", "6", "7", "8", "9", "1", "2"],
        //     ["6", "7", "2", "1", "9", "5", "3", "4", "8"],
        //     ["1", "9", "8", "3", "4", "2", "5", "6", "7"],
        //     // block 1
        //     ["8", "5", "9", "7", "6", ".", ".", ".", "3"],
        //     ["4", ".", ".", "8", ".", "3", ".", ".", "1"],
        //     ["7", ".", ".", ".", "2", ".", ".", ".", "6"],
        //     //block 2
        //     [".", "6", ".", ".", ".", ".", "2", "8", "."],
        //     [".", ".", ".", "4", "1", "9", ".", ".", "5"],
        //     [".", ".", ".", ".", "8", ".", ".", "7", "9"],
        // ];

        const premitiveBoard = randomSudoku();
        const board = premitiveBoard.map((line) => {
            const newLine = line.map((ele) => ({ value: ele, isOriginal: ele !== "." }));
            return newLine;
        });

        // find the first current Pos
        let boardPos = 0;
        while (boardPos < 81 && board[Math.floor(boardPos / 9)][boardPos % 9].value !== ".") {
            boardPos++;
        }

        let selections = this.selectionList(boardPos, board);

        return {
            board,
            stack: [
                {
                    selections,
                    pos: 0,
                    boardPos: boardPos,
                },
            ],
            timeoutId: 0,
            status: "init",
        };
    }

    /**
     * Return all possible value given a pos in the board
     * @param currPos
     * @param board
     */
    selectionList(currPos: number, board: Cell[][]): string[] {
        const row = Math.floor(currPos / 9);
        const col = currPos % 9;

        const selections: string[] = [];

        const existed = Array(9).fill(false);
        // check row
        for (let i = 0; i < 9; i++) {
            if (board[i][col].value !== ".") {
                const c = board[i][col].value;
                existed[parseInt(c, 10) - 1] = true;
            }
        }
        // check col
        for (let j = 0; j < 9; j++) {
            if (board[row][j].value !== ".") {
                const c = board[row][j].value;
                existed[parseInt(c, 10) - 1] = true;
            }
        }
        // check region

        const lowerX = 3 * Math.floor(row / 3);
        const upperX = lowerX + 3;

        const lowerY = 3 * Math.floor(col / 3);
        const upperY = lowerY + 3;

        for (let i = lowerX; i < upperX; i++)
            for (let j = lowerY; j < upperY; j++) {
                if (board[i][j].value !== ".") {
                    const c = board[i][j].value;
                    existed[parseInt(c, 10) - 1] = true;
                }
            }

        // add non-existed number to selection list
        for (let k = 0; k < 9; k++) {
            if (existed[k] === false) {
                const index = k;
                selections.push("" + (index + 1));
            }
        }
        return selections;
    }

    solveSudokuHandler() {
        const timeoutId = this.state.timeoutId;
        if (timeoutId !== 0) {
            return;
        }

        this.nextState();
    }

    nextState() {
        const { stack, board } = this.state;
        const top = stack[stack.length - 1];
        const { selections, pos, boardPos } = top;
        if (pos < selections.length) {
            // fill value into current cell
            const value = selections[pos];
            const newBoard = this.setBoardValue(boardPos, value, board);

            // find the next cell
            const newBoardPos = this.nextEmptyCell(boardPos, newBoard);
            this.setState({
                board: newBoard,
            });
            if (newBoardPos < 81) {
                const newSelection: Selection = {
                    selections: this.selectionList(newBoardPos, newBoard),
                    pos: 0,
                    boardPos: newBoardPos,
                };

                // schedule next call
                const timeoutId = window.setTimeout(() => {
                    this.nextState();
                }, ANIMATION_DURATION);
                this.setState({
                    stack: [...stack, newSelection],
                    timeoutId,
                    status: "solving",
                });
            } else {
                console.log("end");
                this.setState({
                    status: "solved",
                });
            }
        } else {
            // pop consecutive stack calls until find a pos that does not exceed selection length
            const indexes: number[] = [];
            const filledPosition: number[] = [];
            for (let j = stack.length - 1; j >= 0; j--) {
                const { pos, selections, boardPos } = stack[j];
                if (pos >= selections.length - 1) {
                    // if (selection.pos === selection.selections.length) {
                    indexes.push(j);
                    filledPosition.push(boardPos);
                } else {
                    break;
                }
            }

            let newBoard = this.emptyBoardAtPosition(filledPosition, board);
            const newStack = stack.filter((ele, index) => !indexes.includes(index));

            if (newStack.length >= 1) {
                const top = newStack[newStack.length - 1];
                top.pos = top.pos + 1;
            }

            // schedule next call
            const timeoutId = window.setTimeout(() => {
                this.nextState();
            }, ANIMATION_DURATION);

            this.setState({
                board: newBoard,
                stack: newStack,
                timeoutId,
                status: "solving",
            });
        }

        // schedule the next call
    }

    /**
     * Create a new board
     * @param currPos
     * @param value
     * @param board
     */
    setBoardValue(currPos: number, value: string, board: Cell[][]): Cell[][] {
        const row = Math.floor(currPos / 9);
        const col = currPos % 9;

        const newBoard = board.map((rows, i) => {
            const newLine = rows.map((ele: Cell, j: any) => {
                if (i === row && j === col) {
                    return {
                        value,
                        isOriginal: ele.isOriginal,
                    };
                } else {
                    return ele;
                }
            });
            return newLine;
        });

        return newBoard;
    }

    /**
     * Create a new board
     * @param currPos
     * @param value
     * @param board
     */
    emptyBoardAtPosition(positions: number[], board: Cell[][]): Cell[][] {
        const newBoard = board.map((rows, i) => {
            const newLine = rows.map((ele: Cell, j: any) => {
                const curr = i * 9 + j;
                if (positions.includes(curr)) {
                    return {
                        value: ".",
                        isOriginal: ele.isOriginal,
                    };
                } else {
                    return ele;
                }
            });
            return newLine;
        });

        return newBoard;
    }

    render() {
        const { board, status } = this.state;
        let msg;
        if (status === "solving") {
            msg = <p>Solving the puzzle</p>;
        } else if (status === "solved") {
            msg = <p>Solved!</p>;
        }

        return (
            <div>
                <div className="grid">
                    <div className="game-board">
                        {board.map((line, index) => (
                            <Line key={index} lineNum={index} cells={line} />
                        ))}
                    </div>
                    <div className="right-column">
                        <h1>EzSudoku</h1>
                        {msg}
                        <div className="game-buttons">
                            <button onClick={this.randomHandle} style={{ marginBottom: "20px", padding: "15px" }}>
                                New Game
                            </button>
                            <button className="button-solve" onClick={this.solveSudokuHandler} title="Solve the Sudoku using back-tracking algorithm">
                                Solve!
                            </button>
                        </div>
                    </div>
                </div>
                <div className="box">
                    <h5 className="header">SUDOKU RULES</h5>
                    <p className="info">
                        Sudoku is a puzzle game, where the object is to use the numbers from 1-9 to fill every row, column and box. Each number can only occur once in every row,
                        column or box. A number of fields will have numbers in them at the start, the rest will be filled in by you. If you manage to fill all the fields without
                        ever having a duplicate number in a unit (row, column or box), you win the game.
                    </p>
                </div>
            </div>
        );
    }
}

export default App;
