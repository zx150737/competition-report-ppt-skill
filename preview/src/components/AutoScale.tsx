import { useEffect, useRef, useState, ReactNode } from 'react';
import { tokens } from '../tokens';

export function AutoScale({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const W = tokens.canvas.widthPx, H = tokens.canvas.heightPx;
  useEffect(() => {
    const el = ref.current!;
    const ro = new ResizeObserver(() => setScale(Math.min(el.clientWidth / W, el.clientHeight / H)));
    ro.observe(el);
    return () => ro.disconnect();
  }, [W, H]);
  return (
    <div ref={ref} style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: W * scale, height: H * scale, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,.12)' }}>
        <div style={{ width: W, height: H, transform: `scale(${scale})`, transformOrigin: 'top left', background: '#fff' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
