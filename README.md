# 气象今日热点 · 全国实时气象预警 + 气象新闻

> 基于和风天气 API + 权威 RSS 源的实时气象信息聚合平台

[![Daily Update](https://github.com/your-username/weather-hotspot/actions/workflows/daily-update.yml/badge.svg)](../../actions)

## 🌤️ 功能特性

- 📍 **全国实时气象预警**：基于和风天气 API，覆盖 31 省级行政区
- 📰 **气象新闻聚合**：从新华网/人民网/中新网自动抓取并打标签
- 🏷️ **智能打标系统**：100+ 标签（10 种主标签 + 行业影响/季节/范围等次级标签）
- 🔍 **全文搜索**：标题/摘要/省份/来源
- 🗺️ **可视化地图**：ECharts 中国地图 + 34 省 GeoJSON + 南海诸岛
- ⏰ **自动化**：每天早 8 点自动更新 + 手动补录按钮
- 🌐 **完全云端运行**：GitHub Actions + Vercel 免费套餐

## 🚀 部署架构

```
┌─────────────────┐  每天 8 点(UTC 0)  ┌───────────────┐
│ GitHub Actions  │ ──── 自动跑 ─────→ │ 抓数据 → 写JSON│
│ (定时任务 24h)  │                    └───────────────┘
└─────────────────┘                              ↓
       ↑ 自动触发 push                    public/data/*.json
       │                                       ↓
┌──────────────────────┐  webhook                ↓
│ GitHub Repo (数据更新)│ ←────────────────────────┘
└──────────────────────┘
                  ↓
       ┌─────────────────────┐
       │ Vercel 自动部署    │
       │ (前端 SPA + CDN)  │
       └─────────────────────┘
```

## 📦 技术栈

- **前端**：React 18 + Vite 5 + Tailwind CSS + ECharts 5
- **数据源**：和风天气 API（real-time 预警）+ RSS（权威新闻）
- **自动化**：GitHub Actions
- **部署**：Vercel

## 🛠️ 部署步骤

### 1. 准备 GitHub 仓库

```bash
# 创建空仓库（GitHub 网页操作）
# 然后本地关联
git remote add origin https://github.com/your-username/weather-hotspot.git
git branch -M main
git push -u origin main
```

### 2. 配置 GitHub Secrets

进入仓库 → Settings → Secrets and variables → Actions → New repository secret

添加：
- **`QWEATHER_API_KEY`**：和风天气 API Key（申请：https://console.qweather.com/）
- **`QWEATHER_API_HOST`**：你的专属 API Host（如 `jy36x7cf38.re.qweatherapi.com`）

### 3. 手动跑一次 Actions

1. 进入 GitHub 仓库 → Actions → Daily Weather Update
2. 点击 "Run workflow" → Run workflow
3. 等待 1-2 分钟，看是否生成 `public/data/*.json`
4. 第一次会 commit 到 `main` 分支

### 4. 部署到 Vercel

1. 访问 https://vercel.com → 登录 → New Project
2. Import Git Repository → 选择 `weather-hotspot`
3. Framework Preset: Vite（自动识别）
4. **重要**：在 "Environment Variables" 添加：
   - `VITE_DATA_SOURCE` = `static`
5. 点击 Deploy
6. 部署完成访问 `https://weather-hotspot-yourname.vercel.app`

### 5. 配置和风 API Host IP 白名单（重要）

- 和风天气专属 API Host 通常绑定特定 IP
- 默认情况下会拒绝 GitHub Actions 的随机 IP
- 解决方案：
  - 在 console.qweather.com → 我的项目 → 设置 IP 白名单 → 添加 `0.0.0.0/0`（允许所有）
  - 或在主项目页面找 "API Host"，使用默认 `devapi.qweather.com`（共享 IP 池）

## 💻 本地开发

```bash
# 1. 安装依赖
npm install
cd server && npm install && cd ..

# 2. 配置 .env
cp .env.example .env
# 编辑 .env，填入 QWEATHER_API_KEY 和 QWEATHER_API_HOST

# 3. 启动后端 (3001 端口)
cd server && npm start

# 4. 启动前端开发服务器 (5173 端口)
npm run dev

# 访问 http://localhost:5173/

# 5. 不启后端，直接用静态数据
npm run build
npx serve dist  # 或 python3 -m http.server --directory dist
```

## 📊 数据更新

- **自动**：每天 UTC 0:00（北京时间 8:00）跑 GitHub Actions
- **手动**：GitHub → Actions → Daily Weather Update → Run workflow
- **本地补录**：本地模式下，NewsList 顶部有"补录"按钮

## 🏷️ 标签体系

5 大类、100+ 标签：
- **气象现象**（主标签）：台风/暴雨/寒潮/高温/雷电/大雾/沙尘暴...
- **影响范围**：局地/区域/流域/全国
- **时间特征**：持续/短时/突发/清晨/午后/夜间
- **行业影响**：⚡ 电力/🚇 交通/🌾 农业/🏥 健康
- **季节时期**：春运/迎峰度夏/迎峰度冬/秋收秋种

## 📁 目录结构

```
weather-hotspot/
├── .github/workflows/    # GitHub Actions
│   └── daily-update.yml  # 每天爬数据
├── public/data/          # 静态数据（GitHub Actions 写入）
│   ├── hotspots.json     # 实时预警
│   ├── news.json         # 实时新闻
│   └── meta.json         # 元数据
├── scripts/
│   └── fetch-data.mjs    # 数据抓取脚本
├── server/               # 本地后端（仅本地用）
│   ├── index.js
│   ├── services/
│   └── ...
├── src/                  # React 源码
│   ├── components/
│   ├── hooks/            # 支持静态/本地双模式
│   ├── utils/
│   └── App.jsx
├── vercel.json           # Vercel 配置
└── package.json
```

## 🔧 常见问题

**Q: GitHub Actions 跑失败？**
A: 检查 Secrets 是否配置正确；查 logs 找具体错误。

**Q: Vercel 部署后页面是空的？**
A: 确认 VITE_DATA_SOURCE=static；检查 Vercel Functions logs。

**Q: 数据没更新？**
A: 等 Actions 跑完（每天 UTC 0:00）；可手动触发。

## 📄 License

MIT
