import { O_TURN, X_TURN } from "./constants";
import { DIRECTIONS } from "./constants";

class Minimax {
  constructor() {
    this.counter = 0;
    this.row = 3;
    this.col = 3;
  }

  calculate(board, player) {
    this.counter++;

    const moves = this.getAvailableMoves(board);
    // console.log(JSON.parse(JSON.stringify(board)), this.checkWin(board));

    const winner = this.checkWin(board);
    if (winner) {
      if (winner === O_TURN) {
        return { score: -1 };
      } else if (winner === X_TURN) {
        return { score: 1 };
      }
    }

    if (!moves.length) {
      return { score: 0 };
    }

    let bestScore = player === X_TURN ? -Infinity : Infinity;
    let bestMove;
    for (const { y, x } of moves) {
      board[y][x] = player;

      const turn = this.nextTurn(player);
      const score = this.calculate(board, turn).score;
      if (player === X_TURN) {
        if (score > bestScore) {
          bestScore = score;
          bestMove = { y, x };
        }
      } else if (player === O_TURN) {
        if (score < bestScore) {
          bestScore = score;
          bestMove = { y, x };
        }
      }
      board[y][x] = null;
    }

    return { move: bestMove, score: bestScore };
  }
  nextTurn(turn) {
    return (turn % 2) + 1;
  }
  checkWin(board) {
    for (const [y, row] of board.entries()) {
      for (const [x, cell] of row.entries()) {
        if (cell === null) continue;
        const isWin = this.checkAroundCell({ y, x }, board);
        if (isWin) return cell;
      }
    }
    return false;
  }
  checkAroundCell({ y, x }, board) {
    for (const [dirX, dirY] of DIRECTIONS) {
      let count = 0;
      const current = board[y][x];

      for (let step = 1; step <= 2; step++) {
        const nextY = y + Math.sign(dirY) * step;
        const nextX = x + Math.sign(dirX) * step;

        if (!this.inBoard({ y: nextY, x: nextX })) continue;
        if (board[nextY][nextX] === current) count++;
      }
      if (count >= 2) return true;
    }
    return false;
  }
  inBoard({ y, x }) {
    return y >= 0 && x >= 0 && y < this.row && x < this.col;
  }
  getAvailableMoves(board) {
    const moves = [];
    for (const [y, row] of board.entries()) {
      for (const [x, col] of row.entries()) {
        if (col === null) moves.push({ y, x });
      }
    }
    return moves;
  }
}

export default Minimax;
