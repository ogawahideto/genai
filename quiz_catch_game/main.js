// --- 1. モジュールのインポート ---
import { cartService } from './lib/cartService.js';
import { $, createElement, toggleVisibility } from './lib/domUtils.js';
import { startAnimationLoop, stopAnimationLoop, registerAnimationCallback, unregisterAnimationCallback } from './lib/animationUtils.js';
import { GameStateManager, ScoreManager, rectCollision } from './lib/gameUtils.js';
import { QuizEngine } from './lib/quizEngine.js';

// --- 2. 初期設定・定数 ---
const APP_STATES = {
    QUIZ: 'quiz',
    PLAYING: 'playing',
    GAME_OVER: 'game_over',
    SHOP: 'shop',
};

const appState = new GameStateManager(APP_STATES.QUIZ);
const scoreManager = new ScoreManager(0);

const gameScreen = $('#game-screen');
const player = $('#player');
const playerSpeed = 8;
let playerX = gameScreen.offsetWidth / 2 - player.offsetWidth / 2;
let keys = {};

const items = new Set();
let itemSpawnTimer = 0;

// --- 3. DOM要素の取得 ---
const screens = {
    quiz: $('#quiz-screen'),
    playing: $('#game-screen'),
    game_over: $('#game-over-screen'),
    shop: $('#shop-screen'),
};
const scoreDisplay = $('#score-display');
const inventoryDisplay = $('#inventory-display');
const shopButton = $('#shop-button');
const closeShopButton = $('#close-shop-button');
const restartButton = $('#restart-button');


// --- 4. クイズ機能 ---
const quizQuestions = [
    { question: 'このアプリで使われているDOM操作ライブラリは？', choices: ['jQuery', 'domUtils.js', 'MooTools'], answer: 'domUtils.js' },
    { question: 'ゲームの状態管理に使われているクラスは？', choices: ['StateManager', 'GameStateManager', 'StatusKeeper'], answer: 'GameStateManager' },
    { question: 'アイテム購入情報の保存に使われているサービスは？', choices: ['cartService.js', 'shopping.js', 'itemService.js'], answer: 'cartService.js' },
];
const quizEngine = new QuizEngine(quizQuestions);

quizEngine.on('questionchange', (q) => {
    if (!q) return;
    $('#quiz-question').textContent = q.question;
    const choicesContainer = $('#quiz-choices');
    choicesContainer.innerHTML = '';
    q.choices.forEach(choice => {
        const btn = createElement('button', { 
            textContent: choice,
            eventListeners: { click: () => quizEngine.submitAnswer(choice) }
        });
        choicesContainer.appendChild(btn);
    });
});

quizEngine.on('finish', (result) => {
    if (result.score === result.total) {
        alert('全問正解！ゲームを開始します。');
        appState.setState(APP_STATES.PLAYING);
    } else {
        alert(`残念！${result.score}問正解でした。もう一度挑戦してね。`);
        quizEngine.reset();
    }
});


// --- 5. ゲームロジック ---
function createItem() {
    const item = createElement('div', { className: 'item' });
    item.x = Math.random() * (gameScreen.offsetWidth - 30);
    item.y = -30;
    item.style.left = `${item.x}px`;
    item.style.top = `${item.y}px`;
    gameScreen.appendChild(item);
    items.add(item);
}

function updatePlayer(deltaTime) {
    if (keys['ArrowLeft'] && playerX > 0) {
        playerX -= playerSpeed;
    }
    if (keys['ArrowRight'] && playerX < gameScreen.offsetWidth - player.offsetWidth) {
        playerX += playerSpeed;
    }
    player.style.left = `${playerX}px`;
}

function updateItems(deltaTime) {
    itemSpawnTimer += deltaTime;
    if (itemSpawnTimer > 1000) { // 1秒ごとにアイテム生成
        createItem();
        itemSpawnTimer = 0;
    }

    const playerRect = { x: playerX, y: player.offsetTop, width: player.offsetWidth, height: player.offsetHeight };

    items.forEach(item => {
        item.y += 3; // アイテムの落下速度
        item.style.top = `${item.y}px`;

        if (item.y > gameScreen.offsetHeight) {
            item.remove();
            items.delete(item);
        }

        const itemRect = { x: item.x, y: item.y, width: item.offsetWidth, height: item.offsetHeight };
        if (rectCollision(playerRect, itemRect)) {
            item.remove();
            items.delete(item);
            scoreManager.addScore(10);
        }
    });
}

const gameLoop = (deltaTime) => {
    updatePlayer(deltaTime);
    updateItems(deltaTime);
};


// --- 6. ショップ機能 ---
const shopItemsData = [
    { id: 'skin_blue', name: '青いスキン', price: 50 },
    { id: 'skin_green', name: '緑のスキン', price: 50 },
];

function renderShop() {
    const container = $('#shop-items');
    container.innerHTML = '';
    const inventory = cartService.getCartItems();
    
    shopItemsData.forEach(itemData => {
        const isPurchased = inventory.some(invItem => invItem.id === itemData.id);
        const itemEl = createElement('div', {
            className: `shop-item ${isPurchased ? 'purchased' : ''}`,
            textContent: `${itemData.name} (${itemData.price}pt)`,
            eventListeners: {
                click: () => {
                    if (isPurchased) return;
                    if (scoreManager.getScore() >= itemData.price) {
                        scoreManager.addScore(-itemData.price);
                        cartService.addToCart(itemData);
                        alert(`${itemData.name}を購入しました！`);
                        updateInventory();
                        renderShop();
                        applySkin();
                    } else {
                        alert('ポイントが足りません！');
                    }
                }
            }
        });
        container.appendChild(itemEl);
    });
    $('#shop-points').textContent = scoreManager.getScore();
}

function applySkin() {
    const inventory = cartService.getCartItems();
    const blueSkin = inventory.find(i => i.id === 'skin_blue');
    const greenSkin = inventory.find(i => i.id === 'skin_green');
    if (greenSkin) {
        player.style.backgroundColor = 'green';
    } else if (blueSkin) {
        player.style.backgroundColor = 'blue';
    }
}


// --- 7. UI更新 & 状態管理 ---
function updateUI() {
    // 全てのスクリーンを非表示
    Object.values(screens).forEach(screen => screen.style.display = 'none');
    
    const currentState = appState.getState();
    const currentScreen = screens[currentState];
    if(currentScreen) {
        currentScreen.style.display = 'flex';
    }

    if (currentState === APP_STATES.PLAYING) {
        registerAnimationCallback(gameLoop);
        startAnimationLoop();
    } else {
        stopAnimationLoop();
        unregisterAnimationCallback(gameLoop);
    }
    
    if (currentState === APP_STATES.GAME_OVER) {
        $('#final-score').textContent = scoreManager.getScore();
    }
    
    if (currentState === APP_STATES.SHOP) {
        renderShop();
    }
}

function updateInventory() {
    inventoryDisplay.textContent = `Inventory: ${cartService.getCartItems().length} items`;
}

// --- 8. イベントリスナー ---
window.addEventListener('keydown', (e) => keys[e.key] = true);
window.addEventListener('keyup', (e) => keys[e.key] = false);

appState.onStateChange(updateUI);
scoreManager.onScoreChange(newScore => scoreDisplay.textContent = `Score: ${newScore}`);

shopButton.addEventListener('click', () => appState.setState(APP_STATES.SHOP));
closeShopButton.addEventListener('click', () => appState.setState(APP_STATES.PLAYING));
restartButton.addEventListener('click', () => {
    scoreManager.resetScore();
    quizEngine.reset();
    appState.setState(APP_STATES.QUIZ);
});


// --- 9. 初期化処理 ---
function init() {
    updateUI();
    updateInventory();
    applySkin();
    quizEngine.start();
    // ゲーム時間制限 (例: 30秒)
    appState.onStateChange((state) => {
        if (state === APP_STATES.PLAYING) {
            setTimeout(() => {
                if (appState.is(APP_STATES.PLAYING)) {
                    appState.setState(APP_STATES.GAME_OVER);
                }
            }, 30000);
        }
    });
}

init();
