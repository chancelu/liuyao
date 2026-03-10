# 爻镜 / liuyao-web

六爻在线占卦网站 MVP。

## 当前阶段

**当前唯一最高优先级：P0-09 / M3 — AI 分析链路**

已完成：
- Next.js + TypeScript + Tailwind 初始化
- 中文优先的 i18n 预埋
- 首页 / 起卦页 / 摇卦页 / 生成页 / 结果页 / 历史页 / 分享页骨架
- 主流程前端交互：提问 → 摇卦 → 生成 → 结果
- 本地 guest session + draft/cast/result 存储骨架
- Supabase 环境变量与 client 预埋
- 完整京房纳甲排盘引擎 (`src/lib/liuyao/chart.ts`)
- AI 分析服务 (`src/lib/analysis/`) — Claude API 对接 + 确定性 fallback

进行中：
- AI 分析链路 v1 已可运行（有 key 走 Claude，无 key 走 fallback）
- 结果持久化到 repository 层

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

# AI 分析服务（可选，不填则使用确定性 fallback）
ANTHROPIC_API_KEY=
```

## 架构概览

```
确定性排盘层（纯 TS）
    ↓ ChartData JSON
AI 分析层（Claude API / fallback）
    ↓ AnalysisOutput JSON
前端展示层（React）
```

## 下一步

- 流式输出优化（分析进度实时反馈）
- 分析质量调优（prompt 迭代）
- 体验打磨（M5，需 M3 完成后）
