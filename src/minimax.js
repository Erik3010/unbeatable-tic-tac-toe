import { O_TURN, X_TURN } from "./constants";

class Minimax {
  constructor(game) {
    this.counter = 0;

    this.game = game;
    this.INITIAL_DEPTH = 0;
  }
  calculate(board, player, depth = this.INITIAL_DEPTH) {
    this.counter++;

    const availableMoves = this.game.getAvailableMoves(board);
    const isWin = this.game.isWin(board);
    if (isWin) {
      const [winner] = isWin;
      if (winner === O_TURN) {
        return { score: depth - 10 };
      } else if (winner === X_TURN) {
        return { score: 10 - depth };
      }
    }

    if (!availableMoves.length) {
      return { score: 0 };
    }

    let bestScore = player === X_TURN ? -Infinity : Infinity;
    let bestMove;
    for (const { y, x } of availableMoves) {
      board[y][x] = player;

      const enemy = this.nextTurn(player);
      const { score } = this.calculate(board, enemy, depth + 1);
      if (
        (player === X_TURN && score > bestScore) ||
        (player === O_TURN && score < bestScore)
      ) {
        bestScore = score;
        bestMove = { y, x };
      }

      board[y][x] = null;
    }

    return { move: bestMove, score: bestScore };
  }
  nextTurn(turn) {
    return (turn % 2) + 1;
  }
}

export default Minimax;
