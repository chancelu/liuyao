# 六爻网站 MVP 里程碑（2026-03-10 校准版）

> 上次校准时间：2026-03-10
> 校准方法：逐文件比对代码实现 vs 文档标注

## 里程碑总览

| 里程碑 | 状态 | 说明 |
|--------|------|------|
| M0 项目底座 | ✅ 完成 | Next.js / Tailwind / Supabase / i18n |
| M1 前端页面骨架 | ✅ 完成 | 全部页面有真实交互 |
| M2 排盘引擎 | ✅ 完成 | 京房纳甲完整实现 |
| **M3 AI 分析链路** | **🔴 未开始** | **当前最高优先级** |
| M4 账户/保存/历史/分享 | ⚠️ 基础版完成 | 分享图片未做 |
| M5 体验补完与打磨 | ⏳ 等待 M3 | 需要真实数据才有意义 |
| M6 埋点/上线准备 | ⏳ 等待 | — |

---

## 各里程碑详情

### Milestone 0：项目底座 ✅
- [x] Next.js + TypeScript 项目初始化
- [x] Tailwind CSS
- [x] 路由骨架（app router）
- [x] Supabase 项目建立 + env 配置
- [x] i18n 预埋（next-intl, zh-CN locale）
- [x] Vercel 部署配置

### Milestone 1：主流程前端页面 ✅
- [x] 首页（Hero / 三步说明 / 示例问题 / CTA）
- [x] 起卦问题页（问题输入 / 分类 / 时间 / 背景）
- [x] 摇卦页（6 次铜钱交互 / 进度 / 结果反馈）
- [x] 排盘生成过渡页（步骤动画 / 自动跳转）
- [x] 结果页（排盘总览 / 结论 / 分析 / 操作按钮）
- [x] 登录页（magic link 表单）
- [x] 历史记录页（卦例列表 / 空状态）
- [x] 分享页（公开结果展示）
- [x] 全局导航 + 页脚（site-shell）

### Milestone 2：排盘引擎 ✅
- [x] 6 次摇卦结果结构化（old_yin / young_yin / young_yang / old_yang）
- [x] 主卦 / 变卦生成（64 卦查表）
- [x] 动爻识别
- [x] 世应计算（京房八宫）
- [x] 纳甲（地支配卦）
- [x] 六亲（五行生克）
- [x] 六神（日干推算）
- [x] 月建 / 日辰 / 旬空（lunar-javascript）
- [x] 标准 ChartData JSON 输出
- [x] 单元测试
- 代码位置：`src/lib/liuyao/chart.ts`

### Milestone 3：AI 分析链路 🔴 未开始
- [ ] analysis input schema（ChartData + question + category → prompt）
- [ ] analysis output schema（conclusion / plain_analysis / pro_analysis）
- [ ] analysis service API route（`/api/analysis`）
- [ ] 大模型调用（Claude API）
- [ ] 替换 `buildMockResult()` 为真实分析结果
- [ ] 流式输出或进度反馈
- [ ] 错误处理与降级方案
- [ ] 分析结果持久化

**当前结果页使用的是 `buildMockResult()` 模板文案，不是真实 AI 分析。**

### Milestone 4：账户 / 保存 / 历史 / 分享 ⚠️ 基础版完成
已完成：
- [x] Supabase magic link 登录
- [x] 游客 1 次体验机制（LocalStorage session）
- [x] 结果保存到 Supabase
- [x] 历史记录页展示
- [x] 分享链接生成 + 公开分享页
- [x] Repository 模式 + ResilientRepository fallback

未完成：
- [ ] 分享图片生成（移至 M5）

### Milestone 5：体验补完与打磨 ⏳
**前置条件：M3 完成**
- [ ] Tooltip 术语解释
- [ ] 分享图片生成
- [ ] 示例问题引导优化
- [ ] 视觉/动效最终一轮打磨
- [ ] 结果页专业分析区优化（需真实数据）

### Milestone 6：埋点 / 报表 / 上线准备 ⏳
- [ ] 埋点系统
- [ ] 漏斗报表
- [ ] 错误监控
- [ ] 上线 checklist
- [ ] 预发布验收

---

## 技术栈
- 前端：Next.js 14 (App Router) + React + Tailwind CSS
- 数据与鉴权：Supabase（Auth + Postgres + Storage）
- 排盘引擎：纯 TypeScript 确定性计算
- 日历：lunar-javascript
- 部署：Vercel
- AI 分析：待接入（Claude API）
- i18n：next-intl（当前只中文）

## 历史校准记录
| 日期 | 变更 |
|------|------|
| 2026-03-10 | 初次代码-文档校准。M3 状态从"待做"修正为"未开始"，M4 从 ✅ 修正为"基础版完成"，M5 从"当前阶段"修正为"等待 M3"。确认视觉打磨不应在 M3 前进行。 |
