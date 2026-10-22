/**
 * Monaco 本地打包配置。
 * @monaco-editor/react 默认从 jsDelivr CDN 拉 monaco；离线 / CDN 被墙时编辑器会一直 Loading。
 * 这里把 monaco 与 worker 一起交给 Vite 打包，保证 GitHub Pages 上（以及本地断网时）可用。
 * worker 深路径经 vite.config.ts 的 alias 映射到 monaco-editor/esm/vs 下的真实文件。
 */
import * as monaco from 'monaco-editor';
import { loader } from '@monaco-editor/react';
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import JsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';

// 用 any 赋值，避免与 monaco 自身声明的 Window.MonacoEnvironment 类型合并冲突。
(window as any).MonacoEnvironment = {
  getWorker(_workerId: string, label: string) {
    if (label === 'json') return new JsonWorker();
    return new EditorWorker();
  },
};

// 少数环境里 @monaco-editor/react 的 monaco-editor 类型版本与本包不一致，这里只做运行时注入。
(loader as any).config({ monaco });
