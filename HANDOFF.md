# HANDOFF · 施工文档

> 本文件记录这个仓库**为什么这样建**、**怎么验收**、**上线流程**与**排障表**。
> 详细的原始施工稿（含每个文件全文）已按本文档落到仓库里，以实际文件为准。

---

## Part 1 · 项目总览

开源项目：比赛路演 / 小组汇报 PPT Skill，包含两个子项目。

1. **Skill 子项目（根目录）**：给 Claude Code / Cursor 用的 Skill。输入材料 → 产出 `outline.json` → Python 渲染成 `.pptx` + lint + 可编辑性验证。
2. **Preview 子项目（`preview/`）**：纯前端网站，左改 JSON 右实时预览、一键导出 `.pptx`，部署到 GitHub Pages。

### 三个不可违反的设计约束

1. **单一视觉真源**：`design-tokens.json` 位于仓库根目录，Python 和 TypeScript 都从它读数，禁止任何一端硬编码视觉数值。
2. **坐标系统**：1280×720 px @ 96 DPI ≡ 13.333×7.5 inch；字号统一 pt（预览 CSS 里 `px = pt × 4/3`）。
3. **L2 级原生可编辑**：只用文本框、原生形状、原生图表；禁止任何形式的图片、SVG 拍平、group、OLE 对象（由 `scripts/verify_editable.py` 在 CI 中强制）。

### 两种场景

| scenario | 用途 | 页数 |
|---|---|---|
| `pitch` | 竞赛路演答辩 | 23–27 |
| `report` | 小组 / 组会汇报 | 8–20 |

---

## Part 2 · 目录结构

```text
competition-report-ppt-skill/
├── design-tokens.json
├── SKILL.md
├── README.md
├── LICENSE                      # MIT
├── HANDOFF.md                   # 本文件
├── references/
│   ├── pitch-deck-rules.md
│   └── group-report-rules.md
├── scripts/
│   ├── build_pptx.py
│   ├── lint_deck.py
│   └── verify_editable.py
├── examples/
│   ├── sample-outline.json
│   └── sample-pitch-25p.json    # 25 页完整示例，lint/verify 的固定 fixture
├── .github/workflows/
│   ├── deploy.yml               # GitHub Pages 自动部署 preview/
│   └── verify-editable.yml      # PR 时验证可编辑性
└── preview/
    ├── package.json
    ├── package-lock.json
    ├── vite.config.ts
    ├── tsconfig.json
    ├── index.html
    ├── .gitignore
    └── src/
        ├── main.tsx
        ├── monaco.ts            # Monaco 本地打包（不走 CDN）
        ├── vite-env.d.ts
        ├── App.tsx
        ├── types.ts
        ├── tokens.ts
        ├── components/{AutoScale,Slides,SlideRenderer,Editor}.tsx
        ├── export/exportPptx.ts
        └── samples/pitch-sample.json
```

---

## Part 3 · 文件职责与关键约定

### 3.1 `design-tokens.json`

- `canvas`：`widthPx/heightPx/dpi`。
- `themes.pitch` / `themes.report`：`accent / text / muted / light` 四个颜色，outline 里**不允许**指定颜色。
- `layout`：px@1280×720。除基础栅格外，还包含 `coverTitleY`、`coverSubY`、`coverMetaY`、`sectionTitleY`、`closingTitleY`、`closingSubY`、`pageNoW/pageNoH`、`bulletLineHeight`、`kpiCardRadiusPx` 等页面级常量，供三端共用。
- `type`：pt 字号。

### 3.2 `SKILL.md`

工作流五步（判断场景 → 读规则 → 产出 outline → 渲染 → 校验，失败最多重试 3 次），以及硬性纪律（结论式标题、bullet ≤ 28 计数字元、单页 ≤ 6 条、KPI ≤ 4 个）和可编辑性红线。

### 3.3 `references/*.md`

`pitch-deck-rules.md`：20 个模块的固定顺序（cover → 痛点 → 方案 → 进展与验证 → 商业 → 落地 → 团队 → closing），其余页作为模块内补充页均匀分配。
`group-report-rules.md`：8–20 页，单页单主题、留白优先、结论页必须给「下一步」。

### 3.4 `scripts/build_pptx.py`

- 所有视觉值来自 `design-tokens.json`；`px2in` / `px2pt` 全部由 `canvas.dpi` 推导。
- 只用 `add_textbox` / `add_shape` / `notes_slide`；`set_ea_font` 同时设置 `a:ea`，避免中文回退宋体。
- 形状去掉 `<p:style>`（主题 `effectRef` 会带阴影），文本框 `margin=0`。
- 正文 `line_spacing=1.5`、段后 18pt（由 `bulletGap` 换算）。

### 3.5 `scripts/lint_deck.py`

场景页数区间、bullet 条数与字数、KPI 数量、必须 cover 开头、结尾不能是 section、pptx 页数与 outline 对齐。

### 3.6 `scripts/verify_editable.py`

统计 `textboxes / autoshapes / text_runs / pictures / groups / charts / tables`；
图片、group、无文字页、无文本框都会让退出码非 0。

### 3.7 `examples/sample-pitch-25p.json`

25 页：20 个模块页 + 5 个补充页（付费意愿、三步演示、里程碑、定价对比、风险应对），全部通过 `lint_deck.py`（0 errors / 0 warnings）。

### 3.8 `preview/`

- `tokens.ts`：`import raw from '../../design-tokens.json'`，`ptToPx` / `pxToInch`。
- `Slides.tsx`：五类页面组件，全部按 token 绝对定位；KPI 卡片用 flex 居中（对应 pptx 的垂直居中）。
- `exportPptx.ts`：pptxgenjs 导出，`valign: 'top'` + `margin: 0` + KPI 文字与卡片同一 autoshape + 形状不描边，保证与 Python 端像素级一致（见 README「一致性说明」）。
- `monaco.ts`：把 monaco-editor 和 worker 打进 bundle，不依赖 jsDelivr CDN；worker 深路径由 `vite.config.ts` 的 alias 解析。
- `App.tsx`：localStorage 持久化、JSON 错误红条、缩略图条、导出按钮。

---

## Part 4 · GitHub 上线流程

```bash
cd competition-report-ppt-skill
git init -b main
git add .
git commit -m "feat: initial release — skill + preview + editable CI"

gh repo create competition-report-ppt-skill \
  --public \
  --description "比赛路演 / 小组汇报 PPT Skill：场景化生成可编辑 .pptx，带实时预览网站" \
  --source=. --remote=origin

git push -u origin main

# 开启 GitHub Pages（workflow 方式）
gh api -X POST repos/{owner}/competition-report-ppt-skill/pages -f build_type=workflow
gh api -X PATCH repos/{owner}/competition-report-ppt-skill \
  -f description="..." \
  -f "topics[]=ppt" -f "topics[]=presentation" -f "topics[]=claude-skill" \
  -f "topics[]=ai" -f "topics[]=python-pptx" -f "topics[]=pptxgenjs"
```

手动兜底（Pages API 失败时）：仓库 Settings → Pages → Source 选 **GitHub Actions**。
页面地址：`https://<owner>.github.io/competition-report-ppt-skill/`。

---

## Part 5 · 分阶段执行（已全部完成）

| 阶段 | 内容 | 验收 |
|---|---|---|
| 1 | Skill 子项目全部文件 | 5 条命令退出码 0，`pictures=0` |
| 2 | preview 脚手架 + 预览渲染 | `npm run build` 通过 tsc 严格模式 |
| 3 | 浏览器端导出 pptx | 导出文件可编辑、通过 `verify_editable.py` |
| 4 | Monaco 编辑器 + 缩略图 + 交互 | 改 JSON 实时刷新、错误条、localStorage |
| 5 | README + CI + 一致性对比 | 一致性误差 0.00px（见 README） |
| 6 | 推上 GitHub + Pages | 两个 workflow 变绿，Pages 可访问 |

阶段 1 验收命令（全部必须 exit 0）：

```bash
pip install python-pptx
python scripts/build_pptx.py examples/sample-outline.json /tmp/out.pptx
python scripts/verify_editable.py /tmp/out.pptx
python scripts/build_pptx.py examples/sample-pitch-25p.json /tmp/full.pptx
python scripts/lint_deck.py examples/sample-pitch-25p.json /tmp/full.pptx
python scripts/verify_editable.py /tmp/full.pptx
```

---

## Part 6 · 最终验收清单

- [x] `verify-editable.yml` 首次 push 后变绿
- [x] `deploy.yml` 变绿，Pages 地址可访问
- [x] 打开 Pages 地址能看到预览站（默认 5 页 pitch 示例）
- [x] 改 JSON → 预览刷新 → 导出 pptx 能下载
- [x] `verify_editable.py` 输出 PASS，`pictures=0`、`groups=0`
- [x] 25 页 fixture 通过 lint（0 errors / 0 warnings）
- [x] README 首屏说明是什么、给谁用、与通用生成器的区别
- [x] README 有在线预览链接、快速开始、可编辑性说明
- [x] License: MIT
- [x] Topics: ppt / presentation / claude-skill / ai / python-pptx / pptxgenjs

---

## Part 7 · 排障表

| 症状 | 原因 | 修法 |
|---|---|---|
| `resolveJsonModule` 报错 | tsconfig 的 include 没加 `../design-tokens.json` | 按 `preview/tsconfig.json` 补齐 |
| pptxgenjs 颜色不对 | 传了带 `#` 的 hex | `hex.replace('#', '')` |
| PowerPoint 里中文变宋体 | Python 只设了 `font.name`，没设 `a:ea` | 用 `build_pptx.py` 里的 `set_ea_font` |
| `verify_editable.py` FAIL，`pictures>0` | 渲染时用了 `add_picture` | 改成 `add_textbox` / `add_shape` |
| 浏览器导出后文字整体偏下 | pptxgenjs 默认 `valign: middle` | 所有 addText 传 `valign: 'top'` |
| 浏览器导出后形状带阴影 / 细边框 | 形状带了主题 `effectRef` 或 1pt 默认描边 | 不传 `line`；Python 端去掉 `<p:style>` |
| 缩略图拉伸 | scale 两方向不一致 | 192/1280 和 108/720 都是 0.15 |
| Pages 404 | `vite.config.ts` 的 `base` 不是 `./` | 改成 `./` 重新 build |
| 预览站左侧编辑器一直 Loading | Monaco 默认从 jsDelivr CDN 加载，被墙 / 离线 | 已改为本地打包（`preview/src/monaco.ts`） |
| `gh repo create` 报权限错 | 未登录或 token 无 repo 权限 | `gh auth login` 重新登录 |
