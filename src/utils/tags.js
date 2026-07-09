// ============================================
// 气象事件标签体系 (Meteorological Event Tags)
// ============================================
// 每个标签包含：
//   key:    唯一标识
//   label:  中文显示名
//   icon:   emoji 图标
//   color:  主题色
//   priority: 展示优先级 (数字越小越优先)
//   category: 所属分类
// ============================================

export const TAG_CATEGORIES = {
  PHENOMENON: 'phenomenon',       // 气象现象
  SCOPE: 'scope',                  // 影响范围
  TEMPORAL: 'temporal',            // 时间特征
  IMPACT: 'impact',                // 行业影响
  SEASON: 'season'                 // 季节/时期
}

// ============================================
// 1. 气象现象类（主标签）
// ============================================

export const PHENOMENON_TAGS = {
  // 降水
  'rainstorm-strong': { key: 'rainstorm-strong', label: '暴雨', icon: '🌧️', color: '#0891B2', priority: 1, category: 'phenomenon', main: true },
  'rainstorm-heavy': { key: 'rainstorm-heavy', label: '大暴雨', icon: '🌧️', color: '#0E7490', priority: 1, category: 'phenomenon' },
  'rainstorm-extreme': { key: 'rainstorm-extreme', label: '特大暴雨', icon: '⛈️', color: '#155E75', priority: 1, category: 'phenomenon' },
  'short-rain': { key: 'short-rain', label: '短时强降水', icon: '🌦️', color: '#67E8F9', priority: 2, category: 'phenomenon' },
  'continuous-rain': { key: 'continuous-rain', label: '连阴雨', icon: '🌥️', color: '#7DD3FC', priority: 3, category: 'phenomenon' },
  'freezing-rain': { key: 'freezing-rain', label: '冻雨', icon: '🧊', color: '#818CF8', priority: 2, category: 'phenomenon' },
  'sleet': { key: 'sleet', label: '雨夹雪', icon: '🌨️', color: '#A5B4FC', priority: 2, category: 'phenomenon' },
  'hail': { key: 'hail', label: '冰雹', icon: '🧊', color: '#A78BFA', priority: 1, category: 'phenomenon' },

  // 风力
  'typhoon-super': { key: 'typhoon-super', label: '超强台风', icon: '🌀', color: '#DC2626', priority: 1, category: 'phenomenon', main: true },
  'typhoon-strong': { key: 'typhoon-strong', label: '强台风', icon: '🌀', color: '#EF4444', priority: 1, category: 'phenomenon', main: true },
  'typhoon': { key: 'typhoon', label: '台风', icon: '🌀', color: '#F87171', priority: 1, category: 'phenomenon', main: true },
  'tropical-storm': { key: 'tropical-storm', label: '热带风暴', icon: '🌪️', color: '#FB923C', priority: 2, category: 'phenomenon' },
  'strong-wind': { key: 'strong-wind', label: '大风', icon: '🌬️', color: '#94A3B8', priority: 2, category: 'phenomenon' },
  'gale': { key: 'gale', label: '狂风', icon: '💨', color: '#64748B', priority: 1, category: 'phenomenon' },
  'tornado': { key: 'tornado', label: '龙卷风', icon: '🌪️', color: '#7C3AED', priority: 1, category: 'phenomenon' },
  'thunderstorm-wind': { key: 'thunderstorm-wind', label: '雷雨大风', icon: '⛈️', color: '#A78BFA', priority: 2, category: 'phenomenon' },
  'gust': { key: 'gust', label: '阵风', icon: '💨', color: '#94A3B8', priority: 3, category: 'phenomenon' },

  // 低温
  'cold-wave': { key: 'cold-wave', label: '寒潮', icon: '🥶', color: '#3B82F6', priority: 1, category: 'phenomenon', main: true },
  'cold-air': { key: 'cold-air', label: '强冷空气', icon: '❄️', color: '#60A5FA', priority: 2, category: 'phenomenon' },
  'frost': { key: 'frost', label: '霜冻', icon: '🌾', color: '#A7C7E7', priority: 2, category: 'phenomenon' },
  'road-ice': { key: 'road-ice', label: '道路结冰', icon: '🛣️', color: '#7DD3FC', priority: 2, category: 'phenomenon' },
  'wire-ice': { key: 'wire-ice', label: '电线覆冰', icon: '⚡', color: '#818CF8', priority: 2, category: 'phenomenon', impact: '电力' },
  'snow-heavy': { key: 'snow-heavy', label: '暴雪', icon: '🌨️', color: '#E0E7FF', priority: 1, category: 'phenomenon' },
  'snow': { key: 'snow', label: '降雪', icon: '❄️', color: '#DBEAFE', priority: 2, category: 'phenomenon' },
  'snow-accum': { key: 'snow-accum', label: '积雪', icon: '🏔️', color: '#E0F2FE', priority: 3, category: 'phenomenon' },

  // 高温
  'heatwave': { key: 'heatwave', label: '高温', icon: '🥵', color: '#F59E0B', priority: 1, category: 'phenomenon', main: true },
  'extreme-heat': { key: 'extreme-heat', label: '酷热', icon: '🔥', color: '#DC2626', priority: 1, category: 'phenomenon' },
  'dry-warm-wind': { key: 'dry-warm-wind', label: '干热风', icon: '🌾', color: '#FBBF24', priority: 3, category: 'phenomenon' },
  'drought': { key: 'drought', label: '干旱', icon: '🏜️', color: '#CA8A04', priority: 2, category: 'phenomenon' },

  // 大气视程
  'fog': { key: 'fog', label: '大雾', icon: '🌫️', color: '#9CA3AF', priority: 1, category: 'phenomenon', main: true },
  'fog-dense': { key: 'fog-dense', label: '浓雾', icon: '🌫️', color: '#6B7280', priority: 2, category: 'phenomenon' },
  'fog-extreme': { key: 'fog-extreme', label: '强浓雾', icon: '🌫️', color: '#4B5563', priority: 2, category: 'phenomenon' },
  'haze': { key: 'haze', label: '霾', icon: '😷', color: '#A16207', priority: 3, category: 'phenomenon' },
  'sandstorm': { key: 'sandstorm', label: '沙尘暴', icon: '🌫️', color: '#A78BFA', priority: 1, category: 'phenomenon', main: true },
  'dust-storm-strong': { key: 'dust-storm-strong', label: '强沙尘暴', icon: '🌫️', color: '#7C3AED', priority: 1, category: 'phenomenon' },
  'dust-float': { key: 'dust-float', label: '浮尘', icon: '🌬️', color: '#D6D3D1', priority: 3, category: 'phenomenon' },
  'blowing-sand': { key: 'blowing-sand', label: '扬沙', icon: '🌫️', color: '#A8A29E', priority: 2, category: 'phenomenon' },
  'low-visibility': { key: 'low-visibility', label: '低能见度', icon: '🌁', color: '#9CA3AF', priority: 3, category: 'phenomenon' },

  // 强对流
  'thunder': { key: 'thunder', label: '雷电', icon: '⚡', color: '#FBBF24', priority: 2, category: 'phenomenon' },
  'thunderstorm': { key: 'thunderstorm', label: '雷暴', icon: '⛈️', color: '#F59E0B', priority: 2, category: 'phenomenon' },
  'convection': { key: 'convection', label: '强对流', icon: '⚡', color: '#FB923C', priority: 2, category: 'phenomenon' },

  // 水文/海洋
  'storm-surge': { key: 'storm-surge', label: '风暴潮', icon: '🌊', color: '#1E40AF', priority: 2, category: 'phenomenon' },
  'wave': { key: 'wave', label: '海浪', icon: '🌊', color: '#0EA5E9', priority: 3, category: 'phenomenon' },
  'flood': { key: 'flood', label: '洪水', icon: '🌊', color: '#0369A1', priority: 2, category: 'phenomenon' },
  'flash-flood': { key: 'flash-flood', label: '山洪', icon: '🌊', color: '#0284C7', priority: 2, category: 'phenomenon' },
  'mudslide': { key: 'mudslide', label: '泥石流', icon: '⛰️', color: '#92400E', priority: 2, category: 'phenomenon' },
  'landslide': { key: 'landslide', label: '滑坡', icon: '⛰️', color: '#A16207', priority: 2, category: 'phenomenon' },
  'agriculture-risk': { key: 'agriculture-risk', label: '农业风险', icon: '🌾', color: '#84CC16', priority: 2, category: 'phenomenon' }
}

// ============================================
// 2. 影响范围（次标签）
// ============================================

export const SCOPE_TAGS = {
  'scope-local': { key: 'scope-local', label: '局地', icon: '📍', color: '#64748B', priority: 10, category: 'scope' },
  'scope-regional': { key: 'scope-regional', label: '区域性', icon: '🗺️', color: '#475569', priority: 10, category: 'scope' },
  'scope-basin': { key: 'scope-basin', label: '流域性', icon: '🏞️', color: '#334155', priority: 10, category: 'scope' },
  'scope-national': { key: 'scope-national', label: '全国性', icon: '🇨🇳', color: '#1E293B', priority: 10, category: 'scope' }
}

// ============================================
// 3. 时间特征（次标签）
// ============================================

export const TEMPORAL_TAGS = {
  'temp-continuous': { key: 'temp-continuous', label: '持续性', icon: '⏳', color: '#9333EA', priority: 12, category: 'temporal' },
  'temp-short': { key: 'temp-short', label: '短时性', icon: '⚡', color: '#A855F7', priority: 12, category: 'temporal' },
  'temp-sudden': { key: 'temp-sudden', label: '突发性', icon: '💥', color: '#C026D3', priority: 12, category: 'temporal' },
  'temp-morning': { key: 'temp-morning', label: '清晨', icon: '🌅', color: '#F472B6', priority: 13, category: 'temporal' },
  'temp-afternoon': { key: 'temp-afternoon', label: '午后', icon: '☀️', color: '#FB923C', priority: 13, category: 'temporal' },
  'temp-night': { key: 'temp-night', label: '夜间', icon: '🌙', color: '#6366F1', priority: 13, category: 'temporal' }
}

// ============================================
// 4. 行业影响（次标签 - 适合能源电力场景）
// ============================================

export const IMPACT_TAGS = {
  'impact-power': { key: 'impact-power', label: '电力', icon: '⚡', color: '#EAB308', priority: 11, category: 'impact' },
  'impact-traffic': { key: 'impact-traffic', label: '交通', icon: '🚗', color: '#06B6D4', priority: 11, category: 'impact' },
  'impact-city': { key: 'impact-city', label: '城市运行', icon: '🏙️', color: '#3B82F6', priority: 11, category: 'impact' },
  'impact-agriculture': { key: 'impact-agriculture', label: '农业', icon: '🌾', color: '#84CC16', priority: 11, category: 'impact' },
  'impact-outdoor': { key: 'impact-outdoor', label: '户外作业', icon: '🏗️', color: '#F97316', priority: 11, category: 'impact' },
  'impact-health': { key: 'impact-health', label: '健康', icon: '❤️', color: '#EC4899', priority: 11, category: 'impact' },
  'impact-water': { key: 'impact-water', label: '水文水利', icon: '💧', color: '#0EA5E9', priority: 11, category: 'impact' },
  'impact-tourism': { key: 'impact-tourism', label: '旅游', icon: '🏖️', color: '#06B6D4', priority: 11, category: 'impact' }
}

// ============================================
// 5. 季节/时期（次标签）
// ============================================

export const SEASON_TAGS = {
  'season-spring-travel': { key: 'season-spring-travel', label: '春运', icon: '🚆', color: '#EF4444', priority: 13, category: 'season' },
  'season-summer-peak': { key: 'season-summer-peak', label: '迎峰度夏', icon: '☀️', color: '#F97316', priority: 13, category: 'season' },
  'season-winter-peak': { key: 'season-winter-peak', label: '迎峰度冬', icon: '❄️', color: '#3B82F6', priority: 13, category: 'season' },
  'season-harvest': { key: 'season-harvest', label: '秋收秋种', icon: '🌾', color: '#CA8A04', priority: 13, category: 'season' },
  'season-summer-farm': { key: 'season-summer-farm', label: '三夏生产', icon: '🌾', color: '#84CC16', priority: 13, category: 'season' },
  'season-meeting': { key: 'season-meeting', label: '两会保障', icon: '🏛️', color: '#DC2626', priority: 13, category: 'season' }
}

// ============================================
// 合并所有标签
// ============================================

export const ALL_TAGS = {
  ...PHENOMENON_TAGS,
  ...SCOPE_TAGS,
  ...TEMPORAL_TAGS,
  ...IMPACT_TAGS,
  ...SEASON_TAGS
}

export const CATEGORY_NAMES = {
  phenomenon: '气象现象',
  scope: '影响范围',
  temporal: '时间特征',
  impact: '行业影响',
  season: '季节时期'
}

// 按分类获取标签
export function getTagsByCategory(category) {
  return Object.values(ALL_TAGS)
    .filter(tag => tag.category === category)
    .sort((a, b) => a.priority - b.priority)
}

// 根据 key 列表获取标签对象
export function getTagsByKeys(keys) {
  return (keys || []).map(k => ALL_TAGS[k]).filter(Boolean)
}
