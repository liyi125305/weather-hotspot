import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import path from 'path'
import { fetchWeatherData, fetchTyphoonData } from './services/dataFetcher.js'
import { fetchNews } from './services/newsFetcher.js'
import { 
  captureDailySnapshot, 
  getAllSnapshots, 
  getSnapshotByDate, 
  deleteSnapshot,
  startDailySnapshotScheduler 
} from './services/snapshotService.js'

// 加载 .env 文件（项目根目录）
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.resolve(__dirname, '../.env') })

const app = express()
const PORT = process.env.PORT || 3001

// 中间件
app.use(cors())
app.use(express.json())

// 缓存
let cache = {
  data: null,
  lastUpdated: null
}

// 缓存有效期（30 分钟，符合和风数据更新频率）
const CACHE_TTL = 30 * 60 * 1000

// 获取所有热点
app.get('/api/hotspots', async (req, res) => {
  try {
    // 检查缓存
    if (cache.data && cache.lastUpdated && (Date.now() - cache.lastUpdated < CACHE_TTL)) {
      return res.json({
        success: true,
        data: cache.data,
        lastUpdated: cache.lastUpdated.toISOString(),
        fromCache: true
      })
    }

    // 调用真实 API
    const result = await fetchWeatherData()
    
    if (result.error) {
      return res.json({
        success: false,
        error: result.error,
        message: result.message,
        data: []
      })
    }
    
    // 更新缓存
    cache.data = result.data || []
    cache.lastUpdated = new Date()
    
    res.json({
      success: true,
      data: cache.data,
      lastUpdated: cache.lastUpdated.toISOString(),
      fromCache: false
    })
  } catch (error) {
    console.error('获取气象数据失败:', error)
    res.status(500).json({
      success: false,
      error: 'server_error',
      message: error.message,
      data: []
    })
  }
})

// 获取气象新闻
app.get('/api/news', async (req, res) => {
  try {
    const result = await fetchNews()
    res.json({
      success: true,
      data: result.items,
      lastUpdated: result.lastUpdated,
      fromCache: result.fromCache
    })
  } catch (error) {
    console.error('获取新闻失败:', error)
    res.status(500).json({
      success: false,
      error: 'server_error',
      message: error.message,
      data: []
    })
  }
})

// 获取单个热点
app.get('/api/hotspots/:id', async (req, res) => {
  try {
    if (!cache.data) {
      const result = await fetchWeatherData()
      cache.data = result.data || []
      cache.lastUpdated = new Date()
    }
    
    const hotspot = cache.data.find(h => h.id === req.params.id)
    if (!hotspot) {
      return res.status(404).json({
        success: false,
        error: '未找到该热点'
      })
    }
    
    res.json({ success: true, data: hotspot })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    apiKeyConfigured: !!process.env.QWEATHER_API_KEY
  })
})

// ============================================
// 快照相关端点
// ============================================

// 手动触发补录
app.post('/api/snapshot/capture', async (req, res) => {
  try {
    const result = await captureDailySnapshot()
    res.json(result)
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// 获取所有快照列表
app.get('/api/snapshot', (req, res) => {
  res.json({
    success: true,
    data: getAllSnapshots()
  })
})

// 获取某天的快照详情
app.get('/api/snapshot/:date', (req, res) => {
  const snapshot = getSnapshotByDate(req.params.date)
  if (!snapshot) {
    return res.status(404).json({ success: false, error: '快照不存在' })
  }
  res.json({ success: true, data: snapshot })
})

// 删除某天的快照
app.delete('/api/snapshot/:date', (req, res) => {
  const result = deleteSnapshot(req.params.date)
  res.json(result)
})

app.listen(PORT, () => {
  const hasKey = !!process.env.QWEATHER_API_KEY
  console.log(`🌤️  气象热点服务运行在 http://localhost:${PORT}`)
  console.log(`   和风天气 API Key: ${hasKey ? '✅ 已配置' : '❌ 未配置（需在 .env 设置）'}`)
  
  // 启动每日 8:00 自动补录调度
  startDailySnapshotScheduler()
})
