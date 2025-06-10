# genai
Small apps made with Generative AIs

## Web Applications
以下の説明はClaude Codeが生成しました。
誤りを含む可能性があります。

### 🎮 Games

#### [ラーメンとんかつアートバトル](art_food_battle/index.html) 🎮
芸術的なラーメンとトンカツの戦いを描いたアクションゲーム。Canvas-based shooting game with artistic food battle theme.
*操作: キーボード（方向キー・スペース）*

#### [リバーシ](reversi/index.html) 🖱️
クラシックなリバーシ（オセロ）ゲーム。2人対戦でプレイ可能。
*操作: マウスクリック*
- [四人用リバーシ](reversi/four-player.html) - 4人対戦版 🖱️

#### [シューティングゲーム](shooting/shootingclaude35sonnet.html) 🎮🖱️
宇宙シューティングゲーム。複数のAIモデルで生成されたバリエーション：
*操作: キーボード（方向キー・スペース）+ マウスクリック*
- [Claude 3.5 Sonnet版](shooting/shootingclaude35sonnet.html) *by Claude 3.5 Sonnet*
- [DeepSeek R1版](shooting/shootingdeepseekr1.html) *by DeepSeek R1*
- [DeepSeek R1 Local版](shooting/shootingdeepseekr1local13B.html) *by DeepSeek R1 Local 13B*
- [GPT-4o mini版](shooting/shootingo3minihigh.html) *by GPT-4o mini*

#### [シューティングゲーム (Claude Code)](shooting_cc/index.html) *by Claude Code* 🎮
Claude Codeで作成されたシューティングゲーム。
*操作: キーボード（WASD・方向キー・スペース・R）*
- [Version 2](shooting_cc_2/index.html) - 改良版 *by Claude Code* 🎮

#### [ピンボール](pinball/pinball.html) 🎮
物理エンジン（Matter.js）を使用したリアルなピンボールゲーム。
*操作: キーボード（方向キー・A/D・任意キー）*

#### [重力ゲーム](gravity/index.html) 🎮
物理シミュレーションによる重力パズルゲーム。
*操作: キーボード（方向キー・スペース・R・E・N）*

#### [ソリティア](solitaire-deepseek/solitaire.html) *by DeepSeek* 🖱️
一人用のソリティアパズルゲーム。
*操作: マウス（クリック・ドラッグ）*

#### [ゆれ豆腐](yuretofu/index.html) 🎮🖱️
ユニークなキャラクターを操作する物理アクションゲーム。
*操作: キーボード（方向キー・スペース）+ マウスクリック*

### 🎵 Music & Education

#### [ギタースケール練習アプリ](guitar_scale/index.html) 🖱️
ギターのスケール練習用アプリ。音声再生機能付き。
*操作: マウスクリック*

#### [コード進行練習アプリ](chord_practice_app/index.html) 🖱️
音楽理論のコード進行を学習するためのアプリ。
*操作: マウスクリック*

#### [英単語学習ゲーム](enwords/enwords.html) 🎮📱🖱️
楽しく英単語を覚えられるゲーム形式の学習アプリ。
*操作: キーボード（方向キー）+ タッチ + マウスクリック*

#### [化学式クイズ](chem_formula_quiz/index.html) 🧪🎮🖱️
化学式と物質名をマッチングするミニゲーム。
*操作: マウスクリック*

### 🎭 Interactive & Utilities

#### [Anthropic & Claude 愛称ジェネレーター](claude_nickname/index.html) 🖱️
AnthropicとClaudeに関連する愛称を生成するジェネレーター。
*操作: マウスクリック*

#### [オトノキョリ](otono-kyori/index.html) 🎮🖱️
音と距離をテーマにしたインタラクティブアプリ。
*操作: キーボード（Rキー）+ マウスクリック*

#### [ソフとウェア](sofu_to_ware/index.html) 🖱️
ソフトウェア組み立てパズル。プログラミング概念を学べる教育的ゲーム。
*操作: マウス（クリック・ドラッグ&ドロップ・ダブルクリック）*

---

## 技術的特徴
- **フレームワーク不使用**: 全てのアプリはVanilla JavaScript、HTML、CSSで構築
- **単一ファイル構成**: 各アプリは依存関係のない単一のHTMLファイル
- **レスポンシブデザイン**: モバイル対応
- **多言語対応**: 日本語UIを中心とした設計

## 使用方法
各アプリケーションのHTMLファイルをブラウザで直接開くだけで動作します。ビルドプロセスは不要です。
