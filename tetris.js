const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 20;

const colors = [
  null,
  "cyan", "blue", "orange", "yellow", "green", "purple", "red"
];

const tetrominoes = [
  [],
  [[1,1,1,1]],           // I
  [[2,0,0],[2,2,2]],     // J
  [[0,0,3],[3,3,3]],     // L
  [[4,4],[4,4]],         // O
  [[0,5,5],[5,5,0]],     // S
  [[0,6,0],[6,6,6]],     // T
  [[7,7,0],[0,7,7]]      // Z
];

let board = Array.from({length: ROWS}, () => Array(COLS).fill(0));
let current = {shape: [], x:0, y:0};
let score = 0;

// ブロック描画
function drawBlock(x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x*BLOCK_SIZE, y*BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
  ctx.strokeStyle = "#111";
  ctx.strokeRect(x*BLOCK_SIZE, y*BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
}

// ボード描画
function drawBoard() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for(let y=0; y<ROWS; y++){
    for(let x=0; x<COLS; x++){
      if(board[y][x]){
        drawBlock(x, y, colors[board[y][x]]);
      }
    }
  }
  // 現在ブロック
  for(let y=0; y<current.shape.length; y++){
    for(let x=0; x<current.shape[y].length; x++){
      if(current.shape[y][x]){
        drawBlock(current.x + x, current.y + y, colors[current.shape[y][x]]);
      }
    }
  }
  // スコア
  ctx.fillStyle = "white";
  ctx.font = "16px Arial";
  ctx.fillText("Score: " + score, 10, 20);
}

// ランダムにテトリミノ生成
function randomTetromino(){
  const id = Math.floor(Math.random() * (tetrominoes.length - 1)) + 1;
  return {shape: tetrominoes[id], x: Math.floor(COLS/2)-1, y: 0};
}

// 衝突判定（端とブロック両方チェック）
function collide() {
  for (let y = 0; y < current.shape.length; y++) {
    for (let x = 0; x < current.shape[y].length; x++) {
      if (current.shape[y][x]) {
        const newX = current.x + x;
        const newY = current.y + y;
        if (newX < 0 || newX >= COLS || newY >= ROWS || board[newY][newX] !== 0) {
          return true;
        }
      }
    }
  }
  return false;
}

// ボードにブロック固定
function merge(){
  for(let y=0; y<current.shape.length; y++){
    for(let x=0; x<current.shape[y].length; x++){
      if(current.shape[y][x]){
        board[current.y + y][current.x + x] = current.shape[y][x];
      }
    }
  }
}

// 一列揃ったら削除
function sweep(){
  outer: for(let y=ROWS-1; y>=0; y--){
    for(let x=0; x<COLS; x++){
      if(board[y][x] === 0) continue outer;
    }
    const row = board.splice(y,1)[0].fill(0);
    board.unshift(row);
    score += 10;
    y++;
  }
}

// 左右移動
function move(dir){
  current.x += dir;
  if(collide()) current.x -= dir;
}

// ブロック落下
function drop(){
  current.y++;
  if(collide()){
    current.y--;
    merge();
    sweep();
    current = randomTetromino();
    if(collide()){
      board = Array.from({length: ROWS}, () => Array(COLS).fill(0));
      score = 0;
      alert("ゲームオーバー！");
    }
  }
}

// 回転
function rotate(matrix){
  return matrix[0].map((_,i) => matrix.map(row => row[i])).map(row => row.reverse());
}

// キーボード操作
document.addEventListener("keydown", e => {
  if(e.key === "ArrowLeft") move(-1);
  else if(e.key === "ArrowRight") move(1);
  else if(e.key === "ArrowDown") drop();
  else if(e.key === "ArrowUp") {
    const rotated = rotate(current.shape);
    const oldX = current.x;
    current.shape = rotated;
    // 回転後衝突したら元に戻す
    if(collide()) current.shape = rotate(rotate(rotate(rotated)));
  }
  drawBoard();
});

// ゲーム開始
current = randomTetromino();
drawBoard();
setInterval(() => { drop(); drawBoard(); }, 500);
