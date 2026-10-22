export type Role = 'cover' | 'section' | 'bullets' | 'kpi' | 'closing';
export interface Slide {
  role: Role; title: string; subtitle?: string; meta?: string;
  bullets?: string[]; items?: { value: string; label: string }[]; notes?: string;
}
export interface Outline { scenario: 'pitch' | 'report'; slides: Slide[]; }
