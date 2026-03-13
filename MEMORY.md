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
- 2026-03-13：6大功能上线（积分/个人中心/登录升级/管理后台/分享优化）
- 2026-03-13：品牌从"爻镜"更名为"雅若 Yarrow"
- 2026-03-13：用 Gemini 生成艺术素材（hero-yao.png, logo-yao.png, bg-inkwash.png）
- Vercel 部署：Root Directory = liuyao-web，连接 GitHub repo chancelu/liuyao
- Supabase：已建表 user_profiles, user_points, points_log, checkin_records
- 管理员邮箱：18612669630@163.com
- Gemini 图片生成脚本在 liuyao-web/scripts/，用环境变量 GEMINI_API_KEY
