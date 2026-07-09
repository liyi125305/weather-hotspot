#!/bin/bash
# 停止气象服务
pkill -f "http.server.*9999" 2>/dev/null && echo "✓ 服务已停止" || echo "未发现运行中的服务"
