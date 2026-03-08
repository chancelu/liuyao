# 爻镜 / liuyao-web

六爻在线占卦网站 MVP。

## 当前阶段

已完成：
- Next.js + TypeScript + Tailwind 初始化
- 中文优先的 i18n 预埋
- 首页 / 起卦页 / 摇卦页 / 生成页 / 结果页 / 历史页 / 分享页骨架
- 主流程前端交互 mock：提问 → 摇卦 → 生成 → 结果
- 本地 guest session + draft/cast/result 存储骨架
- Supabase 环境变量与 client 预埋

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
```

## 下一步

- 接入真实 Supabase Auth / DB
- 实现 divinations / casts / charts / analyses 数据流
- 替换 mock 分析为真实排盘引擎 + AI 分析服务
