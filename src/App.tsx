import React from "react";
import Line from "./Line";

interface IProps {}

interface Selection {
    selections: string[];
    pos: number;
    boardPos: number;
}

interface IState {
    board: any[];
    stack: Selection[];
}

class App extends React.Component<IProps, IState> {
    constructor(props: any) {
        super(props);
        const initState = this.randomNewBoard();
        this.state = initState;

        this.nextState = this.nextState.bind(this);
        this.randomHandle = this.randomHandle.bind(this);
    }

    randomHandle() {
        const state = this.randomNewBoard();
        this.setState(state);
    }

    nextEmptyCell(pos: number, board: any[]) {
        let newPos = pos + 1;
        while (newPos < 81 && board[Math.floor(newPos / 9)][newPos % 9] !== ".") {
            newPos++;
        }
        return newPos;
    }

    randomNewBoard(): IState {
        const board = [
            // block 0
            ["5", "3", ".", ".", "7", ".", ".", ".", "."],
            ["6", ".", ".", "1", "9", "5", ".", ".", "."],
            [".", "9", "8", ".", ".", ".", ".", "6", "."],
            // block 1
            ["8", ".", ".", ".", "6", ".", ".", ".", "3"],
            ["4", ".", ".", "8", ".", "3", ".", ".", "1"],
            ["7", ".", ".", ".", "2", ".", ".", ".", "6"],
            //block 2
            [".", "6", ".", ".", ".", ".", "2", "8", "."],
            [".", ".", ".", "4", "1", "9", ".", ".", "5"],
            [".", ".", ".", ".", "8", ".", ".", "7", "9"],
        ];
        // find the first current Pos
        let boardPos = 0;
        while (boardPos < 81 && board[Math.floor(boardPos / 9)][boardPos % 9] !== ".") {
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
        };
    }

    /**
     * Return all possible value given a pos in the board
     * @param currPos
     * @param board
     */
    selectionList(currPos: number, board: any[]): string[] {
        const row = Math.floor(currPos / 9);
        const col = currPos % 9;

        const selections: string[] = [];

        const existed = Array(9).fill(false);
        // check row
        for (let i = 0; i < 9; i++) {
            if (board[i][col] !== ".") {
                const c = board[i][col];
                existed[parseInt(c, 10) - 1] = true;
            }
        }
        // check col
        for (let j = 0; j < 9; j++) {
            if (board[row][j] !== ".") {
                const c = board[row][j];
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
                if (board[i][j] !== ".") {
                    const c = board[i][j];
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
            if (newBoardPos < 81) {
                const newSelection: Selection = {
                    selections: this.selectionList(newBoardPos, newBoard),
                    pos: 0,
                    boardPos: newBoardPos,
                };
                this.setState({
                    board: newBoard,
                    stack: [...stack, newSelection],
                });
            } else {
                console.log("newPost over 81");
            }
        } else {
            if (stack.length >= 1) {
                // pop the last element out
                const last = stack[stack.length - 1];
                // create new board
                const newBoard = this.setBoardValue(last.boardPos, ".", board);
                let newStack = [...stack.slice(0, stack.length - 1)];

                if (newStack.length >= 1) {
                    const top = newStack[newStack.length - 1];
                    top.pos = top.pos + 1;
                }
                this.setState({
                    board: newBoard,
                    stack: newStack,
                });
            } else {
                console.log("old stack is empty");
            }
        }

        // schedule the next call
    }

    /**
     * Create a new board
     * @param currPos
     * @param value
     * @param board
     */
    setBoardValue(currPos: number, value: string, board: any[]): string[] {
        const row = Math.floor(currPos / 9);
        const col = currPos % 9;

        const newBoard = board.map((rows, i) => {
            const newLine = rows.map((ele: any, j: any) => {
                if (i === row && j === col) {
                    return value;
                } else {
                    return ele;
                }
            });
            return newLine;
        });

        return newBoard;
    }

    render() {
        const { board } = this.state;
        return (
            <>
                <div className="Buttons">
                    <button onClick={this.nextState}>Next State</button>
                    <button onClick={this.randomHandle}>Randomize</button>
                </div>
                {board.map((line, index) => (
                    <Line key={index} cells={line} />
                ))}
            </>
        );
    }
}

export default App;
