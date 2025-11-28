/**
 * AIモデル: Gemini
 * Gemini CLIバージョン: 1.0
 * 作成日時: 2025年11月28日金曜日
 * ユーザープロンプト: 他には候補はないですか？
 * AIのアプローチ: プロジェクト内に多数存在するゲーム系ファイル群から、共通して利用できそうなゲームロジック（状態管理、スコア管理、衝突判定）を抽出し、汎用的なユーティリティモジュールとして提供する。
 * 実装の意図: ゲーム開発における共通の処理を抽象化し、コードの再利用性を高め、個別のゲームロジックの実装を簡素化する。
 */

/**
 * ゲームの状態を管理するクラス
 * 'not_started', 'playing', 'paused', 'game_over'
 */
export class GameStateManager {
    constructor(initialState = 'not_started') {
        this.state = initialState;
        this.listeners = [];
    }

    getState() {
        return this.state;
    }

    setState(newState) {
        if (this.state !== newState) {
            this.state = newState;
            this.listeners.forEach(listener => listener(this.state));
        }
    }

    onStateChange(listener) {
        this.listeners.push(listener);
    }

    is(state) {
        return this.state === state;
    }
}

/**
 * スコアを管理するクラス
 */
export class ScoreManager {
    constructor(initialScore = 0) {
        this.score = initialScore;
        this.listeners = [];
    }

    getScore() {
        return this.score;
    }

    addScore(points) {
        this.score += points;
        this.listeners.forEach(listener => listener(this.score));
    }
    
    setScore(score) {
        this.score = score;
        this.listeners.forEach(listener => listener(this.score));
    }

    resetScore() {
        this.setScore(0);
    }

    onScoreChange(listener) {
        this.listeners.push(listener);
    }
}

/**
 * 矩形同士の衝突判定
 * @param {object} rect1 - { x, y, width, height }
 * @param {object} rect2 - { x, y, width, height }
 * @returns {boolean}
 */
export const rectCollision = (rect1, rect2) => {
    return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
    );
};

/**
 * 円同士の衝突判定
 * @param {object} circle1 - { x, y, radius }
 * @param {object} circle2 - { x, y, radius }
 * @returns {boolean}
 */
export const circleCollision = (circle1, circle2) => {
    const dx = circle1.x - circle2.x;
    const dy = circle1.y - circle2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < circle1.radius + circle2.radius;
};
