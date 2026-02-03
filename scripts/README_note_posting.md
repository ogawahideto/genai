# 📝 Note記事自動投稿システム

noteの非公式APIを使用して、Markdown形式の記事を下書きとして自動投稿するシステムです。

## ⚠️ 重要な注意事項

- **このシステムはnoteの非公式APIを使用しています**
- APIの仕様は予告なく変更される可能性があります
- サーバーに負荷をかけないよう、適切な頻度で使用してください
- Cookie情報は秘密情報です。絶対にGitにコミットしないでください
- **自己責任での使用をお願いします**

## 📁 ファイル構成

```
scripts/
├── post-to-note.py              # メインスクリプト
├── note_config.example.json     # 設定ファイルの例
├── note_config.json             # 実際の設定ファイル（.gitignoreで除外）
└── README_note_posting.md       # このファイル
```

## 🚀 セットアップ

### 1. 必要なライブラリのインストール

```bash
pip install requests
```

### 2. 設定ファイルの作成

設定ファイルの例をコピーして、実際の設定ファイルを作成します：

```bash
cd scripts
cp note_config.example.json note_config.json
```

### 3. Cookieの取得

noteにログインした状態で、ブラウザの開発者ツールからCookie情報を取得します。

#### Chromeの場合

1. noteにログインした状態で `F12` キーを押して開発者ツールを開く
2. 「Application」タブ（または「アプリケーション」）を選択
3. 左側のメニューから「Cookies」→「https://note.com」を選択
4. `_note_session` という名前のCookieを探す
5. その値（Value）をコピー

#### Firefoxの場合

1. noteにログインした状態で `F12` キーを押して開発者ツールを開く
2. 「ストレージ」タブを選択
3. 左側のメニューから「Cookie」→「https://note.com」を選択
4. `_note_session` という名前のCookieを探す
5. その値をコピー

### 4. 設定ファイルの編集

`scripts/note_config.json` を開き、以下を編集します：

```json
{
  "username": "your-username",  // ← 自分のnoteユーザー名に変更

  "base_url": "https://note.com/api",

  "endpoints": {
    "create_note": "/v2/notes"  // エンドポイントが変わっている場合は変更
  },

  "cookies": {
    "_note_session": "YOUR_SESSION_COOKIE_HERE"  // ← 取得したCookie値をペースト
  },

  "confirm_before_post": true
}
```

**重要**: `note_config.json` は `.gitignore` で除外されているため、Gitにコミットされません。

## 📖 使い方

### 基本的な使い方

```bash
# articlesディレクトリ内のMarkdownファイルを投稿
python scripts/post-to-note.py articles/pocky-catch_article.md
```

### タグを付けて投稿

```bash
python scripts/post-to-note.py articles/my-article.md --tags "JavaScript" "ゲーム開発" "HTML5"
```

### 確認なしで投稿（自動化用）

```bash
python scripts/post-to-note.py articles/my-article.md --no-confirm
```

### カスタム設定ファイルを使用

```bash
python scripts/post-to-note.py articles/my-article.md --config my_custom_config.json
```

## 📝 記事フォーマット

Markdownファイルは以下の形式で記述します：

```markdown
# 記事のタイトル

記事の本文をMarkdown形式で記述します。

## 見出し2

内容...

### 見出し3

内容...
```

**ポイント**:
- 最初の `#` で始まる行がタイトルとして使用されます
- タイトル以降がすべて本文として投稿されます
- Markdown形式がそのままnoteに反映されます

## 🔧 トラブルシューティング

### エラー: 設定ファイルが見つかりません

```
❌ エラー: 設定ファイルが見つかりません: scripts/note_config.json
```

**解決方法**: `note_config.example.json` を `note_config.json` にコピーして、必要な情報を設定してください。

### エラー: 401 Unauthorized

```
❌ エラー: 401
```

**解決方法**: Cookie情報が間違っているか、有効期限が切れています。もう一度Cookieを取得し直してください。

### エラー: 403 Forbidden

```
❌ エラー: 403
```

**解決方法**: アクセス権限がないか、APIの仕様が変更された可能性があります。エンドポイントURLを確認してください。

### エラー: 404 Not Found

```
❌ エラー: 404
```

**解決方法**: エンドポイントURLが間違っているか、APIの仕様が変更されています。`endpoints.create_note` の値を確認してください。

## 🔍 APIエンドポイントの調査方法

APIの仕様が変更された場合、以下の手順で正しいエンドポイントを調査できます：

1. noteにログインして、ブラウザの開発者ツールを開く（F12）
2. 「Network」タブ（または「ネットワーク」）を選択
3. noteで記事を新規作成または編集して保存する
4. ネットワークタブに表示されるリクエストから、`/api/` を含むものを探す
5. そのリクエストの詳細（URL、メソッド、ヘッダー、ボディ）を確認
6. `note_config.json` の設定を更新

## 📚 参考情報

### 関連記事

- [うさぎでもわかる🐰note非公式APIで記事を自動投稿する方法](https://note.com/taku_sid/n/n1b1b7894e28f)
- [2024年版 note API 非公式一覧表](https://note.com/ego_station/n/n1a0b26f944f4)

### 注意事項

- **非公式API**: noteが公式に提供しているAPIではありません
- **仕様変更**: 予告なく使用できなくなる可能性があります
- **利用規約**: noteの利用規約を遵守してください
- **負荷**: サーバーに過度な負荷をかけないよう注意してください
- **セキュリティ**: Cookie情報は秘密情報として扱ってください

## 🎯 よくある質問

### Q: 公開記事として投稿できますか？

A: 現在の実装では下書き（draft）として保存されます。公開したい場合は、note上で手動で公開するか、スクリプトの `status` を変更してください。

### Q: 画像も一緒に投稿できますか？

A: 現在の実装ではテキストのみです。画像投稿機能を追加するには、別途画像アップロードAPIの実装が必要です。

### Q: 既存の記事を更新できますか？

A: 現在の実装は新規記事の作成のみです。更新機能を実装するには、記事IDを指定してPUTリクエストを送る必要があります。

### Q: Cookieの有効期限はどのくらいですか？

A: noteのセッションCookieは通常、数週間から数ヶ月有効です。有効期限が切れたら、再度取得してください。

### Q: 複数のnoteアカウントで使えますか？

A: 複数の設定ファイル（例: `note_config_account1.json`, `note_config_account2.json`）を作成し、`--config` オプションで指定することで可能です。

## 💡 使用例

### 例1: ポッキーキャッチゲームの記事を投稿

```bash
python scripts/post-to-note.py articles/pocky-catch_article.md --tags "ゲーム開発" "JavaScript" "HTML5"
```

### 例2: 複数の記事を連続投稿（間隔を空ける）

```bash
# Bashの場合
for file in articles/*.md; do
    python scripts/post-to-note.py "$file" --no-confirm
    sleep 10  # 10秒待機
done
```

```powershell
# PowerShellの場合
Get-ChildItem articles\*.md | ForEach-Object {
    python scripts/post-to-note.py $_.FullName --no-confirm
    Start-Sleep -Seconds 10
}
```

## 🤝 貢献

バグ報告や機能追加の提案は、Issueやプルリクエストでお願いします。

## 📄 ライセンス

このスクリプトはMITライセンスの下で公開されています。自由に使用・改変してください。

---

**Happy Note Posting! 📝✨**
