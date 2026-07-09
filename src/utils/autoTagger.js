// ============================================
// 自动打标器
// 根据事件文本自动匹配标签
// ============================================

import { ALL_TAGS } from './tags.js'

// 关键词映射表（关键词数组 - 命中后触发对应标签）
const KEYWORD_RULES = {
  // 降水类
  'rainstorm-strong': ['暴雨', '强降雨', '强降水'],
  'rainstorm-heavy': ['大暴雨'],
  'rainstorm-extreme': ['特大暴雨', '极端降水'],
  'short-rain': ['短时强降水', '短时强降雨'],
  'continuous-rain': ['连阴雨', '持续阴雨'],
  'freezing-rain': ['冻雨'],
  'sleet': ['雨夹雪'],
  'hail': ['冰雹'],

  // 风力类
  'typhoon-super': ['超强台风'],
  'typhoon-strong': ['强台风'],
  'typhoon': ['台风', '热带气旋'],
  'tropical-storm': ['热带风暴', '热带低压'],
  'strong-wind': ['大风', '6级风', '7级风'],
  'gale': ['狂风', '8级', '9级', '10级'],
  'tornado': ['龙卷风'],
  'thunderstorm-wind': ['雷雨大风', '雷暴大风'],
  'gust': ['阵风'],

  // 低温类
  'cold-wave': ['寒潮', '强降温'],
  'cold-air': ['冷空气', '降温'],
  'frost': ['霜冻', '霜降'],
  'road-ice': ['道路结冰', '路面结冰'],
  'wire-ice': ['电线覆冰', '线路覆冰', '线路结冰'],
  'snow-heavy': ['暴雪'],
  'snow': ['降雪', '大雪', '中雪'],
  'snow-accum': ['积雪'],

  // 高温类
  'heatwave': ['高温'],
  'extreme-heat': ['酷热', '40℃', '40度'],
  'dry-warm-wind': ['干热风'],
  'drought': ['干旱', '伏旱'],

  // 大气视程
  'fog': ['大雾', '雾'],
  'fog-dense': ['浓雾'],
  'fog-extreme': ['强浓雾', '特强浓雾'],
  'haze': ['霾', '雾霾'],
  'sandstorm': ['沙尘暴'],
  'dust-storm-strong': ['强沙尘暴'],
  'dust-float': ['浮尘'],
  'blowing-sand': ['扬沙'],
  'low-visibility': ['低能见度'],

  // 强对流
  'thunder': ['雷电'],
  'thunderstorm': ['雷暴'],
  'convection': ['强对流'],

  // 水文/海洋
  'storm-surge': ['风暴潮'],
  'wave': ['海浪', '巨浪'],
  'flash-flood': ['山洪', '洪涝'],
  'flood': ['洪水', '中小河流洪水'],
  'mudslide': ['泥石流'],
  'landslide': ['滑坡', '崩塌'],
  'agriculture-risk': ['农业气象', '农业风险', '农业']
}

// ============================================
// 影响范围标签触发（基于文本中范围词）
// ============================================

const SCOPE_RULES = {
  'scope-local': ['局地', '局部', '部分'],
  'scope-regional': ['区域', '全省', '全市', '全区'],
  'scope-basin': ['流域', '长江', '黄河', '珠江'],
  'scope-national': ['全国', '大部', '大范围']
}

// ============================================
// 时间特征标签
// ============================================

const TEMPORAL_RULES = {
  'temp-continuous': ['持续', '连续', '长期'],
  'temp-short': ['短时', '短时性', '短期内'],
  'temp-sudden': ['突发', '骤然', '突然'],
  'temp-morning': ['清晨', '早晨', '上午'],
  'temp-afternoon': ['午后', '下午'],
  'temp-night': ['夜间', '夜晚', '夜里', '凌晨']
}

// ============================================
// 行业影响标签（基于行业关键词）
// ============================================

const IMPACT_RULES = {
  'impact-power': ['电力', '电网', '输电', '变电站', '线路', '供电'],
  'impact-traffic': ['交通', '公路', '高速', '铁路', '机场', '航班', '航运', '出行'],
  'impact-city': ['城市', '排水', '内涝', '市政'],
  'impact-agriculture': ['农业', '作物', '农田', '畜牧', '水产', '种植', '秋收', '秋种'],
  'impact-outdoor': ['户外作业', '建筑工地', '施工', '矿山', '户外'],
  'impact-health': ['健康', '中暑', '感冒', '呼吸道', '心血管'],
  'impact-water': ['水库', '河道', '防汛', '水文', '水利'],
  'impact-tourism': ['旅游', '景区', '出行', '登山']
}

// ============================================
// 季节性场景标签
// ============================================

const SEASON_RULES = {
  'season-spring-travel': ['春运'],
  'season-summer-peak': ['迎峰度夏', '用电高峰'],
  'season-winter-peak': ['迎峰度冬', '冬季供暖'],
  'season-harvest': ['秋收', '秋种', '秋收秋种'],
  'season-summer-farm': ['三夏', '夏收', '夏种', '夏管'],
  'season-meeting': ['两会']
}

// ============================================
// 主标签选取规则
// ============================================

// 哪些 tag 是主标签（在展示时作为"最核心一个"显示）
const MAIN_TAG_RULES = {
  'typhoon': ['typhoon-super', 'typhoon-strong', 'typhoon', 'tropical-storm'],
  'rainstorm': ['rainstorm-strong', 'rainstorm-heavy', 'rainstorm-extreme'],
  'cold-wave': ['cold-wave'],
  'snow': ['snow-heavy', 'snow'],
  'heatwave': ['heatwave', 'extreme-heat'],
  'fog': ['fog', 'fog-dense', 'fog-extreme'],
  'sandstorm': ['sandstorm', 'dust-storm-strong', 'blowing-sand'],
  'wind': ['tornado', 'gale', 'strong-wind', 'thunderstorm-wind']
}

const SEVERITY_HINTS = ['红色预警', '橙色预警', '黄色预警', '蓝色预警']

/**
 * 自动打标
 * @param {Object} hotspot 原始热点数据
 * @returns {Object} hotspot 增强版：增加 tags 数组 + mainTagKey
 */
export function autoTag(hotspot) {
  // 合并所有文本用于匹配
  const text = [
    hotspot.title || '',
    hotspot.summary || '',
    hotspot.severity ? `${hotspot.severity}预警` : ''
  ].join('|')

  const matchedTags = []

  // 1. 匹配现象类（最优先）
  Object.entries(KEYWORD_RULES).forEach(([tagKey, keywords]) => {
    if (keywords.some(kw => text.includes(kw))) {
      matchedTags.push(tagKey)
    }
  })

  // 2. 匹配影响范围
  Object.entries(SCOPE_RULES).forEach(([tagKey, keywords]) => {
    if (keywords.some(kw => text.includes(kw))) {
      matchedTags.push(tagKey)
    }
  })

  // 3. 匹配时间特征
  Object.entries(TEMPORAL_RULES).forEach(([tagKey, keywords]) => {
    if (keywords.some(kw => text.includes(kw))) {
      matchedTags.push(tagKey)
    }
  })

  // 4. 匹配行业影响
  Object.entries(IMPACT_RULES).forEach(([tagKey, keywords]) => {
    if (keywords.some(kw => text.includes(kw))) {
      matchedTags.push(tagKey)
    }
  })

  // 5. 匹配季节
  Object.entries(SEASON_RULES).forEach(([tagKey, keywords]) => {
    if (keywords.some(kw => text.includes(kw))) {
      matchedTags.push(tagKey)
    }
  })

  // 去重
  const uniqueTags = [...new Set(matchedTags)]

  // 按 priority 排序
  uniqueTags.sort((a, b) => {
    const pA = ALL_TAGS[a]?.priority || 99
    const pB = ALL_TAGS[b]?.priority || 99
    return pA - pB
  })

  // 选取最核心一个（规则：现象类中 priority 最低的）
  const phenomenonTags = uniqueTags.filter(k => ALL_TAGS[k]?.category === 'phenomenon')
  const mainTagKey = phenomenonTags[0] || uniqueTags[0] || null

  return {
    ...hotspot,
    tags: uniqueTags,
    mainTagKey
  }
}

/**
 * 批量打标
 */
export function autoTagBatch(hotspots) {
  return hotspots.map(autoTag)
}

/**
 * 获取主标签对象
 */
export function getMainTag(hotspot) {
  const key = hotspot.mainTagKey
  return key ? ALL_TAGS[key] : null
}

/**
 * 获取所有展示标签（按优先级排列，去掉主标签后只显示副标签）
 */
export function getDisplayTags(hotspot) {
  return (hotspot.tags || [])
    .map(k => ALL_TAGS[k])
    .filter(Boolean)
}
