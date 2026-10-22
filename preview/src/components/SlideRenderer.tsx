import type { Outline } from '../types';
import { themeOf } from '../tokens';
import { CoverSlide, SectionSlide, BulletsSlide, KpiSlide, ClosingSlide } from './Slides';

const MAP = { cover: CoverSlide, section: SectionSlide, bullets: BulletsSlide, kpi: KpiSlide, closing: ClosingSlide } as const;

export function SlideRenderer({ outline, index }: { outline: Outline; index: number }) {
  const s = outline.slides[index];
  if (!s) return null;
  const theme = themeOf(outline.scenario);
  const Cmp = MAP[s.role];
  if (!Cmp) return <div style={{ padding: 80, color: '#c00' }}>未知 role：{s.role}</div>;
  return <Cmp s={s} theme={theme} n={index + 1} />;
}
