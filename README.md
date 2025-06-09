# genai
Small apps made with Generative AIs

## Web Applications
以下の説明はClaude Codeが生成しました。
誤りを含む可能性があります。

### 🎮 Games

#### [ラーメンとんかつアートバトル](art_food_battle/index.html)
芸術的なラーメンとトンカツの戦いを描いたアクションゲーム。Canvas-based shooting game with artistic food battle theme.

#### [リバーシ](reversi/index.html)
クラシックなリバーシ（オセロ）ゲーム。2人対戦でプレイ可能。
- [四人用リバーシ](reversi/four-player.html) - 4人対戦版

#### [シューティングゲーム](shooting/shootingclaude35sonnet.html)
宇宙シューティングゲーム。複数のAIモデルで生成されたバリエーション：
- [Claude版](shooting/shootingclaude35sonnet.html)
- [DeepSeek R1版](shooting/shootingdeepseekr1.html)
- [DeepSeek R1 Local版](shooting/shootingdeepseekr1local13B.html)
- [GPT-4o mini版](shooting/shootingo3minihigh.html)

#### [シューティングゲーム (Claude Code)](shooting_cc/index.html)
Claude Codeで作成されたシューティングゲーム。
- [Version 2](shooting_cc_2/index.html) - 改良版

#### [ピンボール](pinball/pinball.html)
物理エンジン（Matter.js）を使用したリアルなピンボールゲーム。

#### [重力ゲーム](gravity/index.html)
物理シミュレーションによる重力パズルゲーム。

#### [ソリティア](solitaire-deepseek/solitaire.html)
一人用のソリティアパズルゲーム。

#### [ゆれ豆腐](yuretofu/index.html)
ユニークなキャラクターを操作する物理アクションゲーム。

### 🎵 Music & Education

#### [ギタースケール練習アプリ](guitar_scale/index.html)
ギターのスケール練習用アプリ。音声再生機能付き。

#### [コード進行練習アプリ](chord_practice_app/index.html)
音楽理論のコード進行を学習するためのアプリ。

#### [英単語学習ゲーム](enwords/enwords.html)
楽しく英単語を覚えられるゲーム形式の学習アプリ。

### 🎭 Interactive & Utilities

#### [Anthropic & Claude 愛称ジェネレーター](claude_nickname/index.html)
AnthropicとClaudeに関連する愛称を生成するジェネレーター。

#### [オトノキョリ](otono-kyori/index.html)
音と距離をテーマにしたインタラクティブアプリ。

#### [ソフとウェア](sofu_to_ware/index.html)
ソフトウェア組み立てパズル。プログラミング概念を学べる教育的ゲーム。

---

## 技術的特徴
- **フレームワーク不使用**: 全てのアプリはVanilla JavaScript、HTML、CSSで構築
- **単一ファイル構成**: 各アプリは依存関係のない単一のHTMLファイル
- **レスポンシブデザイン**: モバイル対応
- **多言語対応**: 日本語UIを中心とした設計

## 使用方法
各アプリケーションのHTMLファイルをブラウザで直接開くだけで動作します。ビルドプロセスは不要です。
