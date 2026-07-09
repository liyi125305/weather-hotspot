// 气象类型配置
export const WEATHER_TYPES = {
  typhoon: {
    label: '台风',
    emoji: '🌪️',
    color: '#FF6B6B'
  },
  rainstorm: {
    label: '暴雨',
    emoji: '🌧️',
    color: '#4ECDC4'
  },
  heatwave: {
    label: '高温',
    emoji: '🥵',
    color: '#FFD93D'
  },
  coldwave: {
    label: '寒潮',
    emoji: '🥶',
    color: '#74B9FF'
  },
  sandstorm: {
    label: '沙尘',
    emoji: '🌫️',
    color: '#C4A35A'
  },
  fog: {
    label: '大雾',
    emoji: '🌫️',
    color: '#A0AEC0'
  }
}

// 预警等级配置
export const SEVERITY_LEVELS = {
  blue: {
    label: '蓝色',
    color: '#1E90FF',
    bgColor: '#EBF5FF'
  },
  yellow: {
    label: '黄色',
    color: '#FFD700',
    bgColor: '#FFFBEB'
  },
  orange: {
    label: '橙色',
    color: '#FF8C00',
    bgColor: '#FFF7ED'
  },
  red: {
    label: '红色',
    color: '#FF0000',
    bgColor: '#FEF2F2'
  }
}

// 地图配置
export const MAP_CONFIG = {
  center: [35.8617, 104.1954], // 中国中心点
  zoom: 4,
  minZoom: 4,
  maxZoom: 12
}

// 瓦片图层（使用多个备选来源）
export const TILE_LAYER = {
  // CartoDB 浅色底图（不需要代理）
  url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  subdomains: 'abcd'
}

// 刷新间隔（毫秒）
export const REFRESH_INTERVAL = 5 * 60 * 1000 // 5分钟
