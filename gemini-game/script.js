const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game variables
let player1, player2;
let obstacles = [];
let score = 0;
let gameOver = false;
let obstacleTimer = 0;
const obstacleInterval = 120; // Add obstacles every 120 frames
const playerSpeed = 15;

// Player class
class Player {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 20;
        this.color = color;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    move(direction) {
        if (direction === 'left') {
            this.x -= playerSpeed;
        } else if (direction === 'right') {
            this.x += playerSpeed;
        }
        // Boundary checks
        if (this.x < 0) {
            this.x = 0;
        }
        if (this.x + this.width > canvas.width / 2) {
            this.x = canvas.width / 2 - this.width;
        }
    }
    
    // Symmetrical move for the second player
    moveSymmetric(direction) {
        if (direction === 'left') {
            this.x += playerSpeed;
        } else if (direction === 'right') {
            this.x -= playerSpeed;
        }
        // Boundary checks
        if (this.x < canvas.width / 2) {
            this.x = canvas.width / 2;
        }
        if (this.x + this.width > canvas.width) {
            this.x = canvas.width - this.width;
        }
    }
}

// Obstacle class
class Obstacle {
    constructor(x, y, width, height, speed) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = speed;
    }

    draw() {
        ctx.fillStyle = 'red';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    update() {
        this.y += this.speed;
    }
}

function init() {
    const playerY = canvas.height - 40;
    player1 = new Player(canvas.width / 4 - 10, playerY, 'blue');
    player2 = new Player(canvas.width * 3 / 4 - 10, playerY, 'green');
    obstacles = [];
    score = 0;
    obstacleTimer = 0;
    gameOver = false;
    gameLoop();
}

function spawnObstacles() {
    obstacleTimer++;
    if (obstacleTimer % obstacleInterval === 0) {
        const gapWidth = 80;
        const minWidth = 20;
        const maxWidth = canvas.width / 2 - gapWidth - minWidth;
        
        const leftObstacleWidth = Math.random() * (maxWidth - minWidth) + minWidth;
        const rightObstacleWidth = canvas.width / 2 - leftObstacleWidth - gapWidth;

        const speed = 2 + Math.random() * 2; // Random speed

        obstacles.push(new Obstacle(0, -20, leftObstacleWidth, 20, speed));
        obstacles.push(new Obstacle(leftObstacleWidth + gapWidth, -20, rightObstacleWidth, 20, speed));
        
        // Symmetrical obstacles for the other side
        obstacles.push(new Obstacle(canvas.width / 2, -20, rightObstacleWidth, 20, speed));
        obstacles.push(new Obstacle(canvas.width - leftObstacleWidth, -20, leftObstacleWidth, 20, speed));
    }
}

function checkCollision(player, obstacle) {
    return (
        player.x < obstacle.x + obstacle.width &&
        player.x + player.width > obstacle.x &&
        player.y < obstacle.y + obstacle.height &&
        player.y + player.height > obstacle.y
    );
}

function gameLoop() {
    if (gameOver) {
        ctx.fillStyle = 'black';
        ctx.font = '40px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 20);
        ctx.font = '20px Arial';
        ctx.fillText(`Final Score: ${Math.floor(score)}`, canvas.width / 2, canvas.height / 2 + 20);
        ctx.fillText('Click to Restart', canvas.width / 2, canvas.height / 2 + 50);
        return;
    }

    update();
    draw();

    requestAnimationFrame(gameLoop);
}

function update() {
    spawnObstacles();

    obstacles.forEach(obstacle => {
        obstacle.update();
        if (checkCollision(player1, obstacle) || checkCollision(player2, obstacle)) {
            gameOver = true;
        }
    });

    // Remove obstacles that are off-screen
    obstacles = obstacles.filter(obstacle => obstacle.y < canvas.height);
    
    // Increase score
    score += 0.1;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw center line
    ctx.strokeStyle = '#ccc';
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();

    player1.draw();
    player2.draw();

    obstacles.forEach(obstacle => {
        obstacle.draw();
    });

    // Draw score
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${Math.floor(score)}`, 10, 20);
}

// Event Listeners
document.addEventListener('keydown', (e) => {
    if (gameOver) return;
    if (e.key === 'ArrowLeft') {
        player1.move('left');
        player2.moveSymmetric('left');
    } else if (e.key === 'ArrowRight') {
        player1.move('right');
        player2.moveSymmetric('right');
    }
});

canvas.addEventListener('click', () => {
    if (gameOver) {
        init();
    }
});

const leftButton = document.getElementById('leftButton');
const rightButton = document.getElementById('rightButton');

leftButton.addEventListener('touchstart', () => {
    if (gameOver) return;
    player1.move('left');
    player2.moveSymmetric('left');
});

rightButton.addEventListener('touchstart', () => {
    if (gameOver) return;
    player1.move('right');
    player2.moveSymmetric('right');
});

// For desktop click support on buttons
leftButton.addEventListener('click', () => {
    if (gameOver) return;
    player1.move('left');
    player2.moveSymmetric('left');
});

rightButton.addEventListener('click', () => {
    if (gameOver) return;
    player1.move('right');
    player2.moveSymmetric('right');
});

init();