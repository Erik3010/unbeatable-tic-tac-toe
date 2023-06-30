import { parseToSVG, createElement } from "./utility";
import { X_TURN, O_TURN, DIRECTIONS, AVAILABLE_ASSETS } from "./constants";
import Minimax from "./minimax";

class TicTacToe {
  constructor() {
    this.row = 3;
    this.col = 3;

    this.turn = O_TURN;

    this.board = [];
    this.boardEl = document.querySelector(".board");

    this.assets = {};

    this.minimax = new Minimax(this);
  }
  async init() {
    await this.loadAssets();
    this.initBoard();
  }
  async loadAssets() {
    const [o, x] = await Promise.all(
      AVAILABLE_ASSETS.map(this.loadAsset.bind(this))
    );

    this.assets["o"] = o;
    this.assets["x"] = x;
  }
  async loadAsset(file) {
    const svgString = await (await fetch(`./${file}`)).text();
    const doc = parseToSVG(svgString);
    return doc.querySelector("svg");
  }
  initBoard() {
    for (let y = 0; y < this.row; y++) {
      this.board[y] = [];
      for (let x = 0; x < this.col; x++) {
        this.board[y][x] = null;

        const cell = this.createCell({ y, x });
        this.boardEl.appendChild(cell);
      }
    }
  }
  createCell({ y, x }) {
    const cell = createElement("div", { props: { class: ["cell"] } });

    const handler = this.handleCellClick.bind(this, cell, { y, x });
    cell.addEventListener("click", handler);

    return cell;
  }
  animateCell(cell) {
    const elements = cell.querySelectorAll("svg > *");
    for (const element of elements) {
      const pathLength = element.getTotalLength();
      element.setAttribute("stroke-dasharray", pathLength);
      element.setAttribute("stroke-dashoffset", pathLength);

      element.classList.add("animate");
    }
  }
  handleCellClick(cell, { y, x }) {
    if (this.board[y][x] !== null || this.turn === X_TURN) return;

    this.putCellInBoard({ y, x }, cell);

    setTimeout(this.botMove.bind(this), 250);
  }
  botMove() {
    const { move } = this.minimax.calculate(this.board, X_TURN);
    if (!move) return;

    this.putCellInBoard(move);
  }
  putCellInBoard({ y, x }, cellEl = null) {
    this.board[y][x] = this.turn;

    const type = this.turn === O_TURN ? "o" : "x";
    const svg = this.assets[type].cloneNode(true);
    const cell = cellEl ?? this.getCellByCoordinate({ y, x });

    cell.appendChild(svg);

    this.animateCell(cell);
    this.checkWin();
    this.nextTurn();
  }
  isWin(board = this.board) {
    for (const [y, row] of board.entries()) {
      for (const [x, cell] of row.entries()) {
        const direction = this.checkAroundCell({ y, x }, board);
        if (cell === null || !direction) continue;
        return [cell, { y, x }, direction];
      }
    }
    return false;
  }
  checkWin() {
    const isWin = this.isWin();
    if (!isWin) return;

    const [_, { y, x }, { y: dirY, x: dirX }] = isWin;

    const startCell = this.getCellByCoordinate({ y, x });
    const targetCell = this.getCellByCoordinate({
      y: y + dirY * (this.row - 1),
      x: x + dirX * (this.col - 1),
    });
    this.animatePath(
      { position: { y, x }, el: startCell },
      { position: { y: y + dirY * 2, x: x + dirX * 2 }, el: targetCell }
    );
  }
  animatePath(start, target) {
    const boardRect = this.boardEl.getBoundingClientRect();
    const startRect = start.el.getBoundingClientRect();
    const targetRect = target.el.getBoundingClientRect();

    const svg = createElement("svg", {
      namespaced: true,
      props: {
        width: boardRect.width,
        height: boardRect.height,
        class: ["path-svg"],
      },
    });

    const startCenterX =
      start.position.x === target.position.x
        ? 0
        : start.position.x > target.position.x
        ? startRect.width / 2
        : -(startRect.width / 2);
    const startCenterY =
      start.position.y === target.position.y ? 0 : -startRect.height / 2;
    const startPos = {
      x: startRect.x - boardRect.x + (startRect.width / 2 + startCenterX),
      y: startRect.y - boardRect.y + (startRect.height / 2 + startCenterY),
    };

    const targetCenterX =
      start.position.x === target.position.x
        ? 0
        : start.position.x < target.position.x
        ? startRect.width / 2
        : -startRect.width / 2;
    const targetCenterY =
      start.position.y === target.position.y ? 0 : startRect.height / 2;
    const targetPos = {
      x: targetRect.x - boardRect.x + (targetRect.width / 2 + targetCenterX),
      y: targetRect.y - boardRect.y + (targetRect.height / 2 + targetCenterY),
    };

    const path = createElement("path", {
      namespaced: true,
      props: {
        d: `M${startPos.x} ${startPos.y} L${targetPos.x} ${targetPos.y}`,
        class: ["path", "animate"],
      },
    });

    const pathLength = path.getTotalLength();
    path.setAttribute("stroke-dashoffset", pathLength);
    path.setAttribute("stroke-dasharray", pathLength);

    svg.appendChild(path);
    this.boardEl.appendChild(svg);
  }
  checkAroundCell({ y, x }, board = this.board) {
    for (const [dirX, dirY] of DIRECTIONS) {
      let count = 0;
      const current = board[y][x];

      for (let step = 1; step <= 2; step++) {
        const nextY = y + Math.sign(dirY) * step;
        const nextX = x + Math.sign(dirX) * step;

        if (!this.inBoard({ y: nextY, x: nextX })) continue;
        if (board[nextY][nextX] === current) count++;
      }
      if (count >= 2) return { x: dirX, y: dirY };
    }
    return false;
  }
  getCellByCoordinate({ y, x }) {
    const position = y * this.row + x + 1;
    return document.querySelector(`.cell:nth-child(${position})`);
  }
  getAvailableMoves(board = this.board) {
    const moves = [];
    for (const [y, row] of board.entries()) {
      for (const [x, col] of row.entries()) {
        if (col === null) moves.push({ y, x });
      }
    }
    return moves;
  }
  get hasEmptyCell() {
    return this.board.some((row) => row.some((cell) => cell === null));
  }
  nextTurn() {
    this.turn = this.enemy;
  }
  get enemy() {
    return (this.turn % 2) + 1;
  }
  inBoard({ y, x }) {
    return y >= 0 && x >= 0 && y < this.row && x < this.col;
  }
}

export default TicTacToe;
