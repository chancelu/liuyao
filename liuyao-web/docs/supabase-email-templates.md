# Supabase Email Templates — Yarrow 雅若

在 Supabase Dashboard → Authentication → Email Templates 中配置以下模板。

> 注意：Supabase 邮件模板不支持服务端动态切换语言，所以采用中英双语并列的方式。

---

## 1. Confirm signup（注册验证邮件）

**Subject:**
```
Verify your email | 验证你的邮箱 — Yarrow 雅若
```

**Body (HTML):**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body { margin: 0; padding: 0; background: #0a0a0f; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .container { max-width: 480px; margin: 0 auto; padding: 40px 24px; }
    .brand { text-align: center; margin-bottom: 32px; }
    .brand-name { font-size: 28px; color: #c4956b; letter-spacing: 0.1em; }
    .brand-sub { font-size: 12px; color: #666; margin-top: 4px; letter-spacing: 0.15em; }
    .card { background: #12121a; border: 1px solid rgba(196,149,107,0.1); border-radius: 16px; padding: 32px 24px; }
    .section { margin-bottom: 24px; }
    .section:last-child { margin-bottom: 0; }
    .lang-label { font-size: 10px; color: #555; text-transform: uppercase; letter-spacing: 0.2em; margin-bottom: 8px; }
    p { color: #a0a0a0; font-size: 14px; line-height: 1.8; margin: 0 0 12px; }
    .btn { display: inline-block; background: linear-gradient(135deg, #c4956b, #a07850); color: #0a0a0f !important; text-decoration: none; padding: 14px 32px; border-radius: 999px; font-size: 14px; font-weight: 600; letter-spacing: 0.05em; }
    .btn-wrap { text-align: center; margin: 24px 0; }
    .divider { border: none; border-top: 1px solid rgba(196,149,107,0.08); margin: 24px 0; }
    .footer { text-align: center; margin-top: 32px; }
    .footer p { font-size: 11px; color: #444; }
  </style>
</head>
<body>
  <div class="container">
    <div class="brand">
      <div class="brand-name">✦ Yarrow</div>
      <div class="brand-sub">雅若 · 六爻在线占卦</div>
    </div>
    <div class="card">
      <div class="section">
        <div class="lang-label">English</div>
        <p>Welcome to Yarrow. Click the button below to verify your email and activate your account.</p>
      </div>
      <hr class="divider" />
      <div class="section">
        <div class="lang-label">中文</div>
        <p>欢迎来到雅若。点击下方按钮验证你的邮箱，完成账号激活。</p>
      </div>
      <div class="btn-wrap">
        <a href="{{ .ConfirmationURL }}" class="btn">Verify Email · 验证邮箱</a>
      </div>
      <p style="font-size: 12px; color: #555; text-align: center;">If the button doesn't work, copy this link:<br/>如果按钮无法点击，请复制以下链接：</p>
      <p style="font-size: 11px; color: #666; word-break: break-all; text-align: center;">{{ .ConfirmationURL }}</p>
    </div>
    <div class="footer">
      <p>Yarrow 雅若 · yarrow.divination</p>
      <p>This email was sent because someone registered with this address.<br/>此邮件因有人使用该邮箱注册而发送。</p>
    </div>
  </div>
</body>
</html>
```

---

## 2. Magic Link / OTP（验证码登录邮件）

**Subject:**
```
Your login code | 你的登录验证码 — Yarrow 雅若
```

**Body (HTML):**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body { margin: 0; padding: 0; background: #0a0a0f; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .container { max-width: 480px; margin: 0 auto; padding: 40px 24px; }
    .brand { text-align: center; margin-bottom: 32px; }
    .brand-name { font-size: 28px; color: #c4956b; letter-spacing: 0.1em; }
    .brand-sub { font-size: 12px; color: #666; margin-top: 4px; letter-spacing: 0.15em; }
    .card { background: #12121a; border: 1px solid rgba(196,149,107,0.1); border-radius: 16px; padding: 32px 24px; }
    .section { margin-bottom: 24px; }
    .section:last-child { margin-bottom: 0; }
    .lang-label { font-size: 10px; color: #555; text-transform: uppercase; letter-spacing: 0.2em; margin-bottom: 8px; }
    p { color: #a0a0a0; font-size: 14px; line-height: 1.8; margin: 0 0 12px; }
    .code-box { text-align: center; margin: 24px 0; }
    .code { display: inline-block; background: rgba(196,149,107,0.08); border: 1px solid rgba(196,149,107,0.15); border-radius: 12px; padding: 16px 40px; font-family: 'SF Mono', 'Fira Code', monospace; font-size: 32px; letter-spacing: 0.3em; color: #c4956b; font-weight: 600; }
    .divider { border: none; border-top: 1px solid rgba(196,149,107,0.08); margin: 24px 0; }
    .footer { text-align: center; margin-top: 32px; }
    .footer p { font-size: 11px; color: #444; }
  </style>
</head>
<body>
  <div class="container">
    <div class="brand">
      <div class="brand-name">✦ Yarrow</div>
      <div class="brand-sub">雅若 · 六爻在线占卦</div>
    </div>
    <div class="card">
      <div class="section">
        <div class="lang-label">English</div>
        <p>Here is your one-time login code for Yarrow. It expires in 10 minutes.</p>
      </div>
      <hr class="divider" />
      <div class="section">
        <div class="lang-label">中文</div>
        <p>以下是你的雅若登录验证码，10 分钟内有效。</p>
      </div>
      <div class="code-box">
        <div class="code">{{ .Token }}</div>
      </div>
      <p style="font-size: 12px; color: #555; text-align: center;">If you didn't request this, please ignore this email.<br/>如果你没有请求此验证码，请忽略此邮件。</p>
    </div>
    <div class="footer">
      <p>Yarrow 雅若 · yarrow.divination</p>
      <p>Do not share this code with anyone.<br/>请勿将验证码分享给他人。</p>
    </div>
  </div>
</body>
</html>
```

---

## 3. Reset Password（密码重置 — 保留备用）

当前流程不使用密码登录，但保留此模板以防未来需要。

**Subject:**
```
Reset your password | 重置密码 — Yarrow 雅若
```

**Body (HTML):**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body { margin: 0; padding: 0; background: #0a0a0f; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .container { max-width: 480px; margin: 0 auto; padding: 40px 24px; }
    .brand { text-align: center; margin-bottom: 32px; }
    .brand-name { font-size: 28px; color: #c4956b; letter-spacing: 0.1em; }
    .brand-sub { font-size: 12px; color: #666; margin-top: 4px; letter-spacing: 0.15em; }
    .card { background: #12121a; border: 1px solid rgba(196,149,107,0.1); border-radius: 16px; padding: 32px 24px; }
    .section { margin-bottom: 24px; }
    .section:last-child { margin-bottom: 0; }
    .lang-label { font-size: 10px; color: #555; text-transform: uppercase; letter-spacing: 0.2em; margin-bottom: 8px; }
    p { color: #a0a0a0; font-size: 14px; line-height: 1.8; margin: 0 0 12px; }
    .btn { display: inline-block; background: linear-gradient(135deg, #c4956b, #a07850); color: #0a0a0f !important; text-decoration: none; padding: 14px 32px; border-radius: 999px; font-size: 14px; font-weight: 600; letter-spacing: 0.05em; }
    .btn-wrap { text-align: center; margin: 24px 0; }
    .divider { border: none; border-top: 1px solid rgba(196,149,107,0.08); margin: 24px 0; }
    .footer { text-align: center; margin-top: 32px; }
    .footer p { font-size: 11px; color: #444; }
  </style>
</head>
<body>
  <div class="container">
    <div class="brand">
      <div class="brand-name">✦ Yarrow</div>
      <div class="brand-sub">雅若 · 六爻在线占卦</div>
    </div>
    <div class="card">
      <div class="section">
        <div class="lang-label">English</div>
        <p>Click the button below to reset your password.</p>
      </div>
      <hr class="divider" />
      <div class="section">
        <div class="lang-label">中文</div>
        <p>点击下方按钮重置你的密码。</p>
      </div>
      <div class="btn-wrap">
        <a href="{{ .ConfirmationURL }}" class="btn">Reset Password · 重置密码</a>
      </div>
      <p style="font-size: 12px; color: #555; text-align: center;">If you didn't request this, please ignore this email.<br/>如果你没有请求重置密码，请忽略此邮件。</p>
    </div>
    <div class="footer">
      <p>Yarrow 雅若 · yarrow.divination</p>
    </div>
  </div>
</body>
</html>
```

---

## 配置步骤

1. 打开 Supabase Dashboard → Authentication → Email Templates
2. 分别编辑以下模板：
   - **Confirm signup** — 用上面第1个模板
   - **Magic Link** — 用上面第2个模板（OTP 验证码）
   - **Reset Password** — 用上面第3个模板（备用）
3. 把 Subject 和 Body 分别粘贴进去
4. 点 Save

> Supabase 免费版使用内置 SMTP，发送量有限（每小时约4封）。生产环境建议配置自定义 SMTP（如 Resend、Postmark）。
