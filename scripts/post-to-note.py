#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Note記事自動投稿スクリプト
note非公式APIを使用してMarkdown記事を下書き保存します

使用方法:
    python scripts/post-to-note.py articles/pocky-catch_article.md

注意:
    - note非公式APIは予告なく変更される可能性があります
    - 適切な頻度での使用を心がけてください
    - Cookie情報は秘密情報として扱ってください
"""

import json
import os
import sys
import requests
from pathlib import Path
import argparse
import time
from datetime import datetime

class NoteAPI:
    """Note非公式APIクライアント"""

    def __init__(self, config_path="scripts/note_config.json"):
        """
        初期化

        Args:
            config_path: 設定ファイルのパス
        """
        self.config = self.load_config(config_path)
        self.base_url = self.config.get("base_url", "https://note.com/api")
        self.session = requests.Session()
        self.setup_session()

    def load_config(self, config_path):
        """設定ファイルを読み込む"""
        if not os.path.exists(config_path):
            print(f"❌ エラー: 設定ファイルが見つかりません: {config_path}")
            print(f"   note_config.example.json を参考に {config_path} を作成してください")
            sys.exit(1)

        with open(config_path, "r", encoding="utf-8") as f:
            return json.load(f)

    def setup_session(self):
        """セッションの設定（Cookie、ヘッダー）"""
        # Cookieの設定
        cookies = self.config.get("cookies", {})
        for name, value in cookies.items():
            # Cookie値がASCII範囲内であることを確認
            try:
                value.encode('ascii')
                self.session.cookies.set(name, value, domain=".note.com")
            except UnicodeEncodeError:
                print(f"⚠️  警告: Cookie '{name}' に非ASCII文字が含まれています")
                # 非ASCII文字を除去または置換
                safe_value = value.encode('ascii', errors='ignore').decode('ascii')
                self.session.cookies.set(name, safe_value, domain=".note.com")

        # 共通ヘッダーの設定
        self.session.headers.update({
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Accept": "application/json",
            "Content-Type": "application/json; charset=utf-8",
            "Origin": "https://note.com",
            "Referer": "https://note.com/",
        })

    def read_markdown_file(self, file_path):
        """Markdownファイルを読み込む"""
        if not os.path.exists(file_path):
            print(f"❌ エラー: ファイルが見つかりません: {file_path}")
            sys.exit(1)

        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()

        # タイトルを抽出（最初の#行）
        lines = content.split("\n")
        title = "無題"
        body = content

        for i, line in enumerate(lines):
            if line.strip().startswith("# "):
                title = line.strip()[2:].strip()
                # タイトル行を除いた本文
                body = "\n".join(lines[i+1:]).strip()
                break

        return title, body

    def create_draft(self, title, body, tags=None):
        """
        下書きを作成（2段階プロセス）

        Args:
            title: 記事タイトル
            body: 記事本文（Markdown形式）
            tags: タグのリスト（オプション）

        Returns:
            レスポンスのJSON、またはNone
        """
        endpoint = self.config.get("endpoints", {}).get("create_note", "/v1/text_notes")
        url = f"{self.base_url}{endpoint}"

        print(f"\n📤 投稿中...")
        print(f"   タイトル: {title}")
        print(f"   本文の長さ: {len(body)} 文字")

        try:
            # ステップ1: 空の下書きを作成
            print(f"\n[ステップ1] 空の下書きを作成中...")
            print(f"   URL: {url}")

            create_payload = {"template_key": None}
            response1 = self.session.post(url, json=create_payload, timeout=30)

            print(f"   ステータスコード: {response1.status_code}")

            if response1.status_code not in [200, 201]:
                print(f"❌ エラー: 下書き作成に失敗")
                print(f"   レスポンス: {response1.text}")
                return None

            result1 = response1.json()

            if "data" not in result1 or "id" not in result1["data"]:
                print(f"❌ エラー: 記事IDが取得できませんでした")
                print(f"   レスポンス: {response1.text}")
                return None

            note_id = result1["data"]["id"]
            note_key = result1["data"].get("key", "")
            print(f"   記事ID: {note_id}")
            print(f"   記事キー: {note_key}")

            # ステップ2: 記事の内容を更新
            print(f"\n[ステップ2] 記事内容を更新中...")
            update_url = f"{url}/{note_id}"
            print(f"   URL: {update_url}")

            # 更新ペイロードの構築
            update_payload = {
                "name": title,
                "body": body,
            }

            # タグの追加
            if tags:
                update_payload["hashtag_names"] = tags

            response2 = self.session.patch(update_url, json=update_payload, timeout=30)

            print(f"   ステータスコード: {response2.status_code}")

            if response2.status_code in [200, 201]:
                print("✅ 下書き保存に成功しました！")
                result2 = response2.json()

                # 記事URLの表示
                if note_key:
                    note_url = f"https://note.com/{self.config.get('username', 'your-username')}/n/{note_key}"
                    print(f"   記事URL: {note_url}")

                return result2
            else:
                print(f"❌ エラー: 記事更新に失敗")
                print(f"   レスポンス: {response2.text}")
                return None

        except requests.exceptions.RequestException as e:
            print(f"❌ リクエストエラー: {e}")
            return None

    def post_article(self, file_path, tags=None):
        """
        記事ファイルを投稿

        Args:
            file_path: Markdownファイルのパス
            tags: タグのリスト（オプション）
        """
        print(f"\n📄 ファイル読み込み: {file_path}")
        title, body = self.read_markdown_file(file_path)

        print(f"   タイトル: {title}")
        print(f"   本文の長さ: {len(body)} 文字")

        # 確認
        if self.config.get("confirm_before_post", True):
            print("\n⚠️  この内容で投稿しますか？")
            response = input("   続行する場合は 'yes' を入力: ")
            if response.lower() != "yes":
                print("❌ キャンセルしました")
                return

        # 投稿実行
        result = self.create_draft(title, body, tags)

        return result


def main():
    """メイン関数"""
    parser = argparse.ArgumentParser(
        description="note記事自動投稿スクリプト",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
使用例:
    # 基本的な使い方
    python scripts/post-to-note.py articles/pocky-catch_article.md

    # タグを指定して投稿
    python scripts/post-to-note.py articles/my-article.md --tags "JavaScript" "ゲーム開発"

    # 確認なしで投稿
    python scripts/post-to-note.py articles/my-article.md --no-confirm

    # カスタム設定ファイルを使用
    python scripts/post-to-note.py articles/my-article.md --config my_config.json
        """
    )

    parser.add_argument(
        "file",
        help="投稿するMarkdownファイルのパス"
    )

    parser.add_argument(
        "--tags",
        nargs="*",
        help="記事に付けるタグ"
    )

    parser.add_argument(
        "--config",
        default="scripts/note_config.json",
        help="設定ファイルのパス（デフォルト: scripts/note_config.json）"
    )

    parser.add_argument(
        "--no-confirm",
        action="store_true",
        help="投稿前の確認をスキップ"
    )

    args = parser.parse_args()

    print("=" * 60)
    print("📝 Note記事自動投稿スクリプト")
    print("=" * 60)

    # APIクライアントの初期化
    try:
        api = NoteAPI(config_path=args.config)

        # 確認設定の上書き
        if args.no_confirm:
            api.config["confirm_before_post"] = False

        # 記事の投稿
        api.post_article(args.file, tags=args.tags)

    except KeyboardInterrupt:
        print("\n\n❌ 中断されました")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ エラーが発生しました: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

    print("\n" + "=" * 60)
    print("✨ 完了")
    print("=" * 60)


if __name__ == "__main__":
    main()
