import PptxGenJS from 'pptxgenjs';
import { tokens, pxToInch, themeOf } from '../tokens';
import type { Outline } from '../types';

const L = tokens.layout, T = tokens.type, FONT = tokens.font;
const W_IN = tokens.canvas.widthPx / tokens.canvas.dpi;
const H_IN = tokens.canvas.heightPx / tokens.canvas.dpi;
const color = (hex: string) => hex.replace('#', '').toUpperCase();
/** px@96dpi → pt，与 tokens 的「layout 用 px、type 用 pt」约定配套 */
const px2pt = (px: number) => (px * 72) / tokens.canvas.dpi;
/** 所有文本框共用：零内边距 + 顶部对齐，与 python-pptx 端一致 */
const TEXT_BASE = { fontFace: FONT, margin: 0, valign: 'top', isTextBox: true } as const;

export async function exportPptx(outline: Outline, fileName = 'deck.pptx') {
  const pptx = new PptxGenJS();
  pptx.defineLayout({ name: 'CUSTOM_16_9', width: W_IN, height: H_IN });
  pptx.layout = 'CUSTOM_16_9';
  const theme = themeOf(outline.scenario);
  const marginX = pxToInch(L.marginX);
  const contentW = W_IN - 2 * marginX;

  outline.slides.forEach((s, idx) => {
    const slide = pptx.addSlide();
    slide.addShape('rect', {
      x: 0, y: 0, w: W_IN, h: pxToInch(L.barHeight),
      fill: { color: color(theme.accent) },
    });

    if (s.role === 'cover') {
      slide.addText(s.title, { ...TEXT_BASE, x: marginX, y: pxToInch(L.coverTitleY), w: contentW, h: pxToInch(L.coverTitleH), fontSize: T.coverTitle, bold: true, color: color(theme.text) });
      if (s.subtitle) slide.addText(s.subtitle, { ...TEXT_BASE, x: marginX, y: pxToInch(L.coverSubY), w: contentW, h: pxToInch(L.coverSubH), fontSize: T.coverSub, color: color(theme.accent) });
      if (s.meta) slide.addText(s.meta, { ...TEXT_BASE, x: marginX, y: pxToInch(L.coverMetaY), w: contentW, h: pxToInch(L.coverMetaH), fontSize: T.coverMeta, color: color(theme.muted) });
    }
    if (s.role === 'section') {
      slide.addText(s.title, { ...TEXT_BASE, x: marginX, y: pxToInch(L.sectionTitleY), w: contentW, h: pxToInch(L.sectionTitleH), fontSize: T.sectionTitle, bold: true, color: color(theme.accent) });
    }
    if (s.role === 'bullets') {
      slide.addText(s.title, { ...TEXT_BASE, x: marginX, y: pxToInch(L.titleY), w: contentW, h: pxToInch(L.titleH), fontSize: T.slideTitle, bold: true, color: color(theme.text) });
      slide.addText(
        (s.bullets ?? []).map((b) => ({ text: `· ${b}`, options: { breakLine: true } })),
        { ...TEXT_BASE, x: marginX, y: pxToInch(L.bodyY), w: contentW, h: pxToInch(L.bodyH),
          fontSize: T.bullet, color: color(theme.text),
          lineSpacingMultiple: L.bulletLineHeight, paraSpaceAfter: px2pt(L.bulletGap) }
      );
    }
    if (s.role === 'kpi') {
      slide.addText(s.title, { ...TEXT_BASE, x: marginX, y: pxToInch(L.titleY), w: contentW, h: pxToInch(L.titleH), fontSize: T.slideTitle, bold: true, color: color(theme.text) });
      const items = (s.items ?? []).slice(0, 4);
      const totalW = tokens.canvas.widthPx - 2 * L.marginX;
      const cardW = items.length ? (totalW - L.cardGap * (items.length - 1)) / items.length : totalW;
      const radius = L.kpiCardRadiusPx / Math.min(cardW, L.cardH);
      items.forEach((it, i) => {
        const x = L.marginX + i * (cardW + L.cardGap);
        // 卡片与文字在同一个原生 autoshape 里，对应 python 端 card.text_frame 的做法
        slide.addText(
          [
            { text: it.value, options: { fontSize: T.kpiValue, bold: true, color: color(theme.accent), align: 'center', fontFace: FONT, breakLine: true } },
            { text: it.label, options: { fontSize: T.kpiLabel, color: color(theme.muted), align: 'center', fontFace: FONT } },
          ],
          {
            shape: 'roundRect', x: pxToInch(x), y: pxToInch(L.cardY), w: pxToInch(cardW), h: pxToInch(L.cardH),
            fill: { color: color(theme.light) },
            rectRadius: radius, align: 'center', valign: 'middle', margin: 0, fontFace: FONT,
          }
        );
      });
    }
    if (s.role === 'closing') {
      slide.addText(s.title, { ...TEXT_BASE, x: marginX, y: pxToInch(L.closingTitleY), w: contentW, h: pxToInch(L.closingTitleH), fontSize: T.slideTitle + 4, bold: true, color: color(theme.text) });
      if (s.subtitle) slide.addText(s.subtitle, { ...TEXT_BASE, x: marginX, y: pxToInch(L.closingSubY), w: contentW, h: pxToInch(L.closingSubH), fontSize: T.coverSub - 2, color: color(theme.muted) });
    }
    slide.addText(String(idx + 1), {
      ...TEXT_BASE, x: W_IN - pxToInch(L.pageNoRight) - pxToInch(L.pageNoW),
      y: H_IN - pxToInch(L.pageNoBottom) - pxToInch(L.pageNoH),
      w: pxToInch(L.pageNoW), h: pxToInch(L.pageNoH),
      fontSize: T.pageNo, color: color(theme.muted), align: 'right',
    });
    if (s.notes) slide.addNotes(s.notes);
  });
  await pptx.writeFile({ fileName });
}
