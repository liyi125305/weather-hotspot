// ============================================
// 每日快照服务
// 每天早 8 点（或手动触发）拉一次数据，存为快照
// 持久化到 JSON 文件，跨重启保留
// ============================================

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { fetchWeatherData } from './dataFetcher.js'
import { fetchNews } from './newsFetcher.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const DATA_DIR = path.resolve(__dirname, '../data')
const SNAPSHOTS_FILE = path.join(DATA_DIR, 'snapshots.json')

// 确保目录存在
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

// 内存缓存
let snapshots = null

// 加载快照
function loadSnapshots() {
  if (snapshots) return snapshots
  try {
    if (fs.existsSync(SNAPSHOTS_FILE)) {
      const data = fs.readFileSync(SNAPSHOTS_FILE, 'utf-8')
      snapshots = JSON.parse(data)
      console.log(`[snapshot] 加载 ${Object.keys(snapshots.days || {}).length} 天的历史快照`)
    } else {
      snapshots = { days: {}, lastCapture: null, captureCount: 0 }
    }
  } catch (err) {
    console.error('[snapshot] 加载快照失败:', err.message)
    snapshots = { days: {}, lastCapture: null, captureCount: 0 }
  }
  return snapshots
}

// 保存快照（异步）
function saveSnapshots() {
  try {
    fs.writeFileSync(SNAPSHOTS_FILE, JSON.stringify(snapshots, null, 2), 'utf-8')
  } catch (err) {
    console.error('[snapshot] 保存快照失败:', err.message)
  }
}

/**
 * 捕获当日快照
 * @returns {Object} 捕获结果
 */
export async function captureDailySnapshot() {
  const s = loadSnapshots()
  const today = todayKey()
  const startTime = Date.now()
  
  console.log(`[snapshot] 开始捕获 ${today} 的数据...`)
  
  try {
    // 并发拉取预警 + 新闻
    const [warningResult, newsResult] = await Promise.all([
      fetchWeatherData().catch(err => ({ error: err.message })),
      fetchNews().catch(err => ({ items: [], error: err.message }))
    ])
    
    const warnings = warningResult.data || []
    const news = newsResult.items || []
    
    // 合并为当日快照
    const snapshot = {
      date: today,
      capturedAt: new Date().toISOString(),
      warnings: warnings,
      news: news,
      stats: {
        warningCount: warnings.length,
        newsCount: news.length,
        duration: Date.now() - startTime
      }
    }
    
    // 写入快照
    s.days[today] = snapshot
    s.lastCapture = snapshot.capturedAt
    s.captureCount = (s.captureCount || 0) + 1
    
    // 保留 30 天（节省空间）
    const allDays = Object.keys(s.days).sort()
    if (allDays.length > 30) {
      const toDelete = allDays.slice(0, allDays.length - 30)
      toDelete.forEach(d => delete s.days[d])
    }
    
    saveSnapshots()
    
    console.log(`[snapshot] ✅ ${today} 捕获完成: ${warnings.length} 预警 + ${news.length} 新闻 (${snapshot.stats.duration}ms)`)
    
    return {
      success: true,
      date: today,
      warningCount: warnings.length,
      newsCount: news.length,
      duration: snapshot.stats.duration
    }
  } catch (err) {
    console.error('[snapshot] ❌ 捕获失败:', err.message)
    return {
      success: false,
      error: err.message,
      date: today
    }
  }
}

/**
 * 获取所有快照（按天降序）
 */
export function getAllSnapshots() {
  const s = loadSnapshots()
  const days = Object.keys(s.days).sort().reverse()
  return {
    days: days.map(d => ({
      date: d,
      warningCount: s.days[d].warnings?.length || 0,
      newsCount: s.days[d].news?.length || 0,
      capturedAt: s.days[d].capturedAt
    })),
    lastCapture: s.lastCapture,
    captureCount: s.captureCount || 0
  }
}

/**
 * 获取某天的快照详情
 */
export function getSnapshotByDate(date) {
  const s = loadSnapshots()
  return s.days[date] || null
}

/**
 * 删除某天的快照
 */
export function deleteSnapshot(date) {
  const s = loadSnapshots()
  if (s.days[date]) {
    delete s.days[date]
    saveSnapshots()
    return { success: true }
  }
  return { success: false, error: '快照不存在' }
}

function todayKey() {
  const d = new Date()
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`
}

// ============================================
// 定时器：每天早 8:00 自动补录
// ============================================

let lastTriggeredDate = null
let intervalId = null

export function startDailySnapshotScheduler() {
  if (intervalId) {
    console.log('[scheduler] 已在运行')
    return
  }
  
  console.log('[scheduler] 启动每天 8:00 自动补录')
  
  // 每分钟检查一次
  intervalId = setInterval(async () => {
    const now = new Date()
    const hh = now.getHours()
    const mm = now.getMinutes()
    const today = todayKey()
    
    if (hh === 8 && mm < 6 && lastTriggeredDate !== today) {
      lastTriggeredDate = today
      console.log('[scheduler] 触发 8:00 自动补录')
      const result = await captureDailySnapshot()
      console.log('[scheduler] 补录结果:', result.success ? '✅' : '❌', result.error || `${result.warningCount} 预警 + ${result.newsCount} 新闻`)
    }
  }, 60 * 1000)
  
  // 启动时立即检查一次（防止进程在 8:00 重启时错过）
  setTimeout(async () => {
    const now = new Date()
    const today = todayKey()
    if (now.getHours() === 8 && now.getMinutes() < 6 && lastTriggeredDate !== today) {
      lastTriggeredDate = today
      console.log('[scheduler] 启动时立即补录')
      await captureDailySnapshot()
    }
  }, 5 * 1000)
}

export function stopDailySnapshotScheduler() {
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
    console.log('[scheduler] 已停止')
  }
}
