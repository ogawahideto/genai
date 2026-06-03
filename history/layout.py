# -*- coding: utf-8 -*-
"""
layout.py - spec(物体ラベル) から写真に重ねる overlay SVG を生成する決定論モジュール。

設計意図:
  - テキスト幅は PIL(ImageFont) で実測し、SVG 側は textLength/lengthAdjust で
    その実測幅に強制フィットさせる。これによりフォント解決の差異があっても
    ラベル枠と文字のズレが起きない。
  - ラベルは画像の左列 / 右列 / 下辺 に振り分け、被写体の上に載せない。
  - 各ラベルから物体 anchor へ引き出し線(濃いハロー+明線)と anchor 点を描画。

AI には依存しない。入力 spec の anchor / side / year は上流(エージェント)が決める。
"""
from __future__ import annotations

import base64
import html
import os
from dataclasses import dataclass, field
from typing import List, Tuple

from PIL import Image, ImageFont


# ---- フォント解決 -----------------------------------------------------------

_FONT_CANDIDATES = [
    # リポジトリ同梱を最優先(あれば)。無ければ Windows 標準の Meiryo Bold。
    os.path.join(os.path.dirname(__file__), "fonts", "NotoSansJP-Bold.ttf"),
    r"C:\Windows\Fonts\meiryob.ttc",
    r"C:\Windows\Fonts\YuGothB.ttc",
    r"C:\Windows\Fonts\meiryo.ttc",
    "/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc",
]

# cairosvg がファミリ名で解決するための既定ファミリ。
_FONT_FAMILY = "Meiryo, 'Yu Gothic', 'Noto Sans JP', sans-serif"


def resolve_font_path() -> str:
    for p in _FONT_CANDIDATES:
        if os.path.exists(p):
            return p
    raise FileNotFoundError(
        "日本語フォントが見つかりません。history/fonts/NotoSansJP-Bold.ttf を置くか、"
        "Windows の Meiryo を利用してください。"
    )


# ---- レイアウト設定 ---------------------------------------------------------

@dataclass
class Style:
    font_size: int = 16
    year_size: int = 14          # 年は少し小さく
    pad_x: int = 9
    pad_y: int = 6
    line_gap: int = 2
    box_radius: int = 7
    margin: int = 6              # 画像端からの余白
    stack_gap: int = 6           # ラベル同士の最小間隔
    box_fill: str = "#0f121c"
    box_fill_opacity: float = 0.74
    box_stroke: str = "#ffffff"
    box_stroke_opacity: float = 0.22
    text_color: str = "#ffffff"
    year_color: str = "#ffd27a"  # 年は淡い黄で識別性UP
    leader_color: str = "#ffffff"
    leader_halo: str = "#000000"
    anchor_color: str = "#ff5a5a"

    @classmethod
    def for_image(cls, w: int, h: int) -> "Style":
        # 画像幅に応じてフォントサイズを自動調整(640px で 16px 基準)。
        fs = max(12, round(w / 40))
        return cls(font_size=fs, year_size=max(11, fs - 2))


# ---- 内部表現 ---------------------------------------------------------------

@dataclass
class Label:
    name: str
    year: str
    side: str                       # "left" | "right" | "bottom"
    anchor: Tuple[float, float]     # 画素座標
    # 計測・配置結果
    name_w: float = 0.0
    year_w: float = 0.0
    box_w: float = 0.0
    box_h: float = 0.0
    line_h: int = 0
    yline_h: int = 0
    ascent: int = 0
    yascent: int = 0
    cx: float = 0.0                 # 箱中心
    cy: float = 0.0
    x: float = 0.0                  # 箱左上
    y: float = 0.0


def _measure(labels: List[Label], font_path: str, st: Style) -> None:
    font = ImageFont.truetype(font_path, st.font_size)
    yfont = ImageFont.truetype(font_path, st.year_size)
    asc, desc = font.getmetrics()
    yasc, ydesc = yfont.getmetrics()
    line_h = asc + desc
    yline_h = yasc + ydesc
    for lb in labels:
        nb = font.getbbox(lb.name)
        yb = yfont.getbbox(lb.year)
        lb.name_w = nb[2] - nb[0]
        lb.year_w = yb[2] - yb[0]
        lb.line_h = line_h
        lb.yline_h = yline_h
        lb.ascent = asc
        lb.yascent = yasc
        content_w = max(lb.name_w, lb.year_w)
        lb.box_w = content_w + 2 * st.pad_x
        lb.box_h = st.pad_y * 2 + line_h + st.line_gap + yline_h


def _resolve_vertical(items: List[Label], h: int, st: Style) -> None:
    """左右列: anchor の y を中心に縦スタック。重なりを下方向に押し出し、
    はみ出したら全体を上にシフトして収める。"""
    if not items:
        return
    items.sort(key=lambda l: l.anchor[1])
    for lb in items:
        lb.cy = lb.anchor[1]
    # 下方向に重なり解消
    for i in range(1, len(items)):
        prev, cur = items[i - 1], items[i]
        min_cy = prev.cy + prev.box_h / 2 + st.stack_gap + cur.box_h / 2
        if cur.cy < min_cy:
            cur.cy = min_cy
    # 下端はみ出しを全体上シフトで補正
    overflow = (items[-1].cy + items[-1].box_h / 2) - (h - st.margin)
    if overflow > 0:
        for lb in items:
            lb.cy -= overflow
    # 上端クランプ
    top_min = st.margin + items[0].box_h / 2
    if items[0].cy < top_min:
        shift = top_min - items[0].cy
        for lb in items:
            lb.cy += shift


def _resolve_bottom(items: List[Label], w: int, h: int, st: Style) -> None:
    """下辺: anchor の x を中心に横スタック。重なりを右に押し出し収める。"""
    if not items:
        return
    items.sort(key=lambda l: l.anchor[0])
    for lb in items:
        lb.cx = lb.anchor[0]
    for i in range(1, len(items)):
        prev, cur = items[i - 1], items[i]
        min_cx = prev.cx + prev.box_w / 2 + st.stack_gap + cur.box_w / 2
        if cur.cx < min_cx:
            cur.cx = min_cx
    overflow = (items[-1].cx + items[-1].box_w / 2) - (w - st.margin)
    if overflow > 0:
        for lb in items:
            lb.cx -= overflow
    left_min = st.margin + items[0].box_w / 2
    if items[0].cx < left_min:
        shift = left_min - items[0].cx
        for lb in items:
            lb.cx += shift


def _place(labels: List[Label], w: int, h: int, st: Style) -> None:
    left = [l for l in labels if l.side == "left"]
    right = [l for l in labels if l.side == "right"]
    bottom = [l for l in labels if l.side == "bottom"]

    _resolve_vertical(left, h, st)
    _resolve_vertical(right, h, st)
    _resolve_bottom(bottom, w, h, st)

    for lb in left:
        lb.x = st.margin
        lb.y = lb.cy - lb.box_h / 2
        lb.cx = lb.x + lb.box_w / 2
    for lb in right:
        lb.x = w - st.margin - lb.box_w
        lb.y = lb.cy - lb.box_h / 2
        lb.cx = lb.x + lb.box_w / 2
    for lb in bottom:
        lb.x = lb.cx - lb.box_w / 2
        lb.y = h - st.margin - lb.box_h
        lb.cy = lb.y + lb.box_h / 2


def _leader_start(lb: Label) -> Tuple[float, float]:
    """引き出し線の箱側の起点(anchor に向く辺の中点)。"""
    if lb.side == "left":
        return (lb.x + lb.box_w, lb.cy)
    if lb.side == "right":
        return (lb.x, lb.cy)
    # bottom
    return (lb.cx, lb.y)


# ---- SVG 生成 ---------------------------------------------------------------

def _esc(s: str) -> str:
    return html.escape(s, quote=True)


def build_svg(image_path: str, objects: List[dict], style: Style | None = None) -> str:
    """objects: [{label, year, side, anchor:[nx,ny]}...] (anchor は正規化0..1)。
    写真を background に埋め込んだ overlay SVG 文字列を返す。"""
    with Image.open(image_path) as im:
        w, h = im.size
    st = style or Style.for_image(w, h)
    font_path = resolve_font_path()

    labels: List[Label] = []
    for o in objects:
        nx, ny = o["anchor"]
        labels.append(Label(
            name=str(o.get("label", "")),
            year=str(o.get("year", "")),
            side=o.get("side", "right"),
            anchor=(nx * w, ny * h),
        ))

    _measure(labels, font_path, st)
    _place(labels, w, h, st)

    # 背景写真を data URI で埋め込む
    with open(image_path, "rb") as f:
        b64 = base64.b64encode(f.read()).decode("ascii")
    ext = os.path.splitext(image_path)[1].lower()
    mime = "image/png" if ext == ".png" else "image/jpeg"

    parts: List[str] = []
    parts.append(
        f'<svg xmlns="http://www.w3.org/2000/svg" '
        f'xmlns:xlink="http://www.w3.org/1999/xlink" '
        f'width="{w}" height="{h}" viewBox="0 0 {w} {h}">'
    )
    parts.append(
        f'<image x="0" y="0" width="{w}" height="{h}" '
        f'xlink:href="data:{mime};base64,{b64}"/>'
    )

    # 1) 引き出し線(濃いハロー → 明線)と anchor 点を先に描く
    for lb in labels:
        sx, sy = _leader_start(lb)
        ax, ay = lb.anchor
        parts.append(
            f'<line x1="{sx:.1f}" y1="{sy:.1f}" x2="{ax:.1f}" y2="{ay:.1f}" '
            f'stroke="{st.leader_halo}" stroke-opacity="0.55" stroke-width="3.2" '
            f'stroke-linecap="round"/>'
        )
        parts.append(
            f'<line x1="{sx:.1f}" y1="{sy:.1f}" x2="{ax:.1f}" y2="{ay:.1f}" '
            f'stroke="{st.leader_color}" stroke-width="1.4" stroke-linecap="round"/>'
        )
        parts.append(
            f'<circle cx="{ax:.1f}" cy="{ay:.1f}" r="3.4" '
            f'fill="{st.anchor_color}" stroke="#ffffff" stroke-width="1"/>'
        )

    # 2) ラベル枠 → テキスト
    for lb in labels:
        parts.append(
            f'<rect x="{lb.x:.1f}" y="{lb.y:.1f}" width="{lb.box_w:.1f}" '
            f'height="{lb.box_h:.1f}" rx="{st.box_radius}" ry="{st.box_radius}" '
            f'fill="{st.box_fill}" fill-opacity="{st.box_fill_opacity}" '
            f'stroke="{st.box_stroke}" stroke-opacity="{st.box_stroke_opacity}" '
            f'stroke-width="1"/>'
        )
        tx = lb.x + st.pad_x
        name_baseline = lb.y + st.pad_y + lb.ascent
        year_baseline = name_baseline + (lb.line_h - lb.ascent) + st.line_gap + lb.yascent
        parts.append(
            f'<text x="{tx:.1f}" y="{name_baseline:.1f}" '
            f'font-family="{_FONT_FAMILY}" font-size="{st.font_size}" '
            f'font-weight="bold" fill="{st.text_color}" '
            f'textLength="{lb.name_w:.1f}" lengthAdjust="spacingAndGlyphs">'
            f'{_esc(lb.name)}</text>'
        )
        parts.append(
            f'<text x="{tx:.1f}" y="{year_baseline:.1f}" '
            f'font-family="{_FONT_FAMILY}" font-size="{st.year_size}" '
            f'font-weight="bold" fill="{st.year_color}" '
            f'textLength="{lb.year_w:.1f}" lengthAdjust="spacingAndGlyphs">'
            f'{_esc(lb.year)}</text>'
        )

    parts.append("</svg>")
    return "".join(parts)
