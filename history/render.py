# -*- coding: utf-8 -*-
"""
render.py - spec.json と写真から、ラベルを焼き込んだ画像を生成する決定論 CLI。

  python history/render.py <image> <spec.json> <out.(png|jpg)>
  python history/render.py history/001.jpg history/out/spec.json history/out/002.jpg

spec.json スキーマ:
{
  "image": "001.jpg",                  # 任意(記録用)
  "objects": [
    {"label": "ベーコン", "kind": "食材", "year": "前1500年頃",
     "anchor": [0.55, 0.42], "side": "right",
     "source": "https://..."}          # source は任意(検証用)
  ]
}
  - anchor: 引き出し線が指す物体中心。正規化座標 [x, y] (0..1)。
  - side  : ラベルを置く辺 "left" | "right" | "bottom"。
  - year  : 表示する年(製品=発明年 / 食材=起源)。日本語整形済み文字列。

AI には依存しない。判別・年代・anchor/side は上流(エージェント)が spec に書く。
人手で spec.json を直して再実行すれば、再クエリ無しで描き直せる。
"""
from __future__ import annotations

import io
import json
import sys
from pathlib import Path

import cairosvg
from PIL import Image

# 同ディレクトリの layout を import 可能にする
sys.path.insert(0, str(Path(__file__).resolve().parent))
from layout import Style, build_svg  # noqa: E402


def render(image_path: str, spec_path: str, out_path: str, scale: float = 2.0) -> str:
    spec = json.loads(Path(spec_path).read_text(encoding="utf-8"))
    objects = spec.get("objects", [])
    if not objects:
        raise ValueError(f"{spec_path} に objects がありません。")

    with Image.open(image_path) as im:
        w, h = im.size

    style = Style.for_image(w, h)
    svg = build_svg(image_path, objects, style)

    # scale 倍で高解像度ラスタライズしてからアンチエイリアス縮小 → 文字を鮮明に
    png_bytes = cairosvg.svg2png(
        bytestring=svg.encode("utf-8"),
        output_width=int(w * scale),
        output_height=int(h * scale),
    )
    img = Image.open(io.BytesIO(png_bytes)).convert("RGB")
    if scale != 1.0:
        img = img.resize((w, h), Image.LANCZOS)

    out = Path(out_path)
    out.parent.mkdir(parents=True, exist_ok=True)
    if out.suffix.lower() in (".jpg", ".jpeg"):
        img.save(out, quality=92)
    else:
        img.save(out)
    return str(out)


def main(argv: list[str]) -> int:
    if len(argv) != 4:
        print(__doc__)
        return 2
    _, image_path, spec_path, out_path = argv
    result = render(image_path, spec_path, out_path)
    print(f"wrote: {result}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
