/**
 * AIモデル: Gemini
 * Gemini CLIバージョン: 1.0
 * 作成日時: 2025年11月28日金曜日
 * ユーザープロンプト: 他にモジュール化できるパターンはないか探してください。モジュールのみ作り、リファクタリングはしないでください。
 * AIのアプローチ: 汎用的なアニメーションのパターンを抽出し、ユーティリティモジュールとして提供する。
 * 実装の意図: 複数のアプリケーションで共通して利用されるアニメーションロジックを抽象化し、コードの重複を減らし、管理を容易にする。
 */

let animationFrameId = null;
let lastTimestamp = 0;
const animationCallbacks = new Set();

/**
 * アニメーションループを開始する
 */
export const startAnimationLoop = () => {
    if (animationFrameId !== null) {
        return; // 既に実行中の場合は何もしない
    }

    const animate = (timestamp) => {
        const deltaTime = timestamp - lastTimestamp;
        lastTimestamp = timestamp;

        animationCallbacks.forEach(callback => callback(deltaTime));

        animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
};

/**
 * アニメーションループを停止する
 */
export const stopAnimationLoop = () => {
    if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
        lastTimestamp = 0;
    }
};

/**
 * アニメーションループにコールバック関数を登録する
 * @param {Function} callback - フレームごとに実行される関数 (deltaTimeを引数にとる)
 */
export const registerAnimationCallback = (callback) => {
    animationCallbacks.add(callback);
};

/**
 * アニメーションループからコールバック関数を解除する
 * @param {Function} callback - 解除するコールバック関数
 */
export const unregisterAnimationCallback = (callback) => {
    animationCallbacks.delete(callback);
};
