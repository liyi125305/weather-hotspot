// ============================================
// 气象新闻抓取服务
// 拉取权威 RSS，过滤气象相关内容，打标签
// ============================================

import Parser from 'rss-parser'
import { autoTagBatch, getMainTag, getDisplayTags } from '../../src/utils/autoTagger.js'

const parser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'WeatherHotspotApp/1.0'
  }
})

// RSS 源配置（优先权威 + 高频更新）
const NEWS_SOURCES = [
  {
    name: '新华网',
    url: 'https://www.xinhuanet.com/politics/news_politics.xml',
    home: 'https://www.news.cn'
  },
  {
    name: '新华网社会',
    url: 'https://www.xinhuanet.com/world/news_world.xml',
    home: 'https://www.news.cn'
  },
  {
    name: '人民网时政',
    url: 'https://www.people.com.cn/rss/politics.xml',
    home: 'http://politics.people.com.cn'
  },
  {
    name: '人民网社会',
    url: 'http://society.people.com.cn/rss/society.xml',
    home: 'http://society.people.com.cn'
  },
  {
    name: '中新网',
    url: 'https://www.chinanews.com.cn/rss/scroll-news.xml',
    home: 'https://www.chinanews.com.cn'
  }
]

// 气象相关关键词（与 autoTagger 字典匹配：至少匹配一个就保留）
const WEATHER_KEYWORDS = [
  // ====== 基础气象 ======
  '气象', '天气', '预警', '气候',
  
  // ====== 降水 ======
  '暴雨', '暴雪', '大到暴雨', '暴雨到大暴雨', '大暴雨', '特大暴雨',
  '短时强降水', '强降水', '强降雨', '局地暴雨', '山区暴雨',
  '连阴雨', '冻雨', '雨夹雪', '雨凇', '雾凇',
  '降水', '降雨', '降雪', '积雪', '降雨量', '降水量',
  '暴雨红色', '暴雨橙色', '暴雨黄色', '暴雨蓝色',
  
  // ====== 风力 ======
  '台风', '超强台风', '强台风', '热带风暴', '热带低压', '热带气旋',
  '飓风', '龙卷', '龙卷风',
  '大风', '阵风', '狂风', '雷雨大风',
  
  // ====== 强对流 ======
  '强对流', '短时强对流', '强对流天气',
  '雷电', '雷雨', '雷暴', '干雷暴', '强雷暴', '局地雷暴',
  '冰雹', '冰粒', '冰针', '米雪',
  
  // ====== 温度类 ======
  '高温', '持续高温', '酷暑', '酷热', '热浪', '高温红色', '高温橙色',
  '低温', '寒潮', '强降温', '冷空气', '强冷空气', '三股冷空气',
  '降温', '升温', '回温', '倒春寒', '秋老虎',
  '温度', '气温', '昼夜温差', '体感温度',
  
  // ====== 干旱/水情 ======
  '干旱', '伏旱', '春旱', '秋旱', '冬旱',
  '山洪', '洪水', '内涝', '河流', '水位', '汛期', '防汛',
  '风暴潮', '海浪', '巨浪', '海冰', '赤潮',
  
  // ====== 大气视程 ======
  '大雾', '浓雾', '强浓雾', '特强浓雾', '团雾',
  '霾', '雾霾', '重霾', '空气污染', '空气质量',
  '沙尘暴', '强沙尘暴', '扬沙', '浮尘',
  '道路结冰', '电线覆冰', '电线结冰', '线路覆冰',
  '能见度', '低能见度',
  
  // ====== 雪/冰/霜 ======
  '暴雪', '大雪', '中雪', '小雪',
  '霜冻', '早霜', '晚霜', '霜降', '寒露风', '初霜',
  '雪崩', '冰崩', '雪团',
  
  // ====== 气候现象（重点：用户要求补充）======
  '厄尔尼诺', '拉尼娜', 'ENSO',
  '副高', '副热带高压',
  '西风带', '季风', '大陆高压', '高空冷涡', '切断低压',
  '极地涡旋', '极涡', '北极涛动', 'AO',
  
  // ====== 应急/机构 ======
  '应急响应', '应急启动', '应急终止', '应急响应级别', '应急响应等级',
  '省气象局', '市气象局', '气象台', '气象中心', '气象服务',
  '今年第', '台风预警', '暴雨预警', '雷电预警', '高温预警',
  
  // ====== 地理/区域 ======
  '沿海', '海上', '海面', '海区', '海岛', '近海',
  '山区', '山地', '高原', '盆地', '平原', '内陆',
  '河口', '三角洲'
]

let cache = {
  items: [],
  lastUpdated: null
}
const CACHE_TTL = 30 * 60 * 1000 // 30 分钟

/**
 * 拉取并解析所有 RSS 源
 */
export async function fetchNews() {
  // 命中缓存
  if (cache.items.length > 0 && cache.lastUpdated && (Date.now() - cache.lastUpdated < CACHE_TTL)) {
    return { items: cache.items, lastUpdated: cache.lastUpdated.toISOString(), fromCache: true }
  }
  
  console.log('[newsFetcher] 开始拉取 RSS...')
  
  const allItems = []
  
  // 并发拉取所有源
  const results = await Promise.allSettled(
    NEWS_SOURCES.map(async (source) => {
      try {
        const feed = await parser.parseURL(source.url)
        return feed.items.map(item => ({
          source: source.name,
          sourceHome: source.home,
          title: item.title || '',
          url: item.link || '',
          contentSnippet: stripHtml(item.contentSnippet || item.content || ''),
          content: stripHtml(item.content || item.contentSnippet || ''),
          publishedAt: item.pubDate || item.isoDate || new Date().toISOString()
        }))
      } catch (err) {
        console.warn(`[newsFetcher] ${source.name} 拉取失败:`, err.message)
        return []
      }
    })
  )
  
  results.forEach(r => {
    if (r.status === 'fulfilled' && Array.isArray(r.value)) {
      allItems.push(...r.value)
    }
  })
  
  // 过滤：标题或内容包含气象关键词
  const weatherItems = allItems.filter(item => {
    const text = `${item.title} ${item.contentSnippet}`.toLowerCase()
    return WEATHER_KEYWORDS.some(kw => text.includes(kw.toLowerCase()))
  })
  
  // 按发布时间降序
  weatherItems.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
  
  // 取前 50 条
  const top = weatherItems.slice(0, 50)
  
  // 自动打标（复用前端 autoTagger）
  const tagged = autoTagBatch(top.map(item => ({
    ...item,
    summary: item.contentSnippet  // 让 autoTagger 用摘要
  })))
  
  // 处理：补充可读 URL（确保有 http://）
  const processed = tagged.map(item => ({
    id: `news-${hashCode(item.url || item.title)}`,
    type: item.mainTagKey || 'other',
    mainTagKey: item.mainTagKey,
    tags: item.tags || [],
    title: item.title,
    summary: item.contentSnippet,
    source: item.source,
    sourceHome: item.sourceHome,
    url: ensureHttp(item.url),
    publishedAt: normalizeTime(item.publishedAt)
  }))
  
  // 过滤：至少有 1 个 tag 的才保留（避免引入无关新闻）
  const filtered = processed.filter(item => item.tags.length > 0)
  
  console.log(`[newsFetcher] 拉取 ${allItems.length} 条，过滤后 ${filtered.length} 条气象新闻`)
  
  cache.items = filtered
  cache.lastUpdated = new Date()
  
  return {
    items: filtered,
    lastUpdated: cache.lastUpdated.toISOString(),
    fromCache: false
  }
}

function stripHtml(html) {
  if (!html) return ''
  return html
    .replace(/<[^>]+>/g, ' ')       // 去 HTML 标签
    .replace(/&nbsp;/g, ' ')        // 去 &nbsp;
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')           // 合并空白
    .trim()
    .slice(0, 500)                  // 截断避免过长
}

function ensureHttp(url) {
  if (!url) return ''
  if (url.startsWith('http')) return url
  if (url.startsWith('//')) return 'http:' + url
  return 'https://' + url
}

function normalizeTime(t) {
  if (!t) return new Date().toISOString()
  try {
    const d = new Date(t)
    if (isNaN(d.getTime())) return new Date().toISOString()
    return d.toISOString()
  } catch (e) {
    return new Date().toISOString()
  }
}

function hashCode(str) {
  if (!str) return Math.random().toString(36).slice(2)
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h) + str.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h).toString(36)
}
