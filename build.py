#!/usr/bin/env python3
"""學習階梯：把 src/ 組成首頁與各課程的單一網頁。

產出：
  docs/index.html            首頁（課程總覽）
  docs/<課程>/index.html     各課程完整 HTML，給 GitHub Pages
  dist/<課程>.html           不含 <html>/<head> 外殼，給 Claude Artifact（發佈時會自動補上）
  docs/manifest.webmanifest、icon-*.png、sw.js   全站共用的 PWA 檔案

原始碼：src/<課程>/ 為各課程；src/shared/ 為共用模組（腳本名稱前加 @ 表示從 shared 取）。
"""
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).parent
SRC = ROOT / "src"
SITE = "學習階梯"
# 各課程：載入順序有相依性（生統：core → content → app → widgets → terms → demos → 多語系 → 同步 → 啟動）
COURSES = {
    "biostat": {
        "scripts": ["core.js", "content.js", "app.js", "widgets.js", "terms.js", "demos.js", "i18n.js", "lang-en.js", "@cloud.js", "start.js"],
        "desc": "從國中數學到可投稿論文的互動式生物統計課程，含不需寫程式的分析實驗室。",
        "theme": "#2F3B99",
    },
    "chem": {
        "scripts": ["ui.js", "chem.js", "mol.js", "content.js", "ch/*.js", "terms.js", "widgets.js", "w/*.js", "app.js", "@cloud.js", "start.js"],
        "desc": "學士後中醫入學考的普通化學與有機化學：用互動圖從原理學起，看懂酸鹼平衡與反應機構。",
        "theme": "#17705F",
    },
}
PORTAL = {"scripts": ["@cloud.js", "portal.js"], "desc": "學習階梯：用互動圖解從原理學起的線上課程。", "theme": "#2F3B99"}

HEAD = """<!doctype html>
<html lang="zh-Hant">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="description" content="{desc}">
<meta name="app-site" content="pages">
<meta name="theme-color" content="{theme}">
<link rel="manifest" href="{root}manifest.webmanifest">
<link rel="icon" type="image/png" href="{root}icon-192.png">
<link rel="apple-touch-icon" href="{root}icon-192.png">
<style>
:root {{ color-scheme: light; padding-top: env(safe-area-inset-top, 0px); padding-bottom: env(safe-area-inset-bottom, 0px); }}
body {{ margin: 0; font: 14px system-ui, sans-serif; }}
img {{ max-width: 100%; }}
[hidden] {{ display: none !important; }}
</style>
"""


def phrase_tables(cdir):
    """src/lang/<語言>/*.tsv：每行「中文片語<TAB>譯文」，數字已換成 {0}、{1}…；轉成片語字典。"""
    import json
    out = []
    for d in sorted((cdir / "lang").glob("*")):
        ph = {}
        for t in sorted(d.glob("*.tsv")):
            for n, line in enumerate(t.read_text(encoding="utf-8").splitlines(), 1):
                if not line.strip() or line.startswith("#"):
                    continue
                if "\t" not in line:
                    raise SystemExit(f"{t.name}:{n} 缺少 TAB：{line[:40]}")
                k, v = line.split("\t", 1)
                ph[k] = v
        if ph:
            out.append(f"Object.assign(I18N.packs[{json.dumps(d.name)}].ph, {json.dumps(ph, ensure_ascii=False)});")
    return "\n".join(out)


def png_icon(size):
    """App 圖示：靛藍底、白色四階樓梯（純 Python 產生 PNG，不需影像套件）。"""
    import struct, zlib
    bg, fg = (0x2F, 0x3B, 0x99), (0xFF, 0xFF, 0xFF)
    m, steps = size * 0.22, 4  # 邊界留給 maskable 安全區
    w = (size - 2 * m) / steps
    rows = []
    for y in range(size):
        row = bytearray([0])
        for x in range(size):
            k = int((x - m) // w) if m <= x < size - m else -1
            top = size - m - (k + 1) * w
            row += bytes(fg if 0 <= k < steps and top <= y < size - m else bg)
        rows.append(bytes(row))
    def chunk(t, d):
        return struct.pack(">I", len(d)) + t + d + struct.pack(">I", zlib.crc32(t + d) & 0xFFFFFFFF)
    return (b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", struct.pack(">IIBBBBB", size, size, 8, 2, 0, 0, 0))
            + chunk(b"IDAT", zlib.compress(b"".join(rows), 9)) + chunk(b"IEND", b""))


def pwa(pages):
    """PWA：manifest、圖示、service worker（快取版本＝所有頁面內容的雜湊，內容一改就換新快取）。"""
    docs = ROOT / "docs"
    for n in (192, 512):
        (docs / f"icon-{n}.png").write_bytes(png_icon(n))
    man = {"name": SITE, "short_name": SITE, "start_url": "./", "scope": "./",
           "display": "standalone", "background_color": "#F3F4F0", "theme_color": "#2F3B99",
           "icons": [{"src": f"icon-{n}.png", "sizes": f"{n}x{n}", "type": "image/png", "purpose": "any maskable"} for n in (192, 512)]}
    (docs / "manifest.webmanifest").write_text(json.dumps(man, ensure_ascii=False, indent=1), encoding="utf-8")
    ver = hashlib.sha1("".join(pages.values()).encode()).hexdigest()[:10]
    urls = ["./", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png"] + [f"./{k}/" for k in pages if k]
    sw = (SRC / "shared" / "sw.js").read_text(encoding="utf-8").replace("__VERSION__", ver).replace("__URLS__", json.dumps(urls))
    (docs / "sw.js").write_text(sw, encoding="utf-8")


def assemble(cdir, scripts):
    """依序串接腳本，套進 shell.html；回傳不含外殼的頁面（給 Artifact）。"""
    shell = (cdir / "shell.html").read_text(encoding="utf-8")
    shell = shell.replace("/*BASE*/", (SRC / "shared" / "base.css").read_text(encoding="utf-8"))
    files = []
    for f in scripts:
        if "*" in f:  # 整個資料夾（依檔名排序）
            files += sorted(cdir.glob(f))
            continue
        files.append(SRC / "shared" / f[1:] if f.startswith("@") else cdir / f)
        if f.startswith("lang-"):  # 語言包的分檔：<課程>/lang/<語言>/*.js
            files += sorted((cdir / "lang" / f[5:-3]).glob("*.js"))
    # 片語字典要在最後一支（啟動、開始翻譯）之前載入
    js = "\n".join(p.read_text(encoding="utf-8") for p in files[:-1])
    js += "\n" + phrase_tables(cdir) + "\n" + files[-1].read_text(encoding="utf-8")
    if "</script" in js.lower():
        raise SystemExit(f"{cdir.name}：原始碼中出現 </script>，會提早結束 script 標籤")
    if "\ufffd" in shell + js:
        raise SystemExit(f"{cdir.name}：原始碼中有 U+FFFD 替換字元，請改寫成 \\uFFFD")
    page = shell.replace("/*PURE*/\n/*CONTENT*/\n/*APP*/", js)
    if page == shell:
        raise SystemExit(f"{cdir.name}/shell.html 找不到 /*PURE*/ /*CONTENT*/ /*APP*/ 佔位符")
    return page


def full_html(page, cfg, root):
    style_end = page.index("</style>") + len("</style>")
    assert page.index("</title>") < style_end
    head = HEAD.format(desc=cfg["desc"], theme=cfg["theme"], root=root)
    return head + page[:style_end] + "\n</head>\n<body>\n" + page[style_end:] + "\n</body>\n</html>\n"


def build():
    docs, dist = ROOT / "docs", ROOT / "dist"
    docs.mkdir(exist_ok=True); dist.mkdir(exist_ok=True)
    (docs / ".nojekyll").write_text("", encoding="utf-8")
    pages = {}
    for cid, cfg in COURSES.items():
        page = assemble(SRC / cid, cfg["scripts"])
        (dist / f"{cid}.html").write_text(page, encoding="utf-8")
        (docs / cid).mkdir(exist_ok=True)
        pages[cid] = full_html(page, cfg, "../")
        (docs / cid / "index.html").write_text(pages[cid], encoding="utf-8")
        print(f"docs/{cid}/index.html  {len(pages[cid].encode()) // 1024} KB")
    page = assemble(SRC / "portal", PORTAL["scripts"])
    pages[""] = full_html(page, PORTAL, "")
    (docs / "index.html").write_text(pages[""], encoding="utf-8")
    print(f"docs/index.html  {len(pages[''].encode()) // 1024} KB")
    pwa(pages)


if __name__ == "__main__":
    build()
