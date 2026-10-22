#!/usr/bin/env python3
"""把 outline JSON 渲染成可编辑 .pptx。所有视觉值来自 design-tokens.json。"""
import json, os, sys, argparse
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE
from pptx.oxml.ns import qn

HERE = os.path.dirname(os.path.abspath(__file__))
TOKENS = json.load(open(os.path.join(HERE, "..", "design-tokens.json"), encoding="utf-8"))
CANVAS, L, T = TOKENS["canvas"], TOKENS["layout"], TOKENS["type"]
FONT = TOKENS["font"]

def px2in(px): return Inches(px / CANVAS["dpi"])
def px2pt(px): return px * 72.0 / CANVAS["dpi"]
def hex2rgb(h):
    h = h.lstrip("#")
    return RGBColor(int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16))
def theme_of(name): return {k: hex2rgb(v) for k, v in TOKENS["themes"][name].items()}

SLIDE_W = px2in(CANVAS["widthPx"])
SLIDE_H = px2in(CANVAS["heightPx"])
MX = px2in(L["marginX"])
CW = SLIDE_W - 2 * MX

def set_ea_font(run, name=FONT):
    run.font.name = name
    rpr = run._r.get_or_add_rPr()
    ea = rpr.find(qn("a:ea"))
    if ea is None:
        ea = rpr.makeelement(qn("a:ea"), {})
        rpr.append(ea)
    ea.set("typeface", name)

def textbox(slide, x, y, w, h):
    tb = slide.shapes.add_textbox(x, y, w, h)
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    return tf

def style(run, size_pt, color, bold=False):
    run.font.size = Pt(size_pt)
    run.font.bold = bold
    run.font.color.rgb = color
    set_ea_font(run)

def new_slide(prs): return prs.slides.add_slide(prs.slide_layouts[6])

def strip_style(shape):
    """去掉 autoshape 上的 <p:style>（主题 effectRef 会带来阴影），保证与浏览器导出端像素一致。"""
    el = shape._element
    style = el.find(qn("p:style"))
    if style is not None:
        el.remove(style)

def add_bar(slide, theme):
    bar = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, SLIDE_W, px2in(L["barHeight"]))
    bar.fill.solid(); bar.fill.fore_color.rgb = theme["accent"]; bar.line.fill.background()
    strip_style(bar)

def add_title(slide, text, theme):
    tf = textbox(slide, MX, px2in(L["titleY"]), CW, px2in(L["titleH"]))
    r = tf.paragraphs[0].add_run(); r.text = text
    style(r, T["slideTitle"], theme["text"], bold=True)

def add_page_no(slide, idx, theme):
    w = px2in(L["pageNoW"])
    x = SLIDE_W - px2in(L["pageNoRight"]) - w
    y = SLIDE_H - px2in(L["pageNoBottom"]) - px2in(L["pageNoH"])
    tf = textbox(slide, x, y, w, px2in(L["pageNoH"]))
    p = tf.paragraphs[0]; p.alignment = PP_ALIGN.RIGHT
    r = p.add_run(); r.text = str(idx)
    style(r, T["pageNo"], theme["muted"])

def add_notes(slide, notes):
    if notes: slide.notes_slide.notes_text_frame.text = notes

def render_cover(prs, s, theme):
    slide = new_slide(prs); add_bar(slide, theme)
    tf = textbox(slide, MX, px2in(L["coverTitleY"]), CW, px2in(L["coverTitleH"]))
    r = tf.paragraphs[0].add_run(); r.text = s["title"]
    style(r, T["coverTitle"], theme["text"], bold=True)
    if s.get("subtitle"):
        tf2 = textbox(slide, MX, px2in(L["coverSubY"]), CW, px2in(L["coverSubH"]))
        r2 = tf2.paragraphs[0].add_run(); r2.text = s["subtitle"]
        style(r2, T["coverSub"], theme["accent"])
    if s.get("meta"):
        tf3 = textbox(slide, MX, px2in(L["coverMetaY"]), CW, px2in(L["coverMetaH"]))
        r3 = tf3.paragraphs[0].add_run(); r3.text = s["meta"]
        style(r3, T["coverMeta"], theme["muted"])
    add_notes(slide, s.get("notes"))

def render_section(prs, s, theme):
    slide = new_slide(prs); add_bar(slide, theme)
    tf = textbox(slide, MX, px2in(L["sectionTitleY"]), CW, px2in(L["sectionTitleH"]))
    r = tf.paragraphs[0].add_run(); r.text = s["title"]
    style(r, T["sectionTitle"], theme["accent"], bold=True)
    add_notes(slide, s.get("notes"))

def render_bullets(prs, s, theme):
    slide = new_slide(prs); add_bar(slide, theme)
    add_title(slide, s["title"], theme)
    tf = textbox(slide, MX, px2in(L["bodyY"]), CW, px2in(L["bodyH"]))
    for i, b in enumerate(s.get("bullets", [])):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.line_spacing = L["bulletLineHeight"]
        p.space_after = Pt(px2pt(L["bulletGap"]))
        r = p.add_run(); r.text = f"· {b}"
        style(r, T["bullet"], theme["text"])
    add_notes(slide, s.get("notes"))

def render_kpi(prs, s, theme):
    slide = new_slide(prs); add_bar(slide, theme)
    add_title(slide, s["title"], theme)
    items = s.get("items", [])[:4]
    n = max(len(items), 1)
    gap = px2in(L["cardGap"])
    card_w = int((CW - gap * (n - 1)) / n)
    for i, it in enumerate(items):
        x = MX + i * (card_w + gap)
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, px2in(L["cardY"]), card_w, px2in(L["cardH"]))
        card.adjustments[0] = L["kpiCardRadiusPx"] / min(card_w / 9525.0, L["cardH"])
        card.fill.solid(); card.fill.fore_color.rgb = theme["light"]; card.line.fill.background()
        strip_style(card)
        tf = card.text_frame; tf.word_wrap = True; tf.vertical_anchor = MSO_ANCHOR.MIDDLE
        p = tf.paragraphs[0]; p.alignment = PP_ALIGN.CENTER
        r = p.add_run(); r.text = it["value"]; style(r, T["kpiValue"], theme["accent"], bold=True)
        p2 = tf.add_paragraph(); p2.alignment = PP_ALIGN.CENTER
        r2 = p2.add_run(); r2.text = it["label"]; style(r2, T["kpiLabel"], theme["muted"])
    add_notes(slide, s.get("notes"))

def render_closing(prs, s, theme):
    slide = new_slide(prs); add_bar(slide, theme)
    tf = textbox(slide, MX, px2in(L["closingTitleY"]), CW, px2in(L["closingTitleH"]))
    r = tf.paragraphs[0].add_run(); r.text = s["title"]
    style(r, T["slideTitle"] + 4, theme["text"], bold=True)
    if s.get("subtitle"):
        tf2 = textbox(slide, MX, px2in(L["closingSubY"]), CW, px2in(L["closingSubH"]))
        r2 = tf2.paragraphs[0].add_run(); r2.text = s["subtitle"]
        style(r2, T["coverSub"] - 2, theme["muted"])
    add_notes(slide, s.get("notes"))

RENDERERS = {
    "cover": render_cover, "section": render_section, "bullets": render_bullets,
    "kpi": render_kpi, "closing": render_closing,
}

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("outline"); ap.add_argument("output")
    args = ap.parse_args()
    data = json.load(open(args.outline, encoding="utf-8"))
    scenario = data.get("scenario", "pitch")
    if scenario not in TOKENS["themes"]:
        sys.exit(f"未知 scenario: {scenario}")
    theme = theme_of(scenario)
    prs = Presentation()
    prs.slide_width, prs.slide_height = SLIDE_W, SLIDE_H
    for idx, s in enumerate(data["slides"], start=1):
        renderer = RENDERERS.get(s.get("role"))
        if renderer is None:
            sys.exit(f"未知 role: {s.get('role')}（第 {idx} 页）")
        renderer(prs, s, theme)
        add_page_no(prs.slides[-1], idx, theme)
    prs.save(args.output)
    print(f"OK: {len(data['slides'])} 页 → {args.output}")

if __name__ == "__main__":
    main()
