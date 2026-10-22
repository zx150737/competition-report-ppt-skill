import raw from '../../design-tokens.json';
export const tokens = raw;
export const ptToPx = (pt: number) => (pt * 4) / 3;
export const pxToInch = (px: number) => px / 96;
export type ThemeName = 'pitch' | 'report';
export const themeOf = (name: ThemeName) => tokens.themes[name];
