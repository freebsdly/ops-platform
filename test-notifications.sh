#!/bin/bash
# 快速测试通知功能

echo "======================================"
echo "通知系统快速测试"
echo "======================================"
echo ""

# 检查开发服务器是否在运行
echo "1. 检查开发服务器状态..."
if curl -s http://localhost:4201 > /dev/null 2>&1 || curl -s http://localhost:4200 > /dev/null 2>&1; then
    echo "✅ 开发服务器正在运行"
else
    echo "❌ 开发服务器未运行"
    echo "   请运行: npm start"
    exit 1
fi

echo ""
echo "2. 浏览器测试步骤："
echo "   1) 打开浏览器访问: http://localhost:4201 (或 4200)"
echo "   2) 打开开发者工具 (F12)"
echo "   3) 查看 Console 标签，应该看到:"
echo "      - MSW: 开始初始化..."
echo "      - ✅ MSW已成功启动"
echo "      - NotificationApiService: 获取通知列表"
echo "      - NotificationApiService: 获取到 12 条通知"
echo ""
echo "   4) 查看 Network 标签:"
echo "      - 筛选 XHR 请求"
echo "      - 找到 GET /api/notifications"
echo "      - 状态应该是 200"
echo "      - Response 应该包含通知数据"
echo ""
echo "   5) 测试通知功能:"
echo "      - 点击右上角铃铛图标"
echo "      - 应该看到通知下拉列表"
echo "      - 未读通知数量应该显示 (7条)"
echo "      - 点击通知可以标记为已读"
echo "      - 点击 X 可以删除通知"
echo ""
echo "   6) 测试通知中心页面:"
echo "      - 点击'View All'按钮"
echo "      - 或直接访问: http://localhost:4201/workbench/notification-center"
echo "      - 应该看到完整的通知列表"
echo "      - 可以使用搜索、筛选功能"
echo ""

echo "3. 如果没有数据，请在浏览器控制台运行:"
echo ""
echo "   fetch('/api/notifications')"
echo "     .then(r => r.json())"
echo "     .then(d => console.log('通知数量:', d.data.data.length))"
echo ""
echo "   预期输出: 通知数量: 12"
echo ""

echo "4. 完整的调试指南请查看: DEBUG_NOTIFICATIONS.md"
echo ""
