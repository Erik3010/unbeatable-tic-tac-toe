import { parseToSVG } from "./utility";
import { X_TURN, O_TURN, DIRECTIONS } from "./constants";

class TicTacToe {
  constructor() {
    this.row = 3;
    this.col = 3;

    this.turn = X_TURN;

    this.board = [];
    this.boardEl = document.querySelector(".board");

    this.assets = {};
    this.availableAssets = ["o.svg", "x.svg"];
  }
  async init() {
    await this.loadAssets();
    this.initBoard();
  }
  async loadAssets() {
    const [o, x] = await Promise.all(
      this.availableAssets.map(this.loadAsset.bind(this))
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
    const cell = document.createElement("div");
    const handler = this.handleCellClick.bind(this, cell, { y, x });

    cell.classList.add("cell");
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
    if (this.board[y][x] !== null) return;
    this.board[y][x] = this.turn;

    const type = this.turn === O_TURN ? "o" : "x";
    const svg = this.assets[type].cloneNode(true);

    cell.appendChild(svg);
    this.animateCell(cell);

    this.checkWin();

    this.nextTurn();
  }
  checkWin() {
    for (const [y, row] of this.board.entries()) {
      for (const [x, cell] of row.entries()) {
        if (cell === null) continue;

        const isWin = this.checkAroundCell({ y, x });
        if (isWin) {
          const { y: dirY, x: dirX } = isWin;
          const targetNum =
            (y + isWin.y * 2) * this.row + (x + isWin.x * 2) + 1;

          const startCell = this.getCellByCoordinate({ y, x });
          const targetCell = this.getCellByCoordinate({
            y: y + dirY * 2,
            x: x + dirX * 2,
          });
          this.animatePath(startCell, targetCell);
          // console.log(startCell, targetCell);

          return;
        }
      }
    }
  }
  animatePath(startCell, targetCell) {
    const start = startCell.getBoundingClientRect();
    const target = targetCell.getBoundingClientRect();

    const { x, y, width, height } = this.boardEl.getBoundingClientRect();

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", width);
    svg.setAttribute("height", height);
    svg.classList.add("path-svg");

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.classList.add("path");
    path.setAttribute(
      "d",
      `M${start.x - x + start.width / 2} ${start.y - y + start.height / 2} L${
        target.x - x + target.width / 2
      } ${target.y - y + target.height / 2}`
    );

    const pathLength = path.getTotalLength();
    path.setAttribute("stroke-dashoffset", pathLength);
    path.setAttribute("stroke-dasharray", pathLength);
    path.classList.add("animate");

    svg.appendChild(path);
    this.boardEl.appendChild(svg);
  }
  getCellByCoordinate({ y, x }) {
    const order = y * this.row + x + 1;
    return document.querySelector(`.cell:nth-child(${order})`);
  }
  checkAroundCell({ y, x }) {
    for (const [dirX, dirY] of DIRECTIONS) {
      let count = 0;
      const current = this.board[y][x];

      for (let step = 1; step <= 2; step++) {
        const nextY = y + Math.sign(dirY) * step;
        const nextX = x + Math.sign(dirX) * step;

        if (!this.inBoard({ y: nextY, x: nextX })) continue;
        if (this.board[nextY][nextX] === current) count++;
      }
      if (count >= 2) return { x: dirX, y: dirY };
    }
    return null;
  }
  nextTurn() {
    this.turn = (this.turn % 2) + 1;
  }
  inBoard({ y, x }) {
    return y >= 0 && x >= 0 && y < this.row && x < this.col;
  }
}

export default TicTacToe;
