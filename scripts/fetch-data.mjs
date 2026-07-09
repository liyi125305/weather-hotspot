// ============================================
// 静态数据生成脚本
// GitHub Actions 每天 8 点运行此脚本
// 输出 JSON 到 public/data/，由 Vercel 自动部署
// ============================================

import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import axios from 'axios'
import Parser from 'rss-parser'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const PROJECT_DIR = path.resolve(__dirname, '..')
const DATA_DIR = path.join(PROJECT_DIR, 'public', 'data')

// 确保数据目录存在
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

// ========= 配置 =========
const API_KEY = process.env.QWEATHER_API_KEY
const API_HOST = process.env.QWEATHER_API_HOST || 'devapi.qweather.com'
const API_BASE = `https://${API_HOST}/v7`

// 31 省会城市 LocationID
const PROVINCES = [
  ['北京', 101010100, 110000], ['天津', 101030100, 120000],
  ['石家庄', 101090101, 130000], ['太原', 101100101, 140000],
  ['呼和浩特', 101080101, 150000], ['沈阳', 101070101, 210000],
  ['长春', 101060101, 220000], ['哈尔滨', 101050101, 230000],
  ['上海', 101020100, 310000], ['南京', 101190101, 320000],
  ['杭州', 101210101, 330000], ['合肥', 101220101, 340000],
  ['福州', 101230101, 350000], ['南昌', 101240101, 360000],
  ['济南', 101120101, 370000], ['郑州', 101180101, 410000],
  ['武汉', 101200101, 420000], ['长沙', 101250101, 430000],
  ['广州', 101280101, 440000], ['南宁', 101300101, 450000],
  ['海口', 101310101, 460000], ['重庆', 101040100, 500000],
  ['成都', 101270101, 510000], ['贵阳', 101260101, 520000],
  ['昆明', 101290101, 530000], ['拉萨', 101140101, 540000],
  ['西安', 101110101, 610000], ['兰州', 101160101, 620000],
  ['西宁', 101150101, 630000], ['银川', 101170101, 640000],
  ['乌鲁木齐', 101130101, 650000]
]

const FALLBACK_COORDS = {
  110000:[116.4074,39.9042], 120000:[117.1901,39.1255],
  130000:[114.5149,38.0428], 140000:[112.5489,37.8706],
  150000:[111.7519,40.8414], 210000:[123.4291,41.7968],
  220000:[125.3245,43.8868], 230000:[126.6428,45.7569],
  310000:[121.4737,31.2304], 320000:[118.7969,32.0603],
  330000:[121.4737,29.1832], 340000:[117.2272,31.8206],
  350000:[119.2965,26.0745], 360000:[115.8921,28.6765],
  370000:[117.0009,36.6758], 410000:[113.6253,34.7466],
  420000:[114.3419,30.5461], 430000:[112.9388,28.2282],
  440000:[113.2644,23.1291], 450000:[108.3669,22.8170],
  460000:[110.3312,20.0319], 500000:[106.5516,29.5630],
  510000:[104.0658,30.6592], 520000:[106.7135,26.5783],
  530000:[102.8329,24.8801], 540000:[91.1409,29.6500],
  610000:[108.9398,34.3416], 620000:[103.8343,36.0611],
  630000:[100.9018,36.4828], 640000:[106.2309,38.4872],
  650000:[87.6177,43.7928]
}

const TYPE_NAME_MAP = {
  '台风':'typhoon','暴雨':'rainstorm','暴雪':'snow','寒潮':'coldwave',
  '大风':'strong-wind','沙尘暴':'sandstorm','高温':'heatwave','干旱':'drought',
  '雷电':'thunder','冰雹':'hail','霜冻':'frost','大雾':'fog','霾':'haze',
  '道路结冰':'road-ice','强对流':'convection',
  '中小河流洪水':'flood','山洪灾害':'flash-flood','农业气象风险':'agriculture-risk'
}

const SEVERITY_MAP = { '蓝色':'blue','黄色':'yellow','橙色':'orange','红色':'red','白色':'blue' }

// ========== 拉取预警 ==========
async function fetchWarnings() {
  if (!API_KEY) {
    console.log('[skip] 未配置 API Key，跳过预警')
    return []
  }
  
  const results = await Promise.allSettled(
    PROVINCES.map(async ([name, locId, adcode]) => {
      try {
        const res = await axios.get(
          `${API_BASE}/warning/now?location=${locId}&key=${API_KEY}`,
          { timeout: 8000 }
        )
        if (res.data.code !== '200' || !res.data.warning) return []
        
        return res.data.warning.map((w, idx) => ({
          id: `${locId}-${w.id || idx}-${w.pubTime || Date.now()}`,
          type: TYPE_NAME_MAP[w.typeName] || 'other',
          rawType: w.typeName || w.type,
          title: w.title || `${name}气象预警`,
          location: FALLBACK_COORDS[adcode],
          province: name,
          provinceCode: adcode,
          severity: SEVERITY_MAP[w.level] || 'blue',
          source: w.sender || '中国气象局',
          publishedAt: normalizeTime(w.pubTime),
          summary: w.text || w.title || '',
          url: w.url || null
        }))
      } catch (err) {
        return []
      }
    })
  )
  
  const all = []
  results.forEach(r => {
    if (r.status === 'fulfilled' && r.value) all.push(...r.value)
  })
  return all
}

// ========== 拉取新闻 ==========
const NEWS_SOURCES = [
  { name: '新华网政治', url: 'https://www.xinhuanet.com/politics/news_politics.xml', home: 'https://www.news.cn' },
  { name: '新华网社会', url: 'https://www.xinhuanet.com/world/news_world.xml', home: 'https://www.news.cn' },
  { name: '人民网时政', url: 'https://www.people.com.cn/rss/politics.xml', home: 'http://politics.people.com.cn' },
  { name: '中新网', url: 'https://www.chinanews.com.cn/rss/scroll-news.xml', home: 'https://www.chinanews.com.cn' }
]

const WEATHER_KEYWORDS = [
  '气象','天气','预警','气候','暴雨','暴雪','大到暴雨','暴雨到大暴雨','大暴雨','特大暴雨',
  '短时强降水','强降水','强降雨','局地暴雨','山区暴雨','连阴雨','冻雨','雨夹雪','雨凇','雾凇',
  '降水','降雨','降雪','积雪','降雨量','降水量','暴雨红色','暴雨橙色','暴雨黄色','暴雨蓝色',
  '台风','超强台风','强台风','热带风暴','热带低压','热带气旋','飓风','龙卷','龙卷风','大风','阵风','狂风','雷雨大风',
  '强对流','短时强对流','雷电','雷雨','雷暴','干雷暴','强雷暴','局地雷暴','冰雹','冰粒','冰针','米雪',
  '高温','持续高温','酷暑','酷热','热浪','高温红色','高温橙色',
  '低温','寒潮','强降温','冷空气','强冷空气','三股冷空气','降温','升温','回温','倒春寒','秋老虎',
  '温度','气温','昼夜温差','体感温度',
  '干旱','伏旱','春旱','秋旱','冬旱','山洪','洪水','内涝','河流','水位','汛期','防汛','风暴潮','海浪','巨浪','海冰','赤潮',
  '大雾','浓雾','强浓雾','特强浓雾','团雾','霾','雾霾','重霾','空气污染','空气质量',
  '沙尘暴','强沙尘暴','扬沙','浮尘','道路结冰','电线覆冰','电线结冰','线路覆冰','能见度','低能见度',
  '暴雪','大雪','中雪','小雪','霜冻','早霜','晚霜','霜降','寒露风','初霜','雪崩','冰崩','雪团',
  // 气候现象
  '厄尔尼诺','拉尼娜','ENSO','副高','副热带高压','西风带','季风','大陆高压','高空冷涡','切断低压','极地涡旋','极涡','北极涛动','AO',
  '应急响应','应急启动','应急终止','应急响应级别','应急响应等级',
  '省气象局','市气象局','气象台','气象中心','气象服务','今年第','台风预警','暴雨预警','雷电预警','高温预警',
  '沿海','海上','海面','海区','海岛','近海','山区','山地','高原','盆地','平原','内陆','河口','三角洲'
]

function mapType(t) {
  if (!t) return null
  if (TYPE_NAME_MAP[t]) return TYPE_NAME_MAP[t]
  for (const [k, v] of Object.entries(TYPE_NAME_MAP)) {
    if (t.includes(k)) return v
  }
  return null
}

async function fetchNews() {
  const parser = new Parser({ timeout: 10000, headers: { 'User-Agent': 'WeatherHotspotBot/1.0' } })
  
  const results = await Promise.allSettled(
    NEWS_SOURCES.map(async (src) => {
      try {
        const feed = await parser.parseURL(src.url)
        return feed.items.map(item => ({
          source: src.name,
          sourceHome: src.home,
          title: (item.title || '').replace(/\s+/g, ' ').trim(),
          url: item.link || '',
          snippet: stripHtml(item.contentSnippet || item.content || '').slice(0, 300),
          publishedAt: item.isoDate || item.pubDate || new Date().toISOString()
        }))
      } catch (err) {
        return []
      }
    })
  )
  
  const all = []
  results.forEach(r => { if (r.status === 'fulfilled' && r.value) all.push(...r.value) })
  
  const filtered = all.filter(item => {
    const text = `${item.title} ${item.snippet}`.toLowerCase()
    return WEATHER_KEYWORDS.some(kw => text.includes(kw.toLowerCase()))
  })
  
  // 按时间降序
  filtered.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
  
  // 自动打标（复用前端逻辑）
  return filtered.slice(0, 50).map(item => {
    const tags = matchTags(item.title + ' ' + item.snippet)
    return {
      ...item,
      id: 'news-' + hash(item.url || item.title),
      tags,
      mainTagKey: tags[0] || null,
      type: tags[0] || 'other'
    }
  })
}

function stripHtml(html) {
  return (html || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

function normalizeTime(t) {
  try {
    const d = new Date(t)
    return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString()
  } catch { return new Date().toISOString() }
}

function hash(s) {
  let h = 0
  for (let i = 0; i < (s||'').length; i++) h = ((h << 5) - h) + s.charCodeAt(i)
  return Math.abs(h).toString(36)
}

// 简化版打标：复用前端的关键词字典
const TAG_RULES = {
  'typhoon-super': ['超强台风'], 'typhoon-strong': ['强台风'], 'typhoon': ['台风'],
  'rainstorm-extreme': ['特大暴雨'], 'rainstorm-heavy': ['大暴雨'], 'rainstorm-strong': ['暴雨'],
  'cold-wave': ['寒潮'], 'coldwave': ['寒潮'],
  'heatwave': ['高温'], 'extreme-heat': ['酷热','酷暑','40℃'],
  'sandstorm': ['沙尘暴'], 'strong-wind': ['大风'], 'fog': ['大雾'],
  'thunder': ['雷电','雷雨','雷暴'], 'hail': ['冰雹'], 'frost': ['霜冻'],
  'road-ice': ['道路结冰'], 'haze': ['霾','雾霾'], 'tornado': ['龙卷'],
  'convection': ['强对流'], 'gale': ['狂风','8级','9级','10级'],
  'flood': ['洪水','中小河流洪水'], 'flash-flood': ['山洪'], 'agriculture-risk': ['农业气象','农业风险'],
  // 影响
  'impact-power': ['电力','电网','输电','变电站'], 'impact-traffic': ['交通','公路','高速','铁路','航班'],
  'impact-city': ['城市','排水','内涝'], 'impact-agriculture': ['农业','作物','农田'],
  'impact-health': ['健康','中暑','感冒'],
  // 范围
  'scope-local': ['局地','局部'], 'scope-regional': ['区域','全省','全市'],
  // 时间
  'temp-continuous': ['持续','连续'], 'temp-short': ['短时'], 'temp-sudden': ['突发','骤然'],
  // 季节
  'season-summer-peak': ['迎峰度夏'], 'season-winter-peak': ['迎峰度冬']
}

function matchTags(text) {
  const t = text.toLowerCase()
  const matches = []
  Object.entries(TAG_RULES).forEach(([tag, kws]) => {
    if (kws.some(kw => t.includes(kw.toLowerCase()))) matches.push(tag)
  })
  // 优先级：现象类在前
  return matches.sort((a, b) => {
    const order = ['typhoon','rainstorm','cold-wave','heatwave','fog','sandstorm','tornado','thunder','convection']
    const ai = order.findIndex(o => a.startsWith(o))
    const bi = order.findIndex(o => b.startsWith(o))
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
  })
}

// ========== 主流程 ==========
async function main() {
  console.log('='.repeat(50))
  console.log('🌤️  气象今日热点 - 静态数据生成')
  console.log('='.repeat(50))
  
  const startTime = Date.now()
  const today = new Date().toISOString().split('T')[0]
  
  // 1. 拉预警
  console.log('\n[1/2] 拉取气象预警...')
  const warnings = await fetchWarnings()
  console.log(`  ✅ ${warnings.length} 条`)
  fs.writeFileSync(
    path.join(DATA_DIR, 'hotspots.json'),
    JSON.stringify({
      data: warnings,
      lastUpdated: new Date().toISOString(),
      source: 'qweather'
    }, null, 2)
  )
  
  // 2. 拉新闻
  console.log('\n[2/2] 拉取气象新闻...')
  const news = await fetchNews()
  console.log(`  ✅ ${news.length} 条`)
  fs.writeFileSync(
    path.join(DATA_DIR, 'news.json'),
    JSON.stringify({
      data: news,
      lastUpdated: new Date().toISOString()
    }, null, 2)
  )
  
  // 3. 写一份元数据（包含 last update）
  fs.writeFileSync(
    path.join(DATA_DIR, 'meta.json'),
    JSON.stringify({
      lastUpdated: new Date().toISOString(),
      date: today,
      warningCount: warnings.length,
      newsCount: news.length,
      duration: Date.now() - startTime
    }, null, 2)
  )
  
  const duration = ((Date.now() - startTime) / 1000).toFixed(1)
  console.log(`\n✅ 完成 (${duration}s)`)
  console.log(`   输出: ${DATA_DIR}`)
}

main().catch(err => {
  console.error('❌ 失败:', err)
  process.exit(1)
})
