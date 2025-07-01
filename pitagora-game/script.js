document.addEventListener('DOMContentLoaded', () => {
    // Matter.js モジュールのエイリアス
    const { Engine, Render, Runner, World, Bodies, Mouse, MouseConstraint, Events } = Matter;

    // ゲームコンテナを取得
    const gameContainer = document.getElementById('game-container');
    const containerWidth = gameContainer.clientWidth;
    const containerHeight = gameContainer.clientHeight;

    // Matter.js エンジンの作成
    const engine = Engine.create();
    const world = engine.world;

    // レンダラーの作成
    const render = Render.create({
        element: gameContainer,
        engine: engine,
        options: {
            width: containerWidth,
            height: containerHeight,
            wireframes: false, // ワイヤーフレームを無効にして塗りつぶし表示
            background: '#f0f8ff'
        }
    });

    // 地面と壁の作成
    const ground = Bodies.rectangle(containerWidth / 2, containerHeight, containerWidth, 60, { isStatic: true });
    const wallLeft = Bodies.rectangle(0, containerHeight / 2, 60, containerHeight, { isStatic: true });
    const wallRight = Bodies.rectangle(containerWidth, containerHeight / 2, 60, containerHeight, { isStatic: true });
    const ceiling = Bodies.rectangle(containerWidth / 2, 0, containerWidth, 60, { isStatic: true });

    // スタートとゴールのエリア
    const startArea = Bodies.rectangle(100, 100, 80, 80, {
        isStatic: true,
        isSensor: true,
        label: 'start-area',
        render: { fillStyle: 'rgba(0, 255, 0, 0.2)', strokeStyle: 'green', lineWidth: 2 }
    });
    const goalArea = Bodies.rectangle(containerWidth - 100, containerHeight - 100, 80, 80, {
        isStatic: true,
        isSensor: true,
        label: 'goal-area',
        render: { fillStyle: 'rgba(255, 215, 0, 0.2)', strokeStyle: 'gold', lineWidth: 2 }
    });


    World.add(world, [ground, wallLeft, wallRight, ceiling, startArea, goalArea]);

    // レンダリングとエンジンの実行
    Render.run(render);
    const runner = Runner.create();
    // Runner.run(runner, engine); // 初期状態ではエンジンを動かさない

    // オブジェクトを保持する配列
    let objects = [];
    let selectedTool = null;

    // ツールボックスのボタン処理
    const toolButtons = document.querySelectorAll('.tool');
    toolButtons.forEach(button => {
        button.addEventListener('click', () => {
            selectedTool = button.getAttribute('data-tool');
            console.log(`Selected tool: ${selectedTool}`);
        });
    });

    // ゲームコンテナ内でのクリックイベント
    gameContainer.addEventListener('click', (event) => {
        if (!selectedTool) return;

        const rect = gameContainer.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        let newObject;
        if (selectedTool === 'ball') {
            newObject = Bodies.circle(x, y, 20, { restitution: 0.8 });
        } else if (selectedTool === 'box') {
            newObject = Bodies.rectangle(x, y, 40, 40);
        } else if (selectedTool === 'slope') {
            newObject = Bodies.rectangle(x, y, 150, 20, { angle: Math.PI / 6 });
        } else if (selectedTool === 'static-box') {
            newObject = Bodies.rectangle(x, y, 50, 50, { isStatic: true });
        } else if (selectedTool === 'domino') {
            newObject = Bodies.rectangle(x, y, 10, 50);
        } else if (selectedTool === 'pendulum') {
            const pendulumRoot = Bodies.circle(x, y - 100, 5, { isStatic: true });
            const pendulumBall = Bodies.circle(x, y, 30);
            const pendulumConstraint = Matter.Constraint.create({
                bodyA: pendulumRoot,
                bodyB: pendulumBall,
                length: 100,
                stiffness: 0.9
            });
            newObject = [pendulumRoot, pendulumBall, pendulumConstraint];
        }

        if (newObject) {
            if (Array.isArray(newObject)) {
                objects.push(...newObject);
                World.add(world, newObject);
            } else {
                objects.push(newObject);
                World.add(world, newObject);
            }
        }
    });

    // スタートボタンの処理
    const startBtn = document.getElementById('start-btn');
    let gameBall = null; // ゲームボールを追跡
    startBtn.addEventListener('click', () => {
        // 既存のボールがあれば削除
        if (gameBall) {
            World.remove(world, gameBall);
        }
        // 新しいボールを作成
        gameBall = Bodies.circle(100, 100, 20, { 
            restitution: 0.8,
            label: 'game-ball' // ボールにラベルを付ける
        });
        World.add(world, gameBall);
        Runner.run(runner, engine);
    });

    // ゴール判定
    let goalReached = false;
    Events.on(engine, 'collisionStart', (event) => {
        const pairs = event.pairs;
        pairs.forEach(pair => {
            const { bodyA, bodyB } = pair;
            if ((bodyA.label === 'game-ball' && bodyB.label === 'goal-area') ||
                (bodyB.label === 'game-ball' && bodyA.label === 'goal-area')) {
                if (!goalReached) {
                    goalReached = true;
                    console.log("GOAL!");
                    // ゴールテキスト表示などの処理をここに追加
                    const goalText = document.createElement('div');
                    goalText.id = 'goal-text';
                    goalText.textContent = 'GOAL!';
                    goalText.style.position = 'absolute';
                    goalText.style.top = '50%';
                    goalText.style.left = '50%';
                    goalText.style.transform = 'translate(-50%, -50%)';
                    goalText.style.fontSize = '80px';
                    goalText.style.color = 'gold';
                    goalText.style.textShadow = '2px 2px 4px #000';
                    gameContainer.appendChild(goalText);
                }
            }
        });
    });

    // リセットボタンの処理
    const resetBtn = document.getElementById('reset-btn');
    resetBtn.addEventListener('click', () => {
        // エンジンを停止
        Runner.stop(runner);

        // ワールドからすべての動的オブジェクトを削除
        objects.forEach(obj => {
            World.remove(world, obj);
        });
        objects = []; // 配列をクリア

        // ゲームボールを削除
        if (gameBall) {
            World.remove(world, gameBall);
            gameBall = null;
        }

        // ゴール表示をリセット
        goalReached = false;
        const goalText = document.getElementById('goal-text');
        if (goalText) {
            goalText.remove();
        }
    });
});
