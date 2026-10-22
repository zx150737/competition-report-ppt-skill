import { useEffect, useMemo, useState } from 'react';
import { Editor } from './components/Editor';
import { SlideRenderer } from './components/SlideRenderer';
import { AutoScale } from './components/AutoScale';
import { exportPptx } from './export/exportPptx';
import type { Outline } from './types';
import sample from './samples/pitch-sample.json';

type ParseResult = { ok: true; value: Outline } | { ok: false; error: string };

function parseOutline(text: string): ParseResult {
  try {
    const o = JSON.parse(text);
    if (!Array.isArray(o.slides)) return { ok: false, error: 'slides 必须是数组' };
    if (!o.scenario) return { ok: false, error: '缺少 scenario 字段' };
    return { ok: true, value: o as Outline };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

export default function App() {
  const [text, setText] = useState(() => localStorage.getItem('outline') ?? JSON.stringify(sample, null, 2));
  const [current, setCurrent] = useState(0);
  const [busy, setBusy] = useState(false);
  const parsed = useMemo(() => parseOutline(text), [text]);
  const outline = parsed.ok ? parsed.value : null;
  const error = parsed.ok ? null : parsed.error;

  useEffect(() => { localStorage.setItem('outline', text); }, [text]);
  useEffect(() => {
    if (!outline) return;
    if (current >= outline.slides.length) setCurrent(Math.max(0, outline.slides.length - 1));
  }, [outline, current]);

  const onExport = async () => {
    if (!outline) return;
    setBusy(true);
    try { await exportPptx(outline, 'out.pptx'); } finally { setBusy(false); }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(360px, 40%) 1fr', height: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      <aside style={{ borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column' }}>
        <header style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <strong>outline.json</strong>
          <button onClick={onExport} disabled={!outline || busy} style={{
            padding: '6px 14px', borderRadius: 6, border: 'none',
            background: outline ? '#1F4E79' : '#ccc', color: '#fff', cursor: outline ? 'pointer' : 'not-allowed', fontSize: 13,
          }}>{busy ? '生成中…' : '导出 .pptx'}</button>
        </header>
        <div style={{ flex: 1, minHeight: 0 }}><Editor value={text} onChange={setText} /></div>
        {error && <div style={{ padding: '10px 16px', background: '#fee2e2', color: '#991b1b', fontSize: 12 }}>{error}</div>}
      </aside>
      <main style={{ display: 'flex', flexDirection: 'column', background: '#f3f4f6' }}>
        <div style={{ flex: 1, minHeight: 0, padding: 24 }}>
          {outline && outline.slides[current] ? (
            <AutoScale><SlideRenderer outline={outline} index={current} /></AutoScale>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9ca3af' }}>
              {error ? '修复 JSON 错误以查看预览' : '暂无幻灯片'}
            </div>
          )}
        </div>
        {outline && (
          <div style={{ height: 128, background: '#fff', borderTop: '1px solid #e5e7eb', display: 'flex', gap: 8, overflowX: 'auto', padding: 12 }}>
            {outline.slides.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)} style={{
                flexShrink: 0, width: 192, height: 108,
                border: i === current ? '2px solid #1F4E79' : '1px solid #e5e7eb',
                background: '#fff', padding: 0, cursor: 'pointer', overflow: 'hidden', position: 'relative',
              }}>
                <div style={{ width: 1280, height: 720, transform: 'scale(0.15)', transformOrigin: 'top left' }}>
                  <SlideRenderer outline={outline} index={i} />
                </div>
                <span style={{ position: 'absolute', bottom: 2, right: 4, fontSize: 10, color: '#666' }}>{i + 1}</span>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
