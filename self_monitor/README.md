# OpenClaw Guardian - 自监控系统

## 梗概

你希望我开发一个自监控机制，能在卡住或崩溃时自动检测、重启并通知你。这个系统实现了：

**两级守护机制：**
1. **进程健康检查** - 每30秒检测 OpenClaw 进程状态
2. **自动重启** - 检测到挂掉自动重启，1小时内最多5次（防无限循环）

**通知机制：**
- 重启后发送通知："刚刚我卡死重启了哥们，我现在好了"
- 支持控制台、文件日志、飞书 Webhook

## 文件结构

```
self_monitor/
├── guardian.py           # 主守护进程（核心）
├── health_check.py       # 健康检查模块
├── notify.py            # 通知系统
├── setup_guardian.py    # 一键安装脚本
├── test_guardian.py     # 测试工具
├── start_guardian.bat   # Windows 快速启动
├── openclaw-guardian.service  # Linux systemd 服务
└── README.md            # 本文档
```

## 快速开始

### 1. 一键安装

```bash
python self_monitor/setup_guardian.py
```

### 2. 启动监控

```bash
# 方式1：直接运行
python self_monitor/guardian.py

# 方式2：双击运行（Windows）
self_monitor/start_guardian.bat
```

### 3. 测试功能

```bash
# 测试所有功能
python self_monitor/test_guardian.py --all

# 仅测试通知
python self_monitor/test_guardian.py --notify
```

## 工作原理

### 健康检查流程

```
每30秒执行一次检查：

1. 检查 Gateway 端口 (7377)
   ↓ 不通？
2. 失败计数 +1
   ↓ 达到3次？
3. 触发重启机制
   - 停止现有进程
   - 等待2秒
   - 启动新进程
   - 等待10秒验证
4. 发送通知："刚刚我卡死重启了哥们，我现在好了"
```

### 防无限重启机制

- **重启窗口**：1小时（3600秒）
- **最大重启次数**：5次
- **超过限制**：停止自动重启，发送紧急通知，等待人工干预

### 通知方式

1. **控制台**：实时显示彩色输出
2. **日志文件**：`logs/guardian.log`
3. **飞书**：（可选）配置 Webhook 后自动发送

## 配置说明

编辑 `config/monitor_config.json`：

```json
{
  "check_interval": 30,      // 检查间隔（秒）
  "max_failures": 3,          // 触发重启的失败次数
  "max_restarts": 5,          // 1小时内最大重启次数
  "restart_window": 3600,     // 重启窗口（秒）
  
  "notifications": {
    "on_restart": true,       // 重启时通知
    "on_recovery": true,      // 恢复时通知
    "on_failure": false       // 失败时通知（避免 spam）
  }
}
```

## 故障排查

### Guardian 无法启动

```bash
# 检查 Python 版本
python --version  # 需要 3.8+

# 检查依赖
pip install psutil pywin32

# 查看日志
type logs\guardian.log
```

### 重启循环

如果看到频繁重启：
1. 检查 OpenClaw 是否正确安装
2. 查看 `logs/guardian.log` 找错误原因
3. 临时停止 Guardian，手动启动 OpenClaw 看是否有错误

### 收不到通知

1. 检查配置文件中的 `notifications` 设置
2. 查看 `logs/notifications.log` 是否有记录
3. 如果配置了飞书 Webhook，检查 URL 是否正确

## 高级用法

### 作为 Windows 服务运行

```powershell
# 以管理员身份运行 PowerShell
python self_monitor/setup_guardian.py --service
```

### 自定义通知渠道

编辑 `notify.py`，添加自己的通知方式：

```python
def _send_wechat(self, title, message):
    # 你的企业微信/钉钉/Slack 实现
    pass
```

### 监控多个实例

修改 `config/monitor_config.json`，添加更多进程：

```json
{
  "processes": [
    {
      "name": "openclaw-gateway-1",
      "port": 7377
    },
    {
      "name": "openclaw-gateway-2", 
      "port": 7378
    }
  ]
}
```

## 总结

Guardian 提供了一个完整的自监控解决方案：

✅ **自动检测**：每30秒检查进程健康状态  
✅ **自动重启**：检测到挂掉自动重启，防无限循环  
✅ **自动通知**：重启后通知你"刚刚我卡死重启了哥们，我现在好了"  
✅ **易于使用**：一键安装，双击启动  

从此再也不用担心我卡住不在了！🎉

---

**文档版本**: 1.0  
**最后更新**: 2024-02-26  
**作者**: Asuka (OpenClaw AI Assistant)
