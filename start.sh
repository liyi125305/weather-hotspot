#!/bin/bash
# ============================================
# 气象今日热点 - 启动脚本
# 局域网 Bonjour 名称: dailymeteo.local
# ============================================

set -e

# 颜色
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
DIST_DIR="$PROJECT_DIR/dist"
SERVER_DIR="$PROJECT_DIR/server"
PORT=9999
API_PORT=3001

echo -e "${BLUE}🌤️  启动气象今日热点服务${NC}"
echo "===================================="

# 1. 检查 .env 配置
if [ ! -f "$PROJECT_DIR/.env" ]; then
  echo -e "${YELLOW}⚠ .env 文件不存在${NC}"
  echo "  复制 .env.example 为 .env 并填入和风天气 API Key："
  echo "  cp .env.example .env"
  echo "  然后编辑 .env，配置 QWEATHER_API_KEY"
  echo ""
fi

if grep -q "QWEATHER_API_KEY=your_key_here\|QWEATHER_API_KEY=$" "$PROJECT_DIR/.env" 2>/dev/null; then
  echo -e "${YELLOW}⚠ 尚未配置 QWEATHER_API_KEY（页面会显示配置引导）${NC}"
fi

# 2. 检查 dist 目录
if [ ! -d "$DIST_DIR" ]; then
  echo -e "${YELLOW}⚠ 未找到 dist 目录，正在构建...${NC}"
  cd "$PROJECT_DIR" && npm run build
fi

# 3. 安装后端依赖（如未安装）
if [ ! -d "$SERVER_DIR/node_modules" ]; then
  echo -e "${YELLOW}安装后端依赖...${NC}"
  cd "$SERVER_DIR" && npm install > /dev/null 2>&1
fi

# 4. 关闭已存在的服务
echo -e "${YELLOW}清理已有服务...${NC}"
pkill -f "http.server.*$PORT" 2>/dev/null || true
pkill -f "node.*server/index.js" 2>/dev/null || true
sleep 1

# 5. 启动后端 API 服务
echo -e "${BLUE}启动后端 API (端口 $API_PORT)...${NC}"
cd "$SERVER_DIR"
nohup node index.js > /tmp/weather_api.log 2>&1 &
API_PID=$!
disown
sleep 2

if ! ps -p $API_PID > /dev/null; then
  echo -e "${RED}✗ 后端启动失败，查看 /tmp/weather_api.log${NC}"
  tail -20 /tmp/weather_api.log
  exit 1
fi

# 6. 启动前端静态服务
echo -e "${BLUE}启动前端服务 (端口 $PORT)...${NC}"
cd "$DIST_DIR"
nohup python3 -m http.server $PORT --bind 0.0.0.0 > /tmp/weather_hotspot.log 2>&1 &
NEW_PID=$!
disown
sleep 2

if ! ps -p $NEW_PID > /dev/null; then
  echo -e "${RED}✗ 前端启动失败${NC}"
  tail -20 /tmp/weather_hotspot.log
  exit 1
fi

# 7. 获取本机 IP
LOCAL_IP=$(ifconfig en0 2>/dev/null | grep "inet " | awk '{print $2}')
[ -z "$LOCAL_IP" ] && LOCAL_IP=$(ifconfig en1 2>/dev/null | grep "inet " | awk '{print $2}')

echo ""
echo -e "${GREEN}✓ 服务启动成功${NC}"
echo ""
echo -e "${BLUE}局域网访问方式:${NC}"
echo -e "  • Bonjour 域名: ${GREEN}http://dailymeteo.local:$PORT/${NC}"
echo -e "  • IP 地址:      ${GREEN}http://$LOCAL_IP:$PORT/${NC}"
echo -e "  • 本机访问:      ${GREEN}http://127.0.0.1:$PORT/${NC}"
echo ""
echo -e "${BLUE}后端 API:${NC}"
echo -e "  • ${GREEN}http://localhost:$API_PORT/api/hotspots${NC}"
echo -e "  • ${GREEN}http://localhost:$API_PORT/api/health${NC}"
echo ""
echo -e "${YELLOW}停止服务:${NC}"
echo "  pkill -f 'http.server.*$PORT'"
echo "  pkill -f 'node.*server/index.js'"
echo ""
echo "PID: 前端=$NEW_PID, 后端=$API_PID"
echo "日志: tail -f /tmp/weather_hotspot.log /tmp/weather_api.log"
