export type Player = 'X' | 'O' | null;

export class GameState {
    private board: Player[] = Array(9).fill(null);
    public currentPlayer: Player = 'X';
    public winner: Player = null;
    public winningLine: number[] | null = null;
    public history: Player[][] = [];
    public scores = { X: 0, O: 0 };
    public isGameOver: boolean = false;

    constructor() {}

    public makeMove(index: number): boolean {
        if (this.board[index] || this.isGameOver) return false;

        this.history.push([...this.board]);
        this.board[index] = this.currentPlayer;
        this.checkWinner();
        
        if (!this.isGameOver) {
            this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        }
        return true;
    }

    private checkWinner() {
        const lines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
            [0, 4, 8], [2, 4, 6]             // Diags
        ];

        for (const line of lines) {
            const [a, b, c] = line;
            if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
                this.winner = this.board[a];
                this.winningLine = line;
                this.isGameOver = true;
                if (this.winner) this.scores[this.winner]++;
                return;
            }
        }

        if (!this.board.includes(null)) {
            this.isGameOver = true;
        }
    }

    public undo(): boolean {
        if (this.history.length === 0 || this.isGameOver) return false;
        this.board = this.history.pop()!;
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        return true;
    }

    public reset() {
        this.board = Array(9).fill(null);
        this.currentPlayer = 'X';
        this.winner = null;
        this.winningLine = null;
        this.history = [];
        this.isGameOver = false;
    }

    public getBoard() { return this.board; }
}