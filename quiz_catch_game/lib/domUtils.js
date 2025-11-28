/**
 * AIモデル: Gemini
 * Gemini CLIバージョン: 1.0
 * 作成日時: 2025年11月28日金曜日
 * ユーザープロンプト: 他にモジュール化できるパターンはないか探してください。モジュールのみ作り、リファクタリングはしないでください。
 * AIのアプローチ: 汎用的なDOM操作のパターンを抽出し、ユーティリティモジュールとして提供する。
 * 実装の意図: 複数のアプリケーションで共通して利用されるDOM操作を抽象化し、コードの重複を減らし、可読性と保守性を向上させる。
 */

// querySelectorのショートハンド
export const $ = (selector, parent = document) => parent.querySelector(selector);
export const $$ = (selector, parent = document) => Array.from(parent.querySelectorAll(selector));

// 新しい要素を作成し、オプションを設定する
export const createElement = (tagName, options = {}) => {
    const element = document.createElement(tagName);
    for (const key in options) {
        if (key === 'class') {
            element.className = options[key];
        } else if (key === 'children') {
            options[key].forEach(child => element.appendChild(child));
        } else if (key === 'dataset') {
            for (const dataKey in options[key]) {
                element.dataset[dataKey] = options[key][dataKey];
            }
        } else if (key === 'style') {
            for (const styleKey in options[key]) {
                element.style[styleKey] = options[key][styleKey];
            }
        } else if (key === 'eventListeners') {
            for (const eventType in options[key]) {
                element.addEventListener(eventType, options[key][eventType]);
            }
        } else {
            element[key] = options[key];
        }
    }
    return element;
};

// 要素の表示/非表示を切り替える
export const toggleVisibility = (element, isVisible) => {
    if (element) {
        element.style.display = isVisible ? '' : 'none';
    }
};

// 要素にクラスを追加/削除する
export const addClass = (element, className) => {
    element && element.classList.add(className);
};

export const removeClass = (element, className) => {
    element && element.classList.remove(className);
};

export const toggleClass = (element, className) => {
    element && element.classList.toggle(className);
};
