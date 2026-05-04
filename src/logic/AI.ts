import { Player } from './GameState';

export enum Difficulty {
    Easy = 'easy',
    Medium = 'medium',
    Hard = 'hard'
}

export class AI {
    public static getMove(board: Player[], difficulty: Difficulty): number {
        switch (difficulty) {
            case Difficulty.Easy:
                return this.getRandomMove(board);
            case Difficulty.Medium:
                return this.getMediumMove(board);
            case Difficulty.Hard:
                return this.getBestMove(board);
            default:
                return this.getRandomMove(board);
        }
    }

    private static getRandomMove(board: Player[]): number {
        const available = board.map((v, i) => v === null ? i : null).filter(v => v !== null) as number[];
        return available[Math.floor(Math.random() * available.length)];
    }

    private static getMediumMove(board: Player[]): number {
        // Try to win or block
        const winMove = this.findWinningMove(board, 'O');
        if (winMove !== -1) return winMove;

        const blockMove = this.findWinningMove(board, 'X');
        if (blockMove !== -1) return blockMove;

        return this.getRandomMove(board);
    }

    private static findWinningMove(board: Player[], player: Player): number {
        const lines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];

        for (const line of lines) {
            const [a, b, c] = line;
            const values = [board[a], board[b], board[c]];
            if (values.filter(v => v === player).length === 2 && values.filter(v => v === null).length === 1) {
                return line[values.indexOf(null)];
            }
        }
        return -1;
    }

    private static getBestMove(board: Player[]): number {
        let bestScore = -Infinity;
        let move = -1;
        for (let i = 0; i < 9; i++) {
            if (board[i] === null) {
                board[i] = 'O';
                let score = this.minimax(board, 0, false);
                board[i] = null;
                if (score > bestScore) {
                    bestScore = score;
                    move = i;
                }
            }
        }
        return move;
    }

    private static minimax(board: Player[], depth: number, isMaximizing: boolean): number {
        const result = this.checkWinner(board);
        if (result === 'O') return 10 - depth;
        if (result === 'X') return depth - 10;
        if (!board.includes(null)) return 0;

        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === null) {
                    board[i] = 'O';
                    let score = this.minimax(board, depth + 1, false);
                    board[i] = null;
                    bestScore = Math.max(score, bestScore);
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === null) {
                    board[i] = 'X';
                    let score = this.minimax(board, depth + 1, true);
                    board[i] = null;
                    bestScore = Math.min(score, bestScore);
                }
            }
            return bestScore;
        }
    }

    private static checkWinner(board: Player[]): Player {
        const lines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];
        for (const line of lines) {
            const [a, b, c] = line;
            if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
        }
        return null;
    }
}