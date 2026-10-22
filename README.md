# 比赛 & 小组汇报 PPT Skill

[![Deploy Preview](https://github.com/zx150737/zx-competition-report-ppt-skill/actions/workflows/deploy.yml/badge.svg)](https://github.com/zx150737/zx-competition-report-ppt-skill/actions/workflows/deploy.yml)
[![Verify Editable](https://github.com/zx150737/zx-competition-report-ppt-skill/actions/workflows/verify-editable.yml/badge.svg)](https://github.com/zx150737/zx-competition-report-ppt-skill/actions/workflows/verify-editable.yml)
[![在线预览](https://img.shields.io/badge/在线预览-GitHub%20Pages-1F4E79)](https://zx150737.github.io/zx-competition-report-ppt-skill/)
[![License: MIT](https://img.shields.io/badge/License-MIT-2E5E4E.svg)](LICENSE)

把竞赛路演和组会汇报的隐性规则，编码成 AI 的硬约束。
输入项目材料 → 输出**可直接在 PowerPoint / WPS 编辑**的 `.pptx`。

- 🖥 在线预览：<https://zx150737.github.io/zx-competition-report-ppt-skill/>（push `main` 自动部署）
- ✅ CI：可编辑性校验 + Pages 部署，两个 workflow 全绿
- 🧩 示例输入：[`examples/sample-pitch-25p.json`](examples/sample-pitch-25p.json)（25 页完整路演）

## 为什么不是通用 PPT 生成器

| | 通用生成器 | 本项目 |
|---|---|---|
| 路演 12 模块结构 | ❌ 模型自由发挥 | ✅ 内置并强制校验（`lint_deck.py`） |
| 6-6-6 排版纪律 | ❌ | ✅ lint 脚本拦截 |
| 产物可编辑（L2 原生） | 常见图片 / HTML 拍平 | ✅ 文本框 + 原生形状，CI 每次验证 |
| 同一份 JSON 三端渲染 | — | ✅ Python / 浏览器导出 / 网页预览共用一套 token |

## 两个子项目

1. **Skill（仓库根目录）**——给 Claude Code / Cursor 用的 Skill。
   `SKILL.md` 把工作流写死：判断场景 → 读规则 → 产出 outline.json → Python 渲染 → lint + 可编辑性校验。
2. **Preview（`preview/`）**——纯前端网站，左边改 JSON、右边实时预览、一键导出 `.pptx`，自动部署到 GitHub Pages。

## 特性

- 🎯 **场景化**：`pitch` 路演 23–27 页 / `report` 组会 8–20 页，各有硬性结构与页数区间
- ✏️ **L2 原生可编辑**：只用文本框、原生形状、原生图表，双击改字、拖动改位置
- 👀 **实时预览**：`preview/` 改 JSON 立即生效（Monaco 本地打包，不依赖 CDN）
- ✅ **自动验证**：`verify_editable.py` 在 CI 中拦截任何图片化 / group 化的尝试
- 🧮 **单一视觉真源**：`design-tokens.json` 是唯一来源，Python 与 TypeScript 都从它读数

## 快速开始

### 用 Skill（Claude Code / Cursor）

把本仓库放进 skills 目录，对话说「帮我做一份挑战杯路演 PPT」。

### 直接跑脚本

```bash
pip install python-pptx
python scripts/build_pptx.py examples/sample-outline.json out.pptx
python scripts/lint_deck.py examples/sample-outline.json out.pptx
python scripts/verify_editable.py out.pptx
```

三条命令退出码都为 0 才算交付合格。25 页完整示例：

```bash
python scripts/build_pptx.py examples/sample-pitch-25p.json full.pptx
python scripts/lint_deck.py examples/sample-pitch-25p.json full.pptx
python scripts/verify_editable.py full.pptx
```

### 预览站

```bash
cd preview
npm install
npm run dev      # http://localhost:5173
npm run build    # tsc 严格模式 + vite build → preview/dist
```

## 目录结构

```text
zx-competition-report-ppt-skill/
├── design-tokens.json          # 唯一视觉真源（canvas / themes / layout / type）
├── SKILL.md                    # Skill 入口：工作流 + 硬性纪律 + 可编辑性约束
├── references/
│   ├── pitch-deck-rules.md     # 路演结构（20 模块 + 页数区间）
│   └── group-report-rules.md   # 组会汇报规则
├── scripts/
│   ├── build_pptx.py           # outline.json → 原生可编辑 .pptx
│   ├── lint_deck.py            # 场景纪律校验（页数 / bullet / KPI / 结构）
│   └── verify_editable.py      # L2 可编辑性校验（禁止图片 / group）
├── examples/
│   ├── sample-outline.json     # 5 页最小示例
│   └── sample-pitch-25p.json   # 25 页完整路演 fixture（CI 用）
├── .github/workflows/
│   ├── deploy.yml              # main 分支 → GitHub Pages
│   └── verify-editable.yml     # 每次 push/PR 验证可编辑性
└── preview/                    # 纯前端预览 + 导出站（Vite + React）
    └── src/
        ├── tokens.ts           # 从根目录 design-tokens.json 读数
        ├── components/         # AutoScale / Slides / SlideRenderer / Editor
        └── export/exportPptx.ts# pptxgenjs 导出（与 Python 端像素级对齐）
```

## 单一视觉真源与坐标系统

- `design-tokens.json` 在仓库**根目录**，Python（`build_pptx.py`）和 TypeScript（`tokens.ts`）都从它读数，禁止任何一端硬编码视觉数值。
- 画布：1280×720 px @ 96 DPI ≡ 13.333×7.5 inch。
- 单位约定：`layout.*` 用 px@1280×720；`type.*` 用 pt。
- 换算一律按 token 推导，两端同一公式：
  - px → inch：`px / canvas.dpi`
  - px → pt：`px * 72 / canvas.dpi`
  - 预览 CSS：`px = pt × 4/3`（`ptToPx`）
- 覆盖页 / 章节页 / 结尾页 / 页码等布局常量也在 `layout` 里（`coverTitleY`、`sectionTitleY`、`pageNoW` …），Python、浏览器导出、预览三端共用，不再各写各的魔法数字。

## 一致性说明（实测）

验收方式：同一份 [`examples/sample-pitch-25p.json`](examples/sample-pitch-25p.json)，
用 `python scripts/build_pptx.py` 与浏览器端 `exportPptx()`（pptxgenjs）各生成一份，
再用 LibreOffice 渲染成 144 DPI 图片逐像素比对，并用 python-pptx 解析几何 / 样式比对。

| 检查项 | 结果 |
|---|---|
| 画布尺寸 | 1280.07×720.07 px，两端一致 |
| 关键元素位置与尺寸（顶栏 / 标题 / 正文 / KPI 卡片 / 页码） | 25 页全部 **Δ = 0.00 px** |
| 每页 shape 数量 | 每页一致（cover 5、section 3、bullets 4、kpi 7、closing 4） |
| 文字 run（文案 / 字号 / 粗体 / 颜色 / 对齐） | 133 个 run 全部一致 |
| 正文行距 / 段后距 | 1.5 倍行距 / 18pt 段后，两端一致 |
| 渲染图逐像素 | cover / bullets / closing 完全一致（0 个差异像素）；KPI 页平均差 0.028/255（圆角抗锯齿），无 >30 的差异像素 |

允许的差异：字体 hinting、圆角抗锯齿等亚像素级差异；不允许错位 > 5px——上表最差为 0.00px。

为实现这个结果，两端做了这些对齐：

- 文本框统一 `margin = 0`、`valign = top`（pptxgenjs 默认垂直居中，会导致 20px 级的整体下移）。
- KPI 卡片文字与卡片放在**同一个** autoshape 里（Python `card.text_frame` / TS `addText({ shape: 'roundRect' })`），两端都是垂直居中。
- 形状不描边、不带主题阴影：Python 端去掉 `<p:style>`（`effectRef` 会带阴影），TS 端不传 `line`。
- 正文行距在 Python 端补上 `line_spacing = 1.5`，与 TS 的 `lineSpacingMultiple` 对齐。

## 可编辑性说明

产物是 **L2 级原生可编辑**：文字、形状、位置、颜色、字号、字体全部可改。
`verify_editable.py` 在 CI 里强制：`pictures = 0`、`groups = 0`、每页都有真实文本 run。

| 允许 | 禁止 |
|---|---|
| `add_textbox` / `add_shape` / `add_chart` / `add_table` / `notes_slide` | 图片、SVG/HTML 拍平、matplotlib/PIL/html2canvas 生成的图 |
| 原生形状承载文字 | group 整页、文字转路径、OLE 对象、HTML→PPTX 第三方库 |

不支持：字体嵌入（接收方需安装 Microsoft YaHei，否则回退系统字体）。

## CI

- `verify-editable.yml`：每次 push / PR，渲染 25 页 fixture，跑 lint 和可编辑性校验。
- `deploy.yml`：push 到 `main` 时构建 `preview/` 并发布到 GitHub Pages。

## License

MIT
