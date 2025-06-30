const canvas = document.getElementById('goBoard');
const ctx = canvas.getContext('2d');
const currentPlayerSpan = document.getElementById('currentPlayer');
const resetButton = document.getElementById('resetButton');

const BOARD_SIZE = 19;
const CELL_SIZE = canvas.width / (BOARD_SIZE + 1);
const STONE_RADIUS = CELL_SIZE / 2 - 2;

let board = [];
let currentPlayer = 0; // 0: Player, 1: Computer 1, 2: Computer 2, 3: Computer 3
const players = ['黒', '白', '赤', '青']; // プレイヤーの色
const stoneColors = ['black', 'white', 'red', 'blue'];

let koPoint = null; // Stores {r, c} of the stone that was just captured for Ko rule

function initBoard() {
    board = Array(BOARD_SIZE).fill(0).map(() => Array(BOARD_SIZE).fill(-1)); // -1: empty, 0: black, 1: white, 2: red, 3: blue
    currentPlayer = 0;
    koPoint = null; // Clear ko point on new game
    drawBoard();
    updateGameInfo();
}

function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid lines
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    for (let i = 0; i < BOARD_SIZE; i++) {
        ctx.beginPath();
        ctx.moveTo(CELL_SIZE + i * CELL_SIZE, CELL_SIZE);
        ctx.lineTo(CELL_SIZE + i * CELL_SIZE, canvas.height - CELL_SIZE);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(CELL_SIZE, CELL_SIZE + i * CELL_SIZE);
        ctx.lineTo(canvas.width - CELL_SIZE, CELL_SIZE + i * CELL_SIZE);
        ctx.stroke();
    }

    // Draw hoshi (star points)
    const hoshi = [3, 9, 15];
    ctx.fillStyle = 'black';
    hoshi.forEach(row => {
        hoshi.forEach(col => {
            ctx.beginPath();
            ctx.arc(CELL_SIZE + col * CELL_SIZE, CELL_SIZE + row * CELL_SIZE, 4, 0, Math.PI * 2);
            ctx.fill();
        });
    });

    // Draw stones
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            if (board[r][c] !== -1) {
                drawStone(r, c, stoneColors[board[r][c]]);
            }
        }
    }
}

function drawStone(row, col, color) {
    ctx.beginPath();
    ctx.arc(CELL_SIZE + col * CELL_SIZE, CELL_SIZE + row * CELL_SIZE, STONE_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    ctx.stroke();
}

function updateGameInfo() {
    currentPlayerSpan.textContent = players[currentPlayer];
}

function isValidMove(row, col) {
    return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE && board[row][col] === -1;
}

function getGroup(r, c, color, visited) {
    const group = [];
    const queue = [[r, c]];
    visited[r][c] = true;

    while (queue.length > 0) {
        const [currR, currC] = queue.shift();
        group.push({ r: currR, c: currC });

        const neighbors = [
            [currR - 1, currC], [currR + 1, currC],
            [currR, currC - 1], [currR, currC + 1]
        ];

        for (const [nr, nc] of neighbors) {
            if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && !visited[nr][nc]) {
                if (board[nr][nc] === color) {
                    visited[nr][nc] = true;
                    queue.push([nr, nc]);
                }
            }
        }
    }
    return group;
}

function countLiberties(group) {
    const liberties = new Set();
    for (const { r, c } of group) {
        const neighbors = [
            [r - 1, c], [r + 1, c],
            [r, c - 1], [r, c + 1]
        ];
        for (const [nr, nc] of neighbors) {
            if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && board[nr][nc] === -1) {
                liberties.add(`${nr},${nc}`);
            }
        }
    }
    return liberties.size;
}

function removeStones(group) {
    for (const { r, c } of group) {
        board[r][c] = -1;
    }
}

function placeStone(row, col) {
    if (!isValidMove(row, col)) {
        return; // Invalid move (already occupied)
    }

    // Ko check: If this move is exactly the ko point, it's illegal
    if (koPoint && koPoint.r === row && koPoint.c === col) {
        alert("コウのルールにより、この手は打てません。");
        return;
    }

    // Temporarily place the stone to check for captures and suicide
    const originalBoard = JSON.parse(JSON.stringify(board)); // Deep copy
    board[row][col] = currentPlayer;

    let capturedStones = []; // To store captured stones for ko point
    const opponentColors = stoneColors.filter((_, index) => index !== currentPlayer);
    const directions = [
        [-1, 0], [1, 0], [0, -1], [0, 1]
    ];

    // Check for captures of opponent stones
    for (const [dr, dc] of directions) {
        const nr = row + dr;
        const nc = col + dc;

        if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
            const neighborColor = board[nr][nc];
            if (neighborColor !== -1 && neighborColor !== currentPlayer) {
                const visited = Array(BOARD_SIZE).fill(0).map(() => Array(BOARD_SIZE).fill(false));
                const opponentGroup = getGroup(nr, nc, neighborColor, visited);
                if (countLiberties(opponentGroup) === 0) {
                    capturedStones = capturedStones.concat(opponentGroup);
                    removeStones(opponentGroup);
                }
            }
        }
    }

    // Check for suicide of the current player's stone
    const visitedSelf = Array(BOARD_SIZE).fill(0).map(() => Array(BOARD_SIZE).fill(false));
    const playerGroup = getGroup(row, col, currentPlayer, visitedSelf);
    if (countLiberties(playerGroup) === 0 && capturedStones.length === 0) {
        // This is a suicide and no stones were captured. Illegal move.
        board = originalBoard; // Revert board
        alert("自殺手は打てません。");
        drawBoard();
        return;
    }

    // Update koPoint based on captures
    if (capturedStones.length === 1) {
        koPoint = capturedStones[0]; // Store the coordinate of the single captured stone
    } else {
        koPoint = null; // Clear koPoint if no capture or multiple captures
    }

    drawBoard();
    nextTurn();
}

function nextTurn() {
    currentPlayer = (currentPlayer + 1) % players.length;
    updateGameInfo();
    if (currentPlayer !== 0) {
        setTimeout(computerMove, 1000); // Computer moves after 1 second
    }
}

function computerMove() {
    let moved = false;
    while (!moved) {
        const row = Math.floor(Math.random() * BOARD_SIZE);
        const col = Math.floor(Math.random() * BOARD_SIZE);
        // Try to place stone, if it's a valid move and not a ko violation or suicide
        // The placeStone function itself handles the validity and ko/suicide checks
        const originalBoardForComputer = JSON.parse(JSON.stringify(board)); // Save board state before computer move attempt
        placeStone(row, col);
        // Check if the board actually changed (i.e., placeStone was successful)
        if (JSON.stringify(originalBoardForComputer) !== JSON.stringify(board)) {
            moved = true;
        }
    }
}

canvas.addEventListener('click', (event) => {
    if (currentPlayer === 0) { // Only player can click
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const col = Math.round((x - CELL_SIZE) / CELL_SIZE);
        const row = Math.round((y - CELL_SIZE) / CELL_SIZE);

        placeStone(row, col);
    }
});

resetButton.addEventListener('click', initBoard);

initBoard();
