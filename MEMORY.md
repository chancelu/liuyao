# MEMORY.md

## 用户偏好

- **所有新 Skill 安装前必须先用 Skill Vetter 审查**，通过后才能安装
- **API key / secret 绝对不能写进代码文件**，必须用环境变量（.env.local）或运行时传入，防止泄露到 git

- 小北希望重要内容不要只停留在聊天里，**要保存进记忆**
- 对 liuyao-web 的产品体验比较敏感，尤其在设计质感和细节真实性上要求高
- 对声音反馈有明确审美：不接受像铃铛或泛泛的提示音，偏好**像铜钱真实碰撞的一声清脆金属声**

## liuyao-web 项目（品牌：雅若 Yarrow）

- 品牌名确定：中文"雅若"，英文"Yarrow"（蓍草，传统易经占卜工具）
- 项目正在进行颠覆性设计改版，设计文档在 `liuyao-web/docs/design-v2.md`
- 设计方向：东方神秘主义为主体，融入极简克制 + 现代宇宙感
- 2026-03-12：铜钱音效按"清脆金属碰撞、接近真实铜钱互磕"方向重做，提交 `ce68046` (`Refine coin collision sound`)

## 分析引擎关键规则（已验证）
- **土的十二长生**：六爻中土"寄水宫"（长生申，旺子，墓辰，绝巳），不是随火
- **原忌仇固定表**：父母→原官鬼忌妻财仇子孙，官鬼→原妻财忌子孙仇兄弟，妻财→原子孙忌兄弟仇父母，子孙→原兄弟忌父母仇官鬼，兄弟→原父母忌官鬼仇妻财
- **旺不为空**：得月建或得日辰（任一）即旺，旬空不为空（增删卜易）
- **getXunkong 公式**：`((12 - jiaBranchIdx) % 12) / 2`，旧公式 `jiaBranchIdx / 2` 是错的
- **TRIGRAM_MAP binary**：bit2=下爻, bit1=中爻, bit0=上爻（之前修过一次 splitTrigrams）
- 2026-03-13：6大功能上线（积分/个人中心/登录升级/管理后台/分享优化）
- 2026-03-13：品牌从"爻镜"更名为"雅若 Yarrow"
- 2026-03-13：用 Gemini 生成艺术素材（hero-yao.png, logo-yao.png, bg-inkwash.png）
- Vercel 部署：Root Directory = liuyao-web，连接 GitHub repo chancelu/liuyao
- Supabase：已建表 user_profiles, user_points, points_log, checkin_records
- 管理员邮箱：18612669630@163.com
- Gemini 图片生成脚本在 liuyao-web/scripts/，用环境变量 GEMINI_API_KEY

## 分析引擎测试结果（2026-03-15）

### 引擎基线（卷五100题）
- **44/99 精确 (44.4%)，81/99 接近 (81.8%)**
- 评分权重：月日=2, 动爻=0.75, 暗动=0.4, 变爻=1.8, 泄耗系数=0.7
- 旺衰阈值：≥3.2→旺, ≥1.0→偏旺, ≥-1.0→平, ≥-2.8→偏弱, else→弱

### 混合分析器（引擎+LLM）
- 架构：`src/lib/analysis/hybrid-analyzer.ts`
- 用神选择：LLM 在 confidence !== 'high' 时介入（relationship/career/health/other）
- 旺衰微调：**已关闭** — 测试显示 LLM 回退多于改善
- 测试结论：LLM 用神选择有潜力但当前 prompt 太保守，基本没改变引擎选择
- 测试脚本：`scripts/test-hybrid.ts`（--live/--json/--batch）

### LLM API
- **生产环境已切换到 Gemini 3 Flash**
- Base URL: `https://generativelanguage.googleapis.com/v1beta/openai`
- Model: `gemini-3-flash-preview`
- 原豆包 API 有连接池卡死问题，已弃用
- Vercel 环境变量需手动更新（小北待操作）

### 剩余瓶颈
- 用神位置不匹配 22 题（引擎选错爻位）
- 纯旺衰偏差 25 题（偏高17，偏低8）
- 缺少三刑/六害/连续相生链对旺衰的影响
- 权重调优已到极限，需要结构性改进
