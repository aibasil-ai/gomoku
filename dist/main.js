"use strict";
const canvas = document.getElementById("board");
const statusEl = document.getElementById("status");
const resetBtn = document.getElementById("reset");
// 開始畫面元素
const startScreen = document.getElementById("start-screen");
const modeSelection = document.getElementById("mode-selection");
const difficultySelection = document.getElementById("difficulty-selection");
const btnPvp = document.getElementById("btn-pvp");
const btnPve = document.getElementById("btn-pve");
const btnBack = document.getElementById("btn-back");
const difficultyBtns = document.querySelectorAll(".difficulty-btn");
if (!canvas || !statusEl || !resetBtn) {
    throw new Error("Missing required DOM elements");
}
if (!startScreen || !modeSelection || !difficultySelection || !btnPvp || !btnPve || !btnBack) {
    throw new Error("Missing start screen DOM elements");
}
const ctx = canvas.getContext("2d");
if (!ctx) {
    throw new Error("2D context not supported");
}
// Non-null 斷言後的變數（TypeScript 知道這些不會是 null）
const canvasEl = canvas;
const statusElement = statusEl;
const resetButton = resetBtn;
const startScreenEl = startScreen;
const modeSelectionEl = modeSelection;
const difficultySelectionEl = difficultySelection;
const btnPvpEl = btnPvp;
const btnPveEl = btnPve;
const btnBackEl = btnBack;
const context = ctx;
const BOARD_SIZE = 15;
const CANVAS_SIZE = 560;
const PADDING = 28;
const CELL = (CANVAS_SIZE - PADDING * 2) / (BOARD_SIZE - 1);
const STONE_RADIUS = 14;
canvas.width = CANVAS_SIZE;
canvas.height = CANVAS_SIZE;
const board = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(0));
let currentPlayer = 1;
let gameOver = false;
let lastMove = null;
let moveCount = 0;
let gameMode = "pvp";
let difficulty = "medium";
let aiThinking = false;
const starPoints = [3, 7, 11];
function getCanvasPoint(event) {
    const rect = canvasEl.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
        return null;
    }
    const scaleX = canvasEl.width / rect.width;
    const scaleY = canvasEl.height / rect.height;
    return {
        x: (event.clientX - rect.left) * scaleX,
        y: (event.clientY - rect.top) * scaleY,
    };
}
function drawBoard() {
    context.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    context.fillStyle = "#d9b37a";
    context.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    context.strokeStyle = "#3a2a1a";
    context.lineWidth = 1;
    for (let i = 0; i < BOARD_SIZE; i += 1) {
        const pos = PADDING + i * CELL;
        context.beginPath();
        context.moveTo(PADDING, pos);
        context.lineTo(PADDING + CELL * (BOARD_SIZE - 1), pos);
        context.stroke();
        context.beginPath();
        context.moveTo(pos, PADDING);
        context.lineTo(pos, PADDING + CELL * (BOARD_SIZE - 1));
        context.stroke();
    }
    for (const r of starPoints) {
        for (const c of starPoints) {
            const x = PADDING + c * CELL;
            const y = PADDING + r * CELL;
            context.fillStyle = "#3a2a1a";
            context.beginPath();
            context.arc(x, y, 3, 0, Math.PI * 2);
            context.fill();
        }
    }
    for (let r = 0; r < BOARD_SIZE; r += 1) {
        for (let c = 0; c < BOARD_SIZE; c += 1) {
            const value = board[r][c];
            if (value === 0) {
                continue;
            }
            const isLast = (lastMove === null || lastMove === void 0 ? void 0 : lastMove.row) === r && lastMove.col === c;
            drawStone(r, c, value, isLast);
        }
    }
}
function drawStone(row, col, player, isLast) {
    const x = PADDING + col * CELL;
    const y = PADDING + row * CELL;
    const gradient = context.createRadialGradient(x - STONE_RADIUS / 3, y - STONE_RADIUS / 3, STONE_RADIUS / 4, x, y, STONE_RADIUS);
    if (player === 1) {
        gradient.addColorStop(0, "#5a5a5a");
        gradient.addColorStop(1, "#101010");
    }
    else {
        gradient.addColorStop(0, "#ffffff");
        gradient.addColorStop(1, "#d8d8d8");
    }
    context.fillStyle = gradient;
    context.beginPath();
    context.arc(x, y, STONE_RADIUS, 0, Math.PI * 2);
    context.fill();
    if (isLast) {
        context.strokeStyle = player === 1 ? "#f3d28b" : "#5a3a14";
        context.lineWidth = 2;
        context.beginPath();
        context.arc(x, y, STONE_RADIUS + 3, 0, Math.PI * 2);
        context.stroke();
    }
}
function resetGame() {
    for (let r = 0; r < BOARD_SIZE; r += 1) {
        for (let c = 0; c < BOARD_SIZE; c += 1) {
            board[r][c] = 0;
        }
    }
    currentPlayer = 1;
    gameOver = false;
    lastMove = null;
    moveCount = 0;
    updateStatus();
    drawBoard();
}
function updateStatus(message) {
    if (message) {
        statusElement.textContent = message;
        return;
    }
    statusElement.textContent = currentPlayer === 1 ? "黑棋回合" : "白棋回合";
}
function inBounds(row, col) {
    return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
}
function countInDirection(row, col, dr, dc, player) {
    let count = 0;
    let r = row + dr;
    let c = col + dc;
    while (inBounds(r, c) && board[r][c] === player) {
        count += 1;
        r += dr;
        c += dc;
    }
    return count;
}
function checkWin(row, col, player) {
    const directions = [
        [1, 0],
        [0, 1],
        [1, 1],
        [1, -1],
    ];
    for (const [dr, dc] of directions) {
        const total = 1 +
            countInDirection(row, col, dr, dc, player) +
            countInDirection(row, col, -dr, -dc, player);
        if (total >= 5) {
            return true;
        }
    }
    return false;
}
function handleMove(row, col) {
    if (gameOver || board[row][col] !== 0 || aiThinking) {
        return;
    }
    board[row][col] = currentPlayer;
    moveCount += 1;
    lastMove = { row, col, player: currentPlayer };
    if (checkWin(row, col, currentPlayer)) {
        gameOver = true;
        updateStatus(currentPlayer === 1 ? "黑棋勝利" : "白棋勝利");
        drawBoard();
        return;
    }
    if (moveCount >= BOARD_SIZE * BOARD_SIZE) {
        gameOver = true;
        updateStatus("平手");
        drawBoard();
        return;
    }
    currentPlayer = currentPlayer === 1 ? 2 : 1;
    updateStatus();
    drawBoard();
    // 如果是 PvE 模式且輪到 AI，觸發 AI 下棋
    if (gameMode === "pve" && currentPlayer === 2 && !gameOver) {
        makeAIMove();
    }
}
canvasEl.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) {
        return;
    }
    if (gameOver || aiThinking) {
        return;
    }
    // 在 PvE 模式下，玩家只能在自己回合下棋
    if (gameMode === "pve" && currentPlayer !== 1) {
        return;
    }
    const point = getCanvasPoint(event);
    if (!point) {
        return;
    }
    const x = point.x;
    const y = point.y;
    const col = Math.round((x - PADDING) / CELL);
    const row = Math.round((y - PADDING) / CELL);
    if (!inBounds(row, col)) {
        return;
    }
    const snappedX = PADDING + col * CELL;
    const snappedY = PADDING + row * CELL;
    const maxOffset = CELL * 0.45;
    if (Math.abs(x - snappedX) > maxOffset || Math.abs(y - snappedY) > maxOffset) {
        return;
    }
    handleMove(row, col);
});
resetButton.addEventListener("click", () => {
    showStartScreen();
});
// ==================== AI 演算法 ====================
const DEPTH_MAP = {
    easy: 1,
    medium: 2,
    hard: 3,
};
// 棋型分數
const SCORES = {
    FIVE: 100000, // 連五
    OPEN_FOUR: 10000, // 活四
    BLOCKED_FOUR: 1000, // 死四
    OPEN_THREE: 1000, // 活三
    BLOCKED_THREE: 100, // 死三
    OPEN_TWO: 100, // 活二
    BLOCKED_TWO: 10, // 死二
    CENTER_BONUS: 3, // 中心位置加分
};
// 方向向量
const DIRECTIONS = [
    [1, 0], // 垂直
    [0, 1], // 水平
    [1, 1], // 對角線
    [1, -1], // 反對角線
];
function evaluateLine(row, col, dr, dc, player) {
    const opponent = player === 1 ? 2 : 1;
    let count = 1;
    let openEnds = 0;
    // 正向計算
    let r = row + dr;
    let c = col + dc;
    while (inBounds(r, c) && board[r][c] === player) {
        count++;
        r += dr;
        c += dc;
    }
    if (inBounds(r, c) && board[r][c] === 0) {
        openEnds++;
    }
    // 反向計算
    r = row - dr;
    c = col - dc;
    while (inBounds(r, c) && board[r][c] === player) {
        count++;
        r -= dr;
        c -= dc;
    }
    if (inBounds(r, c) && board[r][c] === 0) {
        openEnds++;
    }
    // 根據連子數和開放端評分
    if (count >= 5)
        return SCORES.FIVE;
    if (count === 4) {
        if (openEnds === 2)
            return SCORES.OPEN_FOUR;
        if (openEnds === 1)
            return SCORES.BLOCKED_FOUR;
    }
    if (count === 3) {
        if (openEnds === 2)
            return SCORES.OPEN_THREE;
        if (openEnds === 1)
            return SCORES.BLOCKED_THREE;
    }
    if (count === 2) {
        if (openEnds === 2)
            return SCORES.OPEN_TWO;
        if (openEnds === 1)
            return SCORES.BLOCKED_TWO;
    }
    return 0;
}
function evaluatePosition(row, col, player) {
    let score = 0;
    for (const [dr, dc] of DIRECTIONS) {
        score += evaluateLine(row, col, dr, dc, player);
    }
    // 中心位置加分
    const centerDist = Math.abs(row - 7) + Math.abs(col - 7);
    score += Math.max(0, (14 - centerDist)) * SCORES.CENTER_BONUS;
    return score;
}
function evaluateBoard(player) {
    let score = 0;
    const opponent = player === 1 ? 2 : 1;
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            if (board[r][c] === player) {
                score += evaluatePosition(r, c, player);
            }
            else if (board[r][c] === opponent) {
                score -= evaluatePosition(r, c, opponent);
            }
        }
    }
    return score;
}
function getValidMoves() {
    const moves = [];
    const checked = new Set();
    // 只考慮已有棋子周圍的位置
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            if (board[r][c] !== 0) {
                // 檢查周圍 2 格範圍
                for (let dr = -2; dr <= 2; dr++) {
                    for (let dc = -2; dc <= 2; dc++) {
                        const nr = r + dr;
                        const nc = c + dc;
                        const key = `${nr},${nc}`;
                        if (inBounds(nr, nc) &&
                            board[nr][nc] === 0 &&
                            !checked.has(key)) {
                            checked.add(key);
                            moves.push([nr, nc]);
                        }
                    }
                }
            }
        }
    }
    // 如果棋盤為空，從中心開始
    if (moves.length === 0) {
        moves.push([7, 7]);
    }
    return moves;
}
function minimax(depth, alpha, beta, isMaximizing, aiPlayer) {
    const opponent = aiPlayer === 1 ? 2 : 1;
    // 終止條件
    if (depth === 0) {
        return evaluateBoard(aiPlayer);
    }
    const moves = getValidMoves();
    if (moves.length === 0) {
        return evaluateBoard(aiPlayer);
    }
    if (isMaximizing) {
        let maxEval = -Infinity;
        for (const [r, c] of moves) {
            board[r][c] = aiPlayer;
            // 檢查是否獲勝
            if (checkWin(r, c, aiPlayer)) {
                board[r][c] = 0;
                return SCORES.FIVE * 10;
            }
            const evalScore = minimax(depth - 1, alpha, beta, false, aiPlayer);
            board[r][c] = 0;
            maxEval = Math.max(maxEval, evalScore);
            alpha = Math.max(alpha, evalScore);
            if (beta <= alpha)
                break;
        }
        return maxEval;
    }
    else {
        let minEval = Infinity;
        for (const [r, c] of moves) {
            board[r][c] = opponent;
            // 檢查對手是否獲勝
            if (checkWin(r, c, opponent)) {
                board[r][c] = 0;
                return -SCORES.FIVE * 10;
            }
            const evalScore = minimax(depth - 1, alpha, beta, true, aiPlayer);
            board[r][c] = 0;
            minEval = Math.min(minEval, evalScore);
            beta = Math.min(beta, evalScore);
            if (beta <= alpha)
                break;
        }
        return minEval;
    }
}
function getAIMove() {
    const aiPlayer = 2; // AI 永遠是白棋
    const depth = DEPTH_MAP[difficulty];
    const moves = getValidMoves();
    if (moves.length === 0)
        return null;
    let bestMove = null;
    let bestScore = -Infinity;
    // 首先檢查是否有立即獲勝的位置
    for (const [r, c] of moves) {
        board[r][c] = aiPlayer;
        if (checkWin(r, c, aiPlayer)) {
            board[r][c] = 0;
            return [r, c];
        }
        board[r][c] = 0;
    }
    // 檢查是否需要阻擋對手獲勝
    const opponent = 1;
    for (const [r, c] of moves) {
        board[r][c] = opponent;
        if (checkWin(r, c, opponent)) {
            board[r][c] = 0;
            return [r, c];
        }
        board[r][c] = 0;
    }
    // 使用 Minimax 搜尋最佳位置
    for (const [r, c] of moves) {
        board[r][c] = aiPlayer;
        const score = minimax(depth - 1, -Infinity, Infinity, false, aiPlayer);
        board[r][c] = 0;
        if (score > bestScore) {
            bestScore = score;
            bestMove = [r, c];
        }
    }
    return bestMove;
}
function makeAIMove() {
    if (gameOver || gameMode !== "pve" || currentPlayer !== 2 || aiThinking) {
        return;
    }
    aiThinking = true;
    updateStatus("電腦思考中...");
    // 使用 setTimeout 讓 UI 有機會更新
    setTimeout(() => {
        const move = getAIMove();
        aiThinking = false;
        if (move) {
            handleMove(move[0], move[1]);
        }
    }, 100);
}
// ==================== 開始畫面邏輯 ====================
function showStartScreen() {
    // 重置棋盤狀態
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            board[r][c] = 0;
        }
    }
    currentPlayer = 1;
    gameOver = false;
    lastMove = null;
    moveCount = 0;
    aiThinking = false;
    // 顯示開始畫面
    startScreenEl.classList.remove("hidden");
    modeSelectionEl.classList.remove("hidden");
    difficultySelectionEl.classList.add("hidden");
    updateStatus("黑棋回合");
    drawBoard();
}
function hideStartScreen() {
    startScreenEl.classList.add("hidden");
}
function startGame(mode, diff) {
    gameMode = mode;
    if (diff) {
        difficulty = diff;
    }
    hideStartScreen();
    updateStatus("黑棋回合");
    drawBoard();
}
// 模式選擇事件
btnPvpEl.addEventListener("click", () => {
    startGame("pvp");
});
btnPveEl.addEventListener("click", () => {
    modeSelectionEl.classList.add("hidden");
    difficultySelectionEl.classList.remove("hidden");
});
btnBackEl.addEventListener("click", () => {
    difficultySelectionEl.classList.add("hidden");
    modeSelectionEl.classList.remove("hidden");
});
// 難度選擇事件
difficultyBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
        const target = e.target;
        const diff = target.dataset.difficulty;
        startGame("pve", diff);
    });
});
updateStatus();
drawBoard();
