import { tokens, ptToPx } from '../tokens';
import type { Slide } from '../types';

const L = tokens.layout, T = tokens.type, W = tokens.canvas.widthPx, H = tokens.canvas.heightPx, FONT = tokens.font;

function TopBar({ accent }: { accent: string }) {
  return <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: L.barHeight, background: accent }} />;
}
function PageNo({ n, muted }: { n: number; muted: string }) {
  return (
    <div style={{
      position: 'absolute', left: W - L.pageNoRight - L.pageNoW, top: H - L.pageNoBottom - L.pageNoH,
      width: L.pageNoW, height: L.pageNoH, textAlign: 'right',
      fontSize: ptToPx(T.pageNo), color: muted, fontFamily: FONT,
    }}>{n}</div>
  );
}

export function CoverSlide({ s, theme, n }: { s: Slide; theme: any; n: number }) {
  return (
    <>
      <TopBar accent={theme.accent} />
      <div style={{ position: 'absolute', left: L.marginX, top: L.coverTitleY, width: W - 2 * L.marginX, fontSize: ptToPx(T.coverTitle), fontWeight: 700, color: theme.text, fontFamily: FONT }}>{s.title}</div>
      {s.subtitle && <div style={{ position: 'absolute', left: L.marginX, top: L.coverSubY, width: W - 2 * L.marginX, fontSize: ptToPx(T.coverSub), color: theme.accent, fontFamily: FONT }}>{s.subtitle}</div>}
      {s.meta && <div style={{ position: 'absolute', left: L.marginX, top: L.coverMetaY, width: W - 2 * L.marginX, fontSize: ptToPx(T.coverMeta), color: theme.muted, fontFamily: FONT }}>{s.meta}</div>}
      <PageNo n={n} muted={theme.muted} />
    </>
  );
}

export function SectionSlide({ s, theme, n }: { s: Slide; theme: any; n: number }) {
  return (
    <>
      <TopBar accent={theme.accent} />
      <div style={{ position: 'absolute', left: L.marginX, top: L.sectionTitleY, fontSize: ptToPx(T.sectionTitle), fontWeight: 700, color: theme.accent, fontFamily: FONT }}>{s.title}</div>
      <PageNo n={n} muted={theme.muted} />
    </>
  );
}

export function BulletsSlide({ s, theme, n }: { s: Slide; theme: any; n: number }) {
  return (
    <>
      <TopBar accent={theme.accent} />
      <div style={{ position: 'absolute', left: L.marginX, top: L.titleY, width: W - 2 * L.marginX, fontSize: ptToPx(T.slideTitle), fontWeight: 700, color: theme.text, fontFamily: FONT }}>{s.title}</div>
      <div style={{ position: 'absolute', left: L.marginX, top: L.bodyY, width: W - 2 * L.marginX, fontFamily: FONT }}>
        {(s.bullets ?? []).map((b, i) => (
          <div key={i} style={{ fontSize: ptToPx(T.bullet), color: theme.text, marginBottom: L.bulletGap, lineHeight: L.bulletLineHeight }}>· {b}</div>
        ))}
      </div>
      <PageNo n={n} muted={theme.muted} />
    </>
  );
}

export function KpiSlide({ s, theme, n }: { s: Slide; theme: any; n: number }) {
  const items = (s.items ?? []).slice(0, 4);
  const gap = L.cardGap;
  const totalW = W - 2 * L.marginX;
  const cardW = items.length ? (totalW - gap * (items.length - 1)) / items.length : totalW;
  return (
    <>
      <TopBar accent={theme.accent} />
      <div style={{ position: 'absolute', left: L.marginX, top: L.titleY, width: totalW, fontSize: ptToPx(T.slideTitle), fontWeight: 700, color: theme.text, fontFamily: FONT }}>{s.title}</div>
      {items.map((it, i) => (
        <div key={i} style={{
          position: 'absolute', left: L.marginX + i * (cardW + gap), top: L.cardY,
          width: cardW, height: L.cardH, background: theme.light, borderRadius: L.kpiCardRadiusPx,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: FONT,
        }}>
          <div style={{ fontSize: ptToPx(T.kpiValue), fontWeight: 700, color: theme.accent }}>{it.value}</div>
          <div style={{ marginTop: 12, fontSize: ptToPx(T.kpiLabel), color: theme.muted }}>{it.label}</div>
        </div>
      ))}
      <PageNo n={n} muted={theme.muted} />
    </>
  );
}

export function ClosingSlide({ s, theme, n }: { s: Slide; theme: any; n: number }) {
  return (
    <>
      <TopBar accent={theme.accent} />
      <div style={{ position: 'absolute', left: L.marginX, top: L.closingTitleY, width: W - 2 * L.marginX, fontSize: ptToPx(T.slideTitle + 4), fontWeight: 700, color: theme.text, fontFamily: FONT }}>{s.title}</div>
      {s.subtitle && <div style={{ position: 'absolute', left: L.marginX, top: L.closingSubY, width: W - 2 * L.marginX, fontSize: ptToPx(T.coverSub - 2), color: theme.muted, fontFamily: FONT }}>{s.subtitle}</div>}
      <PageNo n={n} muted={theme.muted} />
    </>
  );
}
