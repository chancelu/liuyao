# 爻镜 / liuyao-web

六爻在线占卦网站 MVP。

## 当前阶段

**MVP 功能已全部完成，进入上线准备阶段。**

已完成：
- Next.js + TypeScript + Tailwind 初始化
- 中文优先的 i18n 预埋（next-intl）
- 首页 / 起卦页 / 摇卦页 / 生成页 / 结果页 / 历史页 / 分享页
- 主流程前端交互：提问 → 摇卦 → 生成 → 结果
- 完整京房纳甲排盘引擎 (`src/lib/liuyao/chart.ts`)
- AI 分析服务 (`src/lib/analysis/`) — OpenAI 兼容 API + 确定性 fallback
- Processing 页面调用 AI 分析并等待完成
- 结果持久化到 repository 层（Supabase / Mock 双模式）
- Supabase Auth (magic link) 登录
- 游客 1 次体验 + 注册后保存
- 分享链接 + 分享图片生成（html2canvas-pro）
- 术语 Tooltip 解释
- 分类示例问题 + FAQ
- 摇卦页 / 结果页视觉打磨
- 轻量级前端埋点系统（console + localStorage）

部署：
- Vercel 已部署
- Supabase 已接入

## 本地运行

```bash
npm install
npm run dev
```

## 环境变量

复制 `.env.example` 为 `.env.local`，按需填写：

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_ENABLE_SUPABASE_AUTH=true
NEXT_PUBLIC_SITE_URL=

# AI 分析服务（OpenAI 兼容接口，可选，不填则使用确定性 fallback）
LLM_API_KEY=
LLM_BASE_URL=https://api.openai.com
LLM_MODEL=gpt-4o
```

## 架构概览

```
确定性排盘层（纯 TS）
    ↓ ChartData JSON
AI 分析层（OpenAI 兼容 API / fallback）
    ↓ AnalysisOutput JSON
前端展示层（React）
```

## 下一步

- 端到端真实流程验证
- 分析质量调优（prompt 迭代）
- P2 优化项（品牌打磨、用户反馈、多语言等）
