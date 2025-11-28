/**
 * AIモデル: Gemini
 * Gemini CLIバージョン: 1.0
 * 作成日時: 2025年11月28日金曜日
 * ユーザープロンプト: ほかにはありますか？
 * AIのアプローチ: プロジェクト内に複数存在するクイズ形式のアプリケーション群から、共通のロジック（問題管理、進行、正誤判定、スコア管理）を抽出し、汎用的なクイズエンジンモジュールとして提供する。
 * 実装の意図: クイズゲームの開発を簡素化し、ロジックの再利用を促進する。UIからクイズのコアロジックを分離することで、保守性と拡張性を高める。
 */

export class QuizEngine {
    /**
     * @param {Array<object>} questions - 質問の配列。例: [{ question: '1+1は?', choices: ['1', '2', '3'], answer: '2' }]
     */
    constructor(questions = []) {
        this.questions = questions;
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.isFinished = false;
        this.listeners = {
            'questionchange': [],
            'finish': [],
            'scorechange': []
        };
    }

    /**
     * 質問リストをロードする
     * @param {Array<object>} questions 
     */
    loadQuestions(questions) {
        this.questions = questions;
        this.reset();
    }

    /**
     * クイズを開始またはリセットする
     */
    start() {
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.isFinished = false;
        this._emit('scorechange', this.score);
        this._emit('questionchange', this.getCurrentQuestion());
    }
    
    reset() {
        this.start();
    }

    /**
     * 現在の質問オブジェクトを返す
     * @returns {object|null}
     */
    getCurrentQuestion() {
        if (this.isFinished || !this.questions[this.currentQuestionIndex]) {
            return null;
        }
        return this.questions[this.currentQuestionIndex];
    }

    /**
     * 回答を送信し、正誤を判定する
     * @param {string} userAnswer 
     * @returns {boolean} 正解ならtrue
     */
    submitAnswer(userAnswer) {
        if (this.isFinished) return false;

        const currentQuestion = this.getCurrentQuestion();
        const isCorrect = currentQuestion.answer === userAnswer;

        if (isCorrect) {
            this.score++;
            this._emit('scorechange', this.score);
        }

        if (this.currentQuestionIndex < this.questions.length - 1) {
            this.currentQuestionIndex++;
            this._emit('questionchange', this.getCurrentQuestion());
        } else {
            this.isFinished = true;
            this._emit('finish', { score: this.score, total: this.questions.length });
        }
        
        return isCorrect;
    }

    /**
     * 現在のスコアを返す
     * @returns {number}
     */
    getScore() {
        return this.score;
    }
    
    /**
     * クイズが終了したかどうかを返す
     * @returns {boolean}
     */
    isQuizFinished() {
        return this.isFinished;
    }

    /**
     * イベントリスナーを登録する
     * @param {string} event - 'questionchange', 'finish', 'scorechange'
     * @param {Function} callback 
     */
    on(event, callback) {
        if (this.listeners[event]) {
            this.listeners[event].push(callback);
        }
    }
    
    /**
     * イベントを発火させる
     * @private
     */
    _emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => callback(data));
        }
    }
}
