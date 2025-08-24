const gameArea = document.getElementById('game-area');
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const gameOverEl = document.getElementById('game-over');
const finalScoreEl = document.getElementById('final-score');
const restartBtn = document.getElementById('restart-btn');
const geminiBtn = document.getElementById('gemini-btn');
const claudeBtn = document.getElementById('claude-btn');
const gptBtn = document.getElementById('gpt-btn');

let score = 0;
let lives = 3;
let gameInterval;

const llms = ['gemini', 'claude', 'gpt'];

function createIcon() {
    const llm = llms[Math.floor(Math.random() * llms.length)];
    const icon = document.createElement('div');
    icon.classList.add('icon', llm);
    icon.textContent = llm.charAt(0).toUpperCase();
    icon.style.left = Math.random() * (gameArea.offsetWidth - 50) + 'px';
    icon.dataset.llm = llm;

    gameArea.appendChild(icon);

    let top = 0;
    const fallInterval = setInterval(() => {
        if (top > gameArea.offsetHeight) {
            clearInterval(fallInterval);
            icon.remove();
            if (!gameOverEl.classList.contains('hidden')) return;
            lives--;
            updateStats();
            if (lives <= 0) {
                endGame();
            }
        } else {
            top += 2;
            icon.style.top = top + 'px';
        }
    }, 16);
}

function updateStats() {
    scoreEl.textContent = `Score: ${score}`;
    livesEl.textContent = `Lives: ${lives}`;
}

function handleKeyPress(llm) {
    const icon = document.querySelector(`.icon[data-llm="${llm}"]`);
    if (icon) {
        icon.remove();
        score++;
        updateStats();
    } else {
        lives--;
        updateStats();
        if (lives <= 0) {
            endGame();
        }
    }
}

document.addEventListener('keydown', (e) => {
    if (gameOverEl.classList.contains('hidden')) {
        if (e.key.toLowerCase() === 'g') {
            handleKeyPress('gemini');
        } else if (e.key.toLowerCase() === 'c') {
            handleKeyPress('claude');
        } else if (e.key.toLowerCase() === 'p') {
            handleKeyPress('gpt');
        }
    }
});

geminiBtn.addEventListener('click', () => handleKeyPress('gemini'));
claudeBtn.addEventListener('click', () => handleKeyPress('claude'));
gptBtn.addEventListener('click', () => handleKeyPress('gpt'));

function startGame() {
    score = 0;
    lives = 3;
    updateStats();
    gameOverEl.classList.add('hidden');
    gameArea.innerHTML = '';
    gameInterval = setInterval(createIcon, 1500);
}

function endGame() {
    clearInterval(gameInterval);
    finalScoreEl.textContent = score;
    gameOverEl.classList.remove('hidden');
}

restartBtn.addEventListener('click', startGame);

startGame();
