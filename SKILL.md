---
name: competition-report-ppt
description: 生成比赛路演答辩与小组/组会汇报的 PPT。当用户需要制作商业计划书路演、竞赛答辩、课程汇报、组会汇报的幻灯片时使用。
---

# 比赛与小组汇报 PPT 生成

## 工作流（必须按顺序执行）

1. **判断场景**：竞赛路演答辩 → `pitch`；小组/组会/课程汇报 → `report`。无法判断时询问用户，不要猜。
2. **读规则**：加载对应 `references/` 文件。
3. **产出 outline JSON**：严格按页面角色和页数区间组织，写到 `outline.json`。不输出任何 pptx 代码。
4. **渲染**：`python scripts/build_pptx.py outline.json out.pptx`
5. **校验**：
   - `python scripts/lint_deck.py outline.json out.pptx`
   - `python scripts/verify_editable.py out.pptx`
   任一退出码非 0，按报错修 outline 后重跑第 4、5 步，最多重试 3 次。

## 硬性纪律

- 每页只讲一个核心观点，标题必须是结论句
- 每条 bullet ≤ 28 个计数字元（汉字 1 个 = 1，英文词 1 个 = 1）
- 单页 bullet ≤ 6 条；KPI 卡片 ≤ 4 个
- 颜色只能来自主题，禁止在 outline 里指定颜色
- 讲稿写进 `notes`，不塞进页面正文

## 可编辑性硬约束（违反视为交付失败）

产出的 .pptx 必须是 L2 级原生可编辑，绝对禁止：

1. ❌ 用 `add_picture()` 插入截图、PNG、JPG
2. ❌ 用 SVG/HTML 渲染后转图片贴入
3. ❌ 用 matplotlib / PIL / html2canvas 生成图片贴入
4. ❌ 把整页 group 成一个 `MSO_SHAPE_TYPE.GROUP`
5. ❌ 把文字转成路径或图片
6. ❌ 用 `add_ole_object` 嵌入 HTML/Web 对象
7. ❌ 使用任何 "HTML 转 PPTX" 第三方库

必须只用：`add_textbox`、`add_shape`、`add_chart`、`add_table`、`notes_slide`。

## 交付话术

生成后告诉用户：页数、每页角色、哪些数据建议换成真实素材，并提示 pptx 在 PowerPoint/WPS 中双击文字即可编辑、右侧形状可拖动改色。
