# 汎用JavaScriptモジュールライブラリ

このディレクトリには、プロジェクト全体で再利用可能な汎用JavaScriptモジュールが格納されています。
これらのモジュールは、特定のアプリケーションに依存せず、様々な場面で利用できるように設計されています。

## 使用方法

各モジュールはES6モジュールとしてエクスポートされています。
HTMLファイルから以下のようにして、必要な機能をインポートして使用してください。

```html
<script type="module">
  import { GameStateManager } from './lib/gameUtils.js';

  const gameState = new GameStateManager();
  // ...
</script>
```

---

## モジュール一覧

### 1. `cartService.js`

Eコマース機能のためのカート管理モジュールです。`localStorage`を使用して、クライアント側でショッピングカートの状態を永続化します。

**主な機能:**
- `cartService.addToCart(product)`: カートに商品を追加します。
- `cartService.getCartItems()`: カート内のすべての商品を取得します。
- `cartService.getTotal()`: カート内の商品の合計金額を計算します。
- `cartService.clearCart()`: カートを空にします。

**使用例:**
```javascript
import { cartService } from './lib/cartService.js';

const product = { id: 'p01', name: 'Tシャツ', price: 1000 };
cartService.addToCart(product);
console.log('合計金額:', cartService.getTotal());
```

### 2. `domUtils.js`

DOM操作を簡略化し、コードの可読性を高めるためのユーティリティ関数群です。

**主な機能:**
- `$(selector, parent)`: `querySelector`のショートハンドです。
- `$$(selector, parent)`: `querySelectorAll`のショートハンドです。結果は配列で返されます。
- `createElement(tagName, options)`: 新しいDOM要素を便利に作成します。
- `toggleVisibility(element, isVisible)`: 要素の表示・非表示を切り替えます。

**使用例:**
```javascript
import { $, createElement } from './lib/domUtils.js';

const header = $('h1');
const newDiv = createElement('div', { 
  id: 'main', 
  className: 'container',
  textContent: 'こんにちは' 
});
document.body.appendChild(newDiv);
```

### 3. `animationUtils.js`

`requestAnimationFrame` を利用したアニメーションループの管理を簡素化するモジュールです。

**主な機能:**
- `startAnimationLoop()`: アニメーションループを開始します。
- `stopAnimationLoop()`: アニメーションループを停止します。
- `registerAnimationCallback(callback)`: フレームごとに実行されるコールバック関数を登録します。コールバックは `deltaTime` を引数に取ります。
- `unregisterAnimationCallback(callback)`: 登録したコールバックを解除します。

**使用例:**
```javascript
import { startAnimationLoop, registerAnimationCallback } from './lib/animationUtils.js';

const moveBox = (deltaTime) => {
  // ボックスを動かす処理 (deltaTimeに応じて)
};

registerAnimationCallback(moveBox);
startAnimationLoop();
```

### 4. `gameUtils.js`

ゲーム開発で共通して利用されるロジック（状態管理、スコア管理、衝突判定）を提供します。

**主な機能:**
- `GameStateManager`: `'playing'`, `'game_over'`などのゲーム状態を管理するクラス。
- `ScoreManager`: スコアの加算、リセット、変更の監視を行うクラス。
- `rectCollision(rect1, rect2)`: 矩形同士の衝突を判定します。
- `circleCollision(circle1, circle2)`: 円同士の衝突を判定します。

**使用例:**
```javascript
import { GameStateManager, ScoreManager, rectCollision } from './lib/gameUtils.js';

const gameState = new GameStateManager();
const score = new ScoreManager();

gameState.onStateChange(newState => console.log('状態変更:', newState));
score.onScoreChange(newScore => console.log('スコア:', newScore));

gameState.setState('playing');
score.addScore(10);
```

### 5. `quizEngine.js`

クイズアプリケーションのバックエンドロジックを管理するエンジンです。

**主な機能:**
- `QuizEngine`クラス: 問題リストをロードし、クイズの進行、正誤判定、スコアリングを行います。
- `on(event, callback)`: `'questionchange'`, `'finish'`, `'scorechange'`などのイベントを購読できます。

**使用例:**
```javascript
import { QuizEngine } from './lib/quizEngine.js';

const myQuestions = [
  { question: '1+1は?', choices: ['1', '2', '3'], answer: '2' },
  { question: '日本の首都は?', choices: ['京都', '大阪', '東京'], answer: '東京' }
];

const quiz = new QuizEngine(myQuestions);

quiz.on('questionchange', q => console.log('次の問題:', q.question));
quiz.on('finish', result => console.log(`終了! スコア: ${result.score}/${result.total}`));

quiz.start();
quiz.submitAnswer('2');
quiz.submitAnswer('東京');
```
