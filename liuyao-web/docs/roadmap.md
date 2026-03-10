# 六爻网站开发路线图（2026-03-10 校准版）

## 1. 开发总原则
- 先做主链路：首页 → 提问 → 摇卦 → 排盘 → AI 分析 → 结果 → 注册保存
- 排盘与分析严格分层
- 有卡点立刻反馈，不空转

## 2. 当前方向锚点
- 邮箱注册 / 登录（已实现 magic link）
- 游客先体验，后注册保存
- 游客 1 次，注册后更多
- 高级模式第一版不做
- 中文优先，预埋 i18n

## 3. 里程碑

### Milestone 0：项目底座 ✅
Next.js + TypeScript + Tailwind + i18n 预埋 + 路由骨架 + Supabase client

### Milestone 1：主流程前端闭环 ✅
首页、起卦问题页、摇卦页、生成页、结果页、登录页、历史页

### Milestone 2：排盘引擎 ✅
完整京房纳甲体系（主卦/变卦/动爻/世应/纳甲/六亲/六神/旬空）

### Milestone 3：AI 分析链路 ✅
- Analysis input/output schema ✅
- Analysis service（OpenAI 兼容 API + 确定性 fallback）✅
- System prompt + user prompt 构建 ✅
- `/api/analysis` route ✅
- Processing 页面调用分析 API 并等待 ✅
- 结构化输出解析 ✅
- 结果持久化到 repository ✅
- 错误处理与降级 ✅

### Milestone 4：账户 / 保存 / 历史 / 分享 ✅
- Supabase magic link 登录 ✅
- 游客 1 次体验机制 ✅
- 结果保存 ✅
- 历史记录页 ✅
- 分享链接 ✅

### Milestone 5：体验补完与打磨 ✅
- Tooltip 术语解释 ✅
- 分享图片生成（html2canvas-pro）✅
- 分类示例问题 + FAQ ✅
- 摇卦页动画 / 进度 / 反馈优化 ✅
- 结果页视觉打磨 ✅

### Milestone 6：埋点 + 上线准备 ⚠️ 部分完成
- 轻量级前端埋点（console + localStorage）✅
- 漏斗报表 ❌
- 错误监控 ❌
- 上线 checklist ❌

## 4. 优先级规则

### P0：必须做（MVP）— 全部完成 ✅
- 工程骨架 ✅
- 排盘引擎 ✅
- 前端全页面 ✅
- 认证与保存 ✅
- AI 分析服务 ✅

### P1：强烈建议首版做 — 全部完成 ✅
- Tooltip 术语解释 ✅
- 分享图片 ✅
- 示例问题优化 ✅
- 视觉打磨 ✅
- 埋点系统 ✅

### P2：后续优化（未开始）
- 高保真品牌打磨
- 更多分享策略
- 分析质量回溯
- 用户反馈机制
- 多语言上线
- 漏斗报表
- 错误监控

## 5. 核心数据与系统结构

### 确定性排盘层 ✅
输入：6 次摇卦结果（old_yin / young_yin / young_yang / old_yang）
输出：ChartData JSON

### 分析层 ✅
输入：ChartData JSON + 用户问题 + 分类
输出：summary / plainAnalysis / professionalAnalysis（结构化 JSON）
实现：OpenAI 兼容 API（LLM_API_KEY / LLM_BASE_URL / LLM_MODEL）+ 确定性 fallback

### 展示层 ✅
前端结果页完整渲染，支持真实 AI 分析数据
