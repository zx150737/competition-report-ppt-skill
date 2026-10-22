import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

// monaco-editor 0.5x 的 package exports 不再暴露 esm/vs 深路径，
// 这里把 worker 的深路径别名到真实文件，保证本地打包（不走 CDN）。
const monacoEsm = fileURLToPath(new URL('./node_modules/monaco-editor/esm/vs/', import.meta.url));

export default defineConfig({
  plugins: [react()],
  base: './',
  resolve: {
    alias: [{ find: /^monaco-editor\/esm\/vs\//, replacement: monacoEsm }],
  },
  // monaco 的 worker 深路径与依赖预打包冲突（dev 下会出现 504/404），交给浏览器直接按 ESM 加载。
  optimizeDeps: {
    exclude: ['monaco-editor'],
  },
});
