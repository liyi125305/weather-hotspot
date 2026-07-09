// 和风天气 QWeather 真实数据接入
// 免费档：1000 次/天
// 文档：https://dev.qweather.com/docs/api/warning/weather-warning/

import axios from 'axios'

// 延迟读取环境变量（避免模块加载时序问题）
function getEnv() {
  return {
    API_KEY: process.env.QWEATHER_API_KEY,
    API_HOST: process.env.QWEATHER_API_HOST || 'devapi.qweather.com'
  }
}
function apiBase() { return `https://${getEnv().API_HOST}/v7` }
function geoBase() { return `https://${getEnv().API_HOST}/v2` }

// 31 个省会/直辖市的 LocationID（和风天气固定 ID）
// 来源：https://github.com/qwd/LocationList
const PROVINCES = [
  { name: '北京', adcode: 110000, locId: '101010100' },
  { name: '天津', adcode: 120000, locId: '101030100' },
  { name: '石家庄', adcode: 130000, locId: '101090101' },
  { name: '太原', adcode: 140000, locId: '101100101' },
  { name: '呼和浩特', adcode: 150000, locId: '101080101' },
  { name: '沈阳', adcode: 210000, locId: '101070101' },
  { name: '长春', adcode: 220000, locId: '101060101' },
  { name: '哈尔滨', adcode: 230000, locId: '101050101' },
  { name: '上海', adcode: 310000, locId: '101020100' },
  { name: '南京', adcode: 320000, locId: '101190101' },
  { name: '杭州', adcode: 330000, locId: '101210101' },
  { name: '合肥', adcode: 340000, locId: '101220101' },
  { name: '福州', adcode: 350000, locId: '101230101' },
  { name: '南昌', adcode: 360000, locId: '101240101' },
  { name: '济南', adcode: 370000, locId: '101120101' },
  { name: '郑州', adcode: 410000, locId: '101180101' },
  { name: '武汉', adcode: 420000, locId: '101200101' },
  { name: '长沙', adcode: 430000, locId: '101250101' },
  { name: '广州', adcode: 440000, locId: '101280101' },
  { name: '南宁', adcode: 450000, locId: '101300101' },
  { name: '海口', adcode: 460000, locId: '101310101' },
  { name: '重庆', adcode: 500000, locId: '101040100' },
  { name: '成都', adcode: 510000, locId: '101270101' },
  { name: '贵阳', adcode: 520000, locId: '101260101' },
  { name: '昆明', adcode: 530000, locId: '101290101' },
  { name: '拉萨', adcode: 540000, locId: '101140101' },
  { name: '西安', adcode: 610000, locId: '101110101' },
  { name: '兰州', adcode: 620000, locId: '101160101' },
  { name: '西宁', adcode: 630000, locId: '101150101' },
  { name: '银川', adcode: 640000, locId: '101170101' },
  { name: '乌鲁木齐', adcode: 650000, locId: '101130101' }
]

// 和风天气预警类型 → 前端 type 映射
// type 字段是数字字符串 (10xx 系列)，typeName 是中文名（更直观）
// 主映射用 typeName 兜底用 type 数字
const TYPE_NAME_MAP = {
  '台风': 'typhoon',
  '暴雨': 'rainstorm',
  '暴雪': 'snow',
  '寒潮': 'coldwave',
  '大风': 'strong-wind',
  '沙尘暴': 'sandstorm',
  '高温': 'heatwave',
  '干旱': 'drought',
  '雷电': 'thunder',
  '冰雹': 'hail',
  '霜冻': 'frost',
  '大雾': 'fog',
  '霾': 'haze',
  '道路结冰': 'road-ice',
  '森林火险': 'forest-fire',
  '雷雨大风': 'gust',
  '低温': 'low-temp',
  '海区大风': 'sea-wind',
  '雪灾': 'snow-storm',
  // 新发现
  '中小河流洪水': 'flood',           // 洪水
  '山洪灾害': 'flash-flood',        // 山洪
  '强对流': 'convection',           // 强对流
  '农业气象风险': 'agriculture-risk'
}

const TYPE_NUM_MAP = {
  '1001': 'typhoon',
  '1002': 'rainstorm',
  '1003': 'snow',
  '1004': 'coldwave',
  '1005': 'strong-wind',
  '1006': 'sandstorm',
  '1007': 'heatwave',
  '1008': 'drought',
  '1009': 'convection',
  '1010': 'fog',
  '1011': 'haze',
  '1012': 'hail',
  '1013': 'road-ice',
  '1014': 'thunder',
  '1015': 'gust',
  '1016': 'frost',
  '1017': 'drought-other',
  '1018': 'low-temp',
  '1019': 'sea-wind',
  '1020': 'snow-storm',
  '1021': 'flood',
  '1022': 'flash-flood',
  '1023': 'forest-fire'
}

// 预警等级 → 前端 severity 映射（和风用汉字）
const SEVERITY_MAP = {
  '蓝色': 'blue',
  '黄色': 'yellow',
  '橙色': 'orange',
  '红色': 'red',
  '白色': 'blue'  // 沿海地区有白色预警
}

/**
 * 检查 API Key 是否配置
 */
export function checkApiKey() {
  const key = getEnv().API_KEY
  if (!key || key === 'your_key_here' || key.length < 10) {
    return { valid: false, reason: 'no_api_key' }
  }
  return { valid: true }
}

/**
 * 拉取所有省会城市的预警信息
 */
export async function fetchWeatherData() {
  const keyCheck = checkApiKey()
  if (!keyCheck.valid) {
    return { error: 'no_api_key', message: '未配置和风天气 API Key' }
  }
  
  try {
    const { API_KEY, API_HOST } = getEnv()
    // 并发拉取所有省份的预警
    const results = await Promise.allSettled(
      PROVINCES.map(p => fetchWarningForCity(p, API_KEY))
    )
    
    // 合并所有有效预警
    const allWarnings = []
    results.forEach((result, idx) => {
      if (result.status === 'fulfilled' && result.value) {
        allWarnings.push(...result.value)
      } else if (result.status === 'rejected') {
        console.warn(`${PROVINCES[idx].name} 预警查询失败:`, result.reason?.message)
      }
    })
    
    if (allWarnings.length === 0) {
      return { 
        data: [], 
        lastUpdated: new Date().toISOString(),
        message: '当前无活跃气象预警'
      }
    }
    
    return {
      data: allWarnings,
      lastUpdated: new Date().toISOString()
    }
  } catch (err) {
    console.error('和风天气 API 调用失败:', err.message)
    return { error: 'api_error', message: err.message }
  }
}

/**
 * 查询单个城市的预警
 */
async function fetchWarningForCity(province, apiKey) {
  const url = `${apiBase()}/warning/now?location=${province.locId}&key=${apiKey}`
  
  const res = await axios.get(url, { 
    timeout: 8000,
    headers: { 'User-Agent': 'WeatherHotspotApp/1.0' }
  })
  
  if (res.data.code !== '200') {
    // 204: 该城市当前无预警
    if (res.data.code === '204') return []
    throw new Error(`和风天气 API 错误: ${res.data.code} - ${res.data.code === '401' ? 'API Key 无效' : '未知错误'}`)
  }
  
  const warnings = res.data.warning || []
  // 预先获取坐标（一次）
  const coords = await getLocationCoords(province, apiKey)
  
  return warnings.map((w, idx) => ({
    id: `${province.locId}-${w.id || idx}-${w.pubTime || Date.now()}`,
    type: mapWarningType(w.typeName) || TYPE_NUM_MAP[w.type] || 'other',
    rawType: w.typeName || w.type,  // 保留原始类型名供调试
    title: w.title || `${province.name}气象预警`,
    location: coords,
    province: province.name,
    provinceCode: province.adcode,
    severity: SEVERITY_MAP[w.level] || 'blue',
    source: w.sender || '中国气象局',
    publishedAt: normalizeTime(w.pubTime),
    summary: w.text || w.title || '',
    detailUrl: w.url || null
  }))
}

/**
 * 智能匹配预警类型 - 处理"中小河流洪水"、"山洪灾害"等组合词
 */
function mapWarningType(typeName) {
  if (!typeName) return null
  // 精确匹配
  if (TYPE_NAME_MAP[typeName]) return TYPE_NAME_MAP[typeName]
  // 子串匹配
  for (const [key, value] of Object.entries(TYPE_NAME_MAP)) {
    if (typeName.includes(key)) return value
  }
  return null
}

/**
 * 缓存城市坐标（避免重复调用）
 */
const coordsCache = new Map()
async function getLocationCoords(province, apiKey) {
  if (coordsCache.has(province.locId)) {
    return coordsCache.get(province.locId)
  }
  
  try {
    const url = `${geoBase()}/city/lookup?location=${province.locId}&key=${apiKey}`
    const res = await axios.get(url, { timeout: 5000 })
    if (res.data.code === '200' && res.data.location?.[0]) {
      const loc = res.data.location[0]
      const coords = [parseFloat(loc.lon), parseFloat(loc.lat)]
      coordsCache.set(province.locId, coords)
      return coords
    }
  } catch (err) {
    // 忽略，下次重试
  }
  
  // 兜底：使用省会城市的默认坐标
  const fallback = FALLBACK_COORDS[province.adcode] || [104.1954, 35.8617]
  return fallback
}

// 省会城市默认坐标（兜底用）
const FALLBACK_COORDS = {
  110000: [116.4074, 39.9042], // 北京
  120000: [117.1901, 39.1255], // 天津
  130000: [114.5149, 38.0428], // 石家庄
  140000: [112.5489, 37.8706], // 太原
  150000: [111.7519, 40.8414], // 呼和浩特
  210000: [123.4291, 41.7968], // 沈阳
  220000: [125.3245, 43.8868], // 长春
  230000: [126.6428, 45.7569], // 哈尔滨
  310000: [121.4737, 31.2304], // 上海
  320000: [118.7969, 32.0603], // 南京
  330000: [121.4737, 29.1832], // 杭州（近似）
  340000: [117.2272, 31.8206], // 合肥
  350000: [119.2965, 26.0745], // 福州
  360000: [115.8921, 28.6765], // 南昌
  370000: [117.0009, 36.6758], // 济南
  410000: [113.6253, 34.7466], // 郑州
  420000: [114.3419, 30.5461], // 武汉
  430000: [112.9388, 28.2282], // 长沙
  440000: [113.2644, 23.1291], // 广州
  450000: [108.3669, 22.8170], // 南宁
  460000: [110.3312, 20.0319], // 海口
  500000: [106.5516, 29.5630], // 重庆
  510000: [104.0658, 30.6592], // 成都
  520000: [106.7135, 26.5783], // 贵阳
  530000: [102.8329, 24.8801], // 昆明
  540000: [91.1409, 29.6500],  // 拉萨
  610000: [108.9398, 34.3416], // 西安
  620000: [103.8343, 36.0611], // 兰州
  630000: [100.9018, 36.4828], // 西宁
  640000: [106.2309, 38.4872], // 银川
  650000: [87.6177, 43.7928]   // 乌鲁木齐
}

/**
 * 标准化时间字符串（和风返回格式：2026-07-06T15:00+08:00）
 */
function normalizeTime(t) {
  if (!t) return new Date().toISOString()
  try {
    // 把 "+08:00" 转成标准 ISO 格式
    const iso = t.replace(/(\+\d{2})(\d{2})$/, '$1:$2')
    return new Date(iso).toISOString()
  } catch (e) {
    return new Date().toISOString()
  }
}

export async function fetchTyphoonData() {
  // TODO: 接入和风天气台风路径 API
  return []
}

export async function fetchHistoricalData() {
  // TODO: 接入和风天气历史预警数据
  return {}
}
