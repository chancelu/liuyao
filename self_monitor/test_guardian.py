#!/usr/bin/env python3
"""
Guardian 快速测试脚本
"""

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from guardian import ProcessGuardian
from notify import notify_restart_recovery, notify_error

def test_notification():
    """测试通知功能"""
    print("="*60)
    print("测试通知系统")
    print("="*60)
    
    from notify import notify
    
    print("\n1. 发送测试通知...")
    notify(
        title="🧪 测试通知",
        message="这是一条测试消息，验证通知系统是否正常工作。",
        level="info"
    )
    print("✓ 测试通知已发送")
    
    print("\n2. 模拟重启恢复通知...")
    notify_restart_recovery()
    print("✓ 重启恢复通知已发送")
    
    print("\n3. 模拟错误通知...")
    notify_error("模拟的错误：无法连接到 OpenClaw Gateway")
    print("✓ 错误通知已发送")

def test_health_check():
    """测试健康检查"""
    print("\n" + "="*60)
    print("测试健康检查")
    print("="*60)
    
    guardian = ProcessGuardian()
    
    print("\n运行健康检查...")
    is_healthy, failures = guardian.run_health_check()
    
    if is_healthy:
        print("✓ 所有进程健康")
    else:
        print(f"✗ 发现 {len(failures)} 个问题:")
        for failure in failures:
            print(f"  - {failure}")
    
    print(f"\n当前状态: {guardian.get_status()}")

def test_restart():
    """测试重启功能（仅模拟）"""
    print("\n" + "="*60)
    print("测试重启功能（模拟）")
    print("="*60)
    
    print("\n注意：这是一个模拟测试，不会真正重启进程")
    print("在实际运行中，Guardian 会自动重启失败的进程")
    
    guardian = ProcessGuardian()
    
    print("\n模拟进程检查...")
    is_healthy, failures = guardian.run_health_check()
    
    if not is_healthy:
        print(f"\n检测到 {len(failures)} 个失败的进程")
        print("在实际运行中，这些进程将被自动重启")
        
        # 显示重启策略
        print(f"\n重启策略:")
        print(f"  - 最大重启次数: {guardian.config.get('max_restarts', 3)}")
        print(f"  - 重启窗口: {guardian.config.get('restart_window', 3600)} 秒")
        print(f"  - 检查间隔: {guardian.config.get('check_interval', 30)} 秒")

def main():
    """主函数"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Guardian 测试工具')
    parser.add_argument('--all', action='store_true', help='运行所有测试')
    parser.add_argument('--notify', action='store_true', help='测试通知系统')
    parser.add_argument('--health', action='store_true', help='测试健康检查')
    parser.add_argument('--restart', action='store_true', help='测试重启功能')
    
    args = parser.parse_args()
    
    print("="*60)
    print("OpenClaw Guardian 测试工具")
    print("="*60)
    
    if args.all or args.notify:
        test_notification()
    
    if args.all or args.health:
        test_health_check()
    
    if args.all or args.restart:
        test_restart()
    
    if not any([args.all, args.notify, args.health, args.restart]):
        print("\n用法:")
        print("  python test_guardian.py --all       # 运行所有测试")
        print("  python test_guardian.py --notify    # 测试通知系统")
        print("  python test_guardian.py --health    # 测试健康检查")
        print("  python test_guardian.py --restart   # 测试重启功能")
    
    print("\n" + "="*60)
    print("测试完成！")
    print("="*60)


if __name__ == "__main__":
    main()
