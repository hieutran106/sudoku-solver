import React from "react";
import Line from "./Line";

interface IProps {}

interface Selection {
    selections: string[];
    pos: number;
}

interface IState {
    board: any[];
    currPos: number;
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

    randomNewBoard() {
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
        let currPos = 0;
        while (currPos < 81 && board[Math.floor(currPos / 9)][currPos % 9] !== ".") {
            currPos++;
        }

        let selections = this.selectionList(currPos, board);
        return {
            board,
            currPos,
            stack: [
                {
                    selections,
                    pos: 0,
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
        const { currPos, stack, board } = this.state;
        const top = stack[stack.length - 1];
        const { selections, pos } = top;
        if (pos < selections.length) {
            // fill value into current cell
            const value = selections[pos];
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
            // find the next cell
            const newPos = this.nextEmptyCell(currPos, newBoard);
            if (newPos < 81) {
                const newSelection: Selection = {
                    selections: this.selectionList(newPos, board),
                    pos: 0,
                };
                this.setState({
                    board: newBoard,
                    currPos: newPos,
                    stack: [...stack, newSelection],
                });
            } else {
                console.log("newPost over 81");
            }
        } else {
            this.setState({});
        }
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
