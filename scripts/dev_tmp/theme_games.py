#!/usr/bin/env python3
"""Apply unique themed CSS prefixes + palettes to ~60 card mini games."""
import os, re, sys

BASE = "/home/kasm-user/cards-and-such/web/src/games"

THEMES = [
    ("pip-purse",     "tpip",     "#7c3aed",  "#a78bfa",  "#3b0764", "#1e0742", "#0f0723", "#fefce8", "#7c3aed", "#a78bfa", "purse purple"),
    ("red-roulette",  "trrl",     "#dc2626",  "#fca5a5",  "#450a0a", "#7f1d1d", "#1c0606", "#fef2f2", "#dc2626", "#fca5a5", "roulette red"),
    ("black-bidder",  "tbbd",     "#0f172a",  "#64748b",  "#020617", "#0f172a", "#000000", "#f8fafc", "#475569", "#94a3b8", "bidder noir"),
    ("suit-stack",    "tsst",     "#0891b2",  "#67e8f9",  "#083344", "#0e7490", "#022c3a", "#ecfeff", "#0891b2", "#67e8f9", "stack teal"),
    ("face-feast",    "tffs",     "#be185d",  "#fbcfe8",  "#500724", "#831843", "#27040f", "#fff1f5", "#db2777", "#fbcfe8", "feast pink"),
    ("quartet-match", "tqmt",     "#2563eb",  "#93c5fd",  "#172554", "#1e3a8a", "#0a1233", "#eff6ff", "#2563eb", "#93c5fd", "match blue"),
    ("even-evens",    "tevn",     "#059669",  "#6ee7b7",  "#022c22", "#064e3b", "#001a13", "#ecfdf5", "#059669", "#6ee7b7", "even green"),
    ("odd-odds",      "todd",     "#ca8a04",  "#fde047",  "#422006", "#713f12", "#1f0d02", "#fefce8", "#ca8a04", "#fde047", "odd amber"),
    ("triple-trouble","ttrp",     "#9333ea",  "#d8b4fe",  "#3b0764", "#581c87", "#1c0633", "#faf5ff", "#9333ea", "#d8b4fe", "triple violet"),
    ("quartet-quest", "tqqs",     "#0d9488",  "#5eead4",  "#042f2e", "#115e59", "#011918", "#f0fdfa", "#0d9488", "#5eead4", "quest teal"),
    ("flush-five",    "tflv",     "#16a34a",  "#86efac",  "#052e16", "#14532d", "#021407", "#f0fdf4", "#16a34a", "#86efac", "flush green"),
    ("low-five",      "tlow",     "#0369a1",  "#7dd3fc",  "#082f49", "#0c4a6e", "#031320", "#f0f9ff", "#0284c7", "#7dd3fc", "low ocean"),
    ("high-five-cards","thfv",    "#ea580c",  "#fdba74",  "#431407", "#7c2d12", "#1c0701", "#fff7ed", "#ea580c", "#fdba74", "high orange"),
    ("face-flip",     "tffl",     "#c026d3",  "#f0abfc",  "#4a044e", "#701a75", "#240224", "#fdf4ff", "#c026d3", "#f0abfc", "flip fuchsia"),
    ("pip-pulse",     "tppl",     "#e11d48",  "#fda4af",  "#4c0519", "#881337", "#1a0207", "#fff1f2", "#e11d48", "#fda4af", "pulse rose"),
    ("card-tornado",  "ttor",     "#475569",  "#cbd5e1",  "#0f172a", "#1e293b", "#020617", "#f1f5f9", "#64748b", "#cbd5e1", "storm gray"),
    ("card-flood",    "tflo",     "#0e7490",  "#22d3ee",  "#083344", "#155e75", "#021014", "#ecfeff", "#06b6d4", "#22d3ee", "flood aqua"),
    ("card-meteor",   "tmet",     "#312e81",  "#a5b4fc",  "#020617", "#0c0a1f", "#000000", "#eef2ff", "#4338ca", "#a5b4fc", "cosmic black"),
    ("card-eclipse",  "tecl",     "#1f2937",  "#fbbf24",  "#0a0a0a", "#1f1d1a", "#000000", "#fffbeb", "#374151", "#fbbf24", "eclipse gold"),
    ("card-aurora",   "taur",     "#10b981",  "#a7f3d0",  "#022c22", "#0f172a", "#0d1f3a", "#ecfdf5", "#10b981", "#a7f3d0", "aurora green"),
    ("card-mirage",   "tmir",     "#d97706",  "#fcd34d",  "#451a03", "#78350f", "#1f0a01", "#fffbeb", "#d97706", "#fcd34d", "mirage sand"),
    ("card-lighthouse","tlit",    "#f59e0b",  "#fde68a",  "#1e1b4b", "#312e81", "#0a0a23", "#fffbeb", "#f59e0b", "#fde68a", "warm yellow"),
    ("card-mountain", "tmtn",     "#475569",  "#94a3b8",  "#1e293b", "#334155", "#0a0f1a", "#f8fafc", "#64748b", "#cbd5e1", "mountain slate"),
    ("card-river",    "triv",     "#0284c7",  "#7dd3fc",  "#082f49", "#0c4a6e", "#031320", "#f0f9ff", "#0284c7", "#7dd3fc", "river blue"),
    ("card-island",   "tisl",     "#15803d",  "#86efac",  "#052e16", "#0e7490", "#012618", "#f0fdf4", "#16a34a", "#86efac", "island palm"),
    ("card-canyon",   "tcyn",     "#b45309",  "#fdba74",  "#431407", "#7c2d12", "#1c0701", "#fff7ed", "#c2410c", "#fdba74", "canyon rust"),
    ("card-bridge-build","tbrb",  "#7c2d12",  "#f59e0b",  "#1c1917", "#292524", "#0c0a09", "#fef3c7", "#a16207", "#f59e0b", "bridge bronze"),
    ("card-castle-build","tcsb",  "#6b21a8",  "#c4b5fd",  "#2e1065", "#4c1d95", "#16052e", "#faf5ff", "#7c3aed", "#c4b5fd", "castle royal"),
    ("card-call",     "tcal",     "#0e7490",  "#67e8f9",  "#083344", "#155e75", "#021014", "#ecfeff", "#0891b2", "#67e8f9", "call cyan"),
    ("card-pile",     "tpil",     "#854d0e",  "#fde68a",  "#422006", "#713f12", "#1c0c01", "#fffbeb", "#a16207", "#fde68a", "pile honey"),
    ("card-pyramid-build","tpyr", "#b45309",  "#fde68a",  "#451a03", "#78350f", "#1f0a01", "#fffbeb", "#d97706", "#fde68a", "pyramid sand"),
    ("pip-pinch",     "tppn",     "#be123c",  "#fda4af",  "#4c0519", "#881337", "#1a0207", "#fff1f2", "#e11d48", "#fda4af", "pinch crimson"),
    ("card-collector","tccol",    "#1d4ed8",  "#93c5fd",  "#172554", "#1e3a8a", "#0a1233", "#eff6ff", "#2563eb", "#93c5fd", "collector indigo"),
    ("face-collector","tfcol",    "#9d174d",  "#fbcfe8",  "#500724", "#831843", "#1c0210", "#fff1f5", "#be185d", "#fbcfe8", "face magenta"),
    ("rank-collector","trcol",    "#0f766e",  "#5eead4",  "#042f2e", "#115e59", "#011918", "#f0fdfa", "#0d9488", "#5eead4", "rank teal"),
    ("card-flag-pole","tflg",     "#dc2626",  "#fef08a",  "#7f1d1d", "#991b1b", "#3f0a0a", "#fef9c3", "#ef4444", "#fef08a", "flag scarlet"),
    ("card-mountain-climb","tmcl","#3f3f46",  "#a1a1aa",  "#18181b", "#27272a", "#09090b", "#fafafa", "#52525b", "#a1a1aa", "climb stone"),
    ("card-stadium",  "tstd",     "#15803d",  "#fde047",  "#052e16", "#14532d", "#021407", "#f0fdf4", "#16a34a", "#fde047", "stadium turf"),
    ("card-arena-mini","tarn",    "#9f1239",  "#fb7185",  "#4c0519", "#881337", "#1a0207", "#fff1f2", "#be123c", "#fb7185", "arena ruby"),
    ("card-park",     "tpark",    "#166534",  "#bef264",  "#052e16", "#14532d", "#021407", "#f0fdf4", "#16a34a", "#bef264", "park leaf"),
    ("card-zoo",      "tzoo",     "#a16207",  "#fde68a",  "#422006", "#713f12", "#1c0c01", "#fffbeb", "#ca8a04", "#fde68a", "zoo savanna"),
    ("card-museum",   "tmus",     "#7c2d12",  "#f5d0a9",  "#1c1917", "#292524", "#0c0a09", "#fef3c7", "#92400e", "#fde68a", "museum sepia"),
    ("card-cliff",    "tclf",     "#57534e",  "#a8a29e",  "#1c1917", "#292524", "#0c0a09", "#fafaf9", "#78716c", "#a8a29e", "cliff stone"),
    ("card-jungle",   "tjng",     "#166534",  "#4ade80",  "#052e16", "#14532d", "#021407", "#f0fdf4", "#15803d", "#4ade80", "jungle moss"),
    ("card-ocean",    "tocn",     "#0c4a6e",  "#38bdf8",  "#082f49", "#0c4a6e", "#031320", "#f0f9ff", "#0284c7", "#38bdf8", "ocean deep"),
    ("card-volcano",  "tvol",     "#b91c1c",  "#fb923c",  "#450a0a", "#7f1d1d", "#1c0606", "#fff7ed", "#dc2626", "#fb923c", "lava red"),
    ("card-glacier",  "tglc",     "#0369a1",  "#bae6fd",  "#0c4a6e", "#0e7490", "#031f30", "#f0f9ff", "#0284c7", "#bae6fd", "ice blue"),
    ("card-temple",   "ttpl",     "#a16207",  "#fcd34d",  "#451a03", "#78350f", "#1f0a01", "#fffbeb", "#ca8a04", "#fcd34d", "temple gold"),
    ("card-savanna",  "tsav",     "#a16207",  "#fde047",  "#422006", "#713f12", "#1c0c01", "#fefce8", "#ca8a04", "#fde047", "savanna sun"),
    ("card-tunnel",   "ttun",     "#1f2937",  "#6b7280",  "#030712", "#111827", "#000000", "#f9fafb", "#374151", "#9ca3af", "tunnel dark"),
    ("card-bridge-cross","tbrx",  "#92400e",  "#fbbf24",  "#1c1917", "#292524", "#0c0a09", "#fffbeb", "#b45309", "#fbbf24", "bridge bronze"),
    ("card-tower-stack","ttws",   "#4338ca",  "#a5b4fc",  "#1e1b4b", "#312e81", "#0a0a23", "#eef2ff", "#4f46e5", "#a5b4fc", "tower indigo"),
    ("card-fountain", "tftn",     "#0891b2",  "#a5f3fc",  "#083344", "#0e7490", "#021014", "#ecfeff", "#0891b2", "#a5f3fc", "fountain mist"),
    ("card-statue",   "tsta",     "#57534e",  "#d6d3d1",  "#292524", "#44403c", "#1c1917", "#fafaf9", "#78716c", "#d6d3d1", "statue marble"),
    ("card-train-track","ttrn",   "#374151",  "#fbbf24",  "#111827", "#1f2937", "#030712", "#fffbeb", "#4b5563", "#fbbf24", "train iron"),
    ("card-lantern-light","tlan", "#d97706",  "#fde68a",  "#1c1917", "#292524", "#0c0a09", "#fffbeb", "#f59e0b", "#fde68a", "lantern glow"),
    ("card-stadium-fans","tsfn",  "#1d4ed8",  "#fbbf24",  "#172554", "#1e3a8a", "#0a1233", "#eff6ff", "#2563eb", "#fbbf24", "fans roar"),
    ("card-pet-shop", "tpet",     "#db2777",  "#fbcfe8",  "#500724", "#9d174d", "#27040f", "#fff1f5", "#ec4899", "#fbcfe8", "pet pink"),
    ("card-toy-store","ttoy",     "#7c3aed",  "#fbbf24",  "#2e1065", "#4c1d95", "#16052e", "#fffbeb", "#9333ea", "#fbbf24", "toy festive"),
    ("card-candy-shop","tcdy",    "#db2777",  "#fde047",  "#500724", "#9d174d", "#27040f", "#fefce8", "#ec4899", "#fde047", "candy pop"),
]

def build_cm_css(prefix, primary, accent, bg1, bg2, bg3, card_bg, btn_primary, hl, desc):
    return f""".{prefix}.cm-wrap, .cm-wrap.{prefix} {{
  background:
    radial-gradient(ellipse at 50% -10%, rgba(255,255,255,0.10), transparent 55%),
    radial-gradient(ellipse at 50% 120%, rgba(0,0,0,0.45), transparent 60%),
    linear-gradient(180deg, {bg1} 0%, {bg2} 60%, {bg3} 100%);
}}
.{prefix} .cm-card.picked,
.{prefix} .cm-card.selected,
.{prefix} .cm-card.hl {{
  border-color: {hl};
  box-shadow:
    0 0 0 2px {hl},
    0 0 24px {hl}88,
    0 1px 0 rgba(255,255,255,0.85) inset,
    0 14px 28px -10px rgba(0,0,0,0.55);
}}
.{prefix} .cm-btn {{
  background: linear-gradient(180deg, {btn_primary} 0%, {primary} 100%);
  box-shadow:
    0 1px 0 rgba(255,255,255,0.25) inset,
    0 -1px 0 rgba(0,0,0,0.18) inset,
    0 8px 18px -8px {primary},
    0 0 0 1px rgba(0,0,0,0.12);
}}
.{prefix} .cm-btn.alt {{
  background: linear-gradient(180deg, {accent} 0%, {primary} 100%);
}}
.{prefix} .cm-btn:focus-visible {{ outline-color: {accent}; }}
.{prefix} .cm-score {{
  background: linear-gradient(180deg, {accent}, {primary});
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: 0 0 22px {accent};
}}
.{prefix} .cm-final {{
  background: linear-gradient(180deg, {primary}, {btn_primary});
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: 0 0 24px {primary};
}}
.{prefix} .cm-target,
.{prefix} .cm-hint {{
  color: {accent};
  font-weight: 700;
  letter-spacing: 0.02em;
}}
.{prefix} .cm-result {{ border-color: {accent}; }}
"""

def build_collector_css(prefix, primary, accent, bg1, bg2, bg3, card_bg, btn_primary, hl, desc):
    return f""".{prefix}.col-wrap, .col-wrap.{prefix} {{
  background: linear-gradient(180deg, {bg1} 0%, {bg2} 60%, {bg3} 100%);
  color: #f1f5f9;
  border-radius: 18px;
  padding: 22px 18px;
  box-shadow: 0 24px 50px -22px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06);
}}
.{prefix} .col-info {{ color: rgba(255,255,255,0.78); font-weight: 600; }}
.{prefix} .col-score {{ color: {accent}; font-weight: 900; font-size: 1.35rem; text-shadow: 0 0 18px {accent}; }}
.{prefix} .col-target {{
  background: {primary};
  border-color: {accent};
  color: #fff;
}}
.{prefix} .col-card {{
  background: linear-gradient(180deg, {card_bg} 0%, #f8f5ee 100%);
  border-color: {primary};
  color: #1a1a1a;
  box-shadow: 0 8px 18px -10px rgba(0,0,0,0.5);
}}
.{prefix} .col-card.red {{ color: #c8102e; }}
.{prefix} .col-card.black {{ color: #1a1a1a; }}
.{prefix} .col-card.hit {{
  border-color: {hl};
  background: linear-gradient(180deg, {card_bg}, {accent});
  box-shadow: 0 0 0 3px {hl};
}}
.{prefix} .col-btn {{
  background: linear-gradient(180deg, {btn_primary} 0%, {primary} 100%);
  color: #fff; font-weight: 700;
  box-shadow: 0 8px 18px -8px {primary};
}}
.{prefix} .col-btn.alt {{
  background: linear-gradient(180deg, {accent} 0%, {primary} 100%);
}}
.{prefix} .col-result {{
  background: {primary};
  border: 1px solid {accent};
  color: #f1f5f9;
}}
.{prefix} .col-done {{
  background: linear-gradient(180deg, #ffffff, #f8fafc);
  color: #1f2937;
}}
.{prefix} .col-final {{ color: {primary}; font-weight: 900; }}
"""

def build_custom_css(prefix, base_pref, primary, accent, bg1, bg2, bg3, card_bg, btn_primary, hl, desc):
    return f""".{prefix}.{base_pref}-wrap, .{base_pref}-wrap.{prefix} {{
  background: linear-gradient(180deg, {bg1} 0%, {bg2} 60%, {bg3} 100%);
  color: #f1f5f9;
  border-radius: 18px;
  padding: 22px 18px;
  box-shadow: 0 24px 50px -22px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06);
}}
.{prefix} .{base_pref}-info {{ color: rgba(255,255,255,0.8); font-weight: 600; }}
.{prefix} .{base_pref}-score {{ color: {accent}; font-weight: 900; text-shadow: 0 0 18px {accent}; }}
.{prefix} .{base_pref}-card {{
  background: linear-gradient(180deg, {card_bg} 0%, #f8f5ee 100%);
  border-color: {primary};
}}
.{prefix} .{base_pref}-btn {{
  background: linear-gradient(180deg, {btn_primary} 0%, {primary} 100%);
  color: #fff;
  box-shadow: 0 8px 18px -8px {primary};
}}
.{prefix} .{base_pref}-btn.alt {{
  background: linear-gradient(180deg, {accent} 0%, {primary} 100%);
}}
.{prefix} .{base_pref}-final {{
  color: {primary};
  font-weight: 900;
}}
.{prefix} .{base_pref}-target,
.{prefix} .{base_pref}-hint {{
  color: {accent};
}}
"""

CUSTOM_PREFIX_GAMES = {
    "card-pyramid-build": "cpb",
    "pip-pinch": "pp",
    "card-collector": "col",
    "face-collector": "col",
    "rank-collector": "col",
    "card-flag-pole": "cfp",
    "card-mountain-climb": "cmc",
    "card-stadium": "cst",
    "card-arena-mini": "cam",
    "card-park": "cpk",
    "card-zoo": "czo",
    "card-museum": "cmu",
}

def update_tsx(game_dir, theme_class):
    path = os.path.join(BASE, game_dir, "Game.tsx")
    with open(path) as f:
        src = f.read()
    if theme_class in src:
        return False
    def repl(m):
        classes = m.group(1)
        if theme_class in classes.split():
            return m.group(0)
        return f'className="{classes} {theme_class}"'
    new_src = re.sub(r'className="([^"]*-wrap[^"]*)"', repl, src)
    if new_src == src:
        return False
    with open(path, "w") as f:
        f.write(new_src)
    return True

def update_css(game_dir, theme_class, css):
    path = os.path.join(BASE, game_dir, "Game.css")
    with open(path) as f:
        existing = f.read()
    marker = f"/* THEME:{theme_class} */"
    if marker in existing:
        return False
    new_content = existing.rstrip() + "\n\n" + marker + "\n" + css
    with open(path, "w") as f:
        f.write(new_content)
    return True

def main():
    changed = 0
    for row in THEMES:
        game = row[0]
        prefix = row[1]
        primary, accent, bg1, bg2, bg3, card_bg, btn_primary, hl, desc = row[2:]
        gdir = os.path.join(BASE, game)
        if not os.path.isdir(gdir):
            print(f"SKIP missing: {game}")
            continue
        if game in CUSTOM_PREFIX_GAMES:
            base_pref = CUSTOM_PREFIX_GAMES[game]
            if base_pref == "col":
                css = build_collector_css(prefix, primary, accent, bg1, bg2, bg3, card_bg, btn_primary, hl, desc)
            else:
                css = build_custom_css(prefix, base_pref, primary, accent, bg1, bg2, bg3, card_bg, btn_primary, hl, desc)
        else:
            css = build_cm_css(prefix, primary, accent, bg1, bg2, bg3, card_bg, btn_primary, hl, desc)
        tsx_changed = update_tsx(game, prefix)
        css_changed = update_css(game, prefix, css)
        if tsx_changed or css_changed:
            changed += 1
            print(f"OK {game} -> {prefix} (tsx:{tsx_changed} css:{css_changed})")
        else:
            print(f"NOOP {game}")
    print(f"\nTotal modified: {changed}")

if __name__ == "__main__":
    main()
