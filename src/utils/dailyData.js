// ============================================
// 今日热点数据 - 仅用于演示架构
// 警告：此文件不包含任何真实气象数据
// 真实接入需替换 fetchRealData() 函数
// ============================================

/**
 * 获取真实气象数据（需要接入真实 API）
 * 当前返回空数组，页面会显示"等待接入"状态
 * 
 * 接入方式（推荐）：
 * 1. 心知天气 (https://www.seniverse.com/) - 免费档 1000 次/天
 * 2. 中国气象局 CMA 接口（需爬虫）
 * 3. 和风天气 (https://www.qweather.com/)
 * 4. Caiyun 彩云 (https://caiyunapp.com/)
 * 
 * @returns {Promise<Array>} 真实热点列表
 */
export async function fetchRealData() {
  // TODO: 接入真实数据源
  return []
}

export function buildDailyHotspots() {
  return []
}

export function buildHistoricalHotspots() {
  return {}
}

export function todayKey() {
  const d = new Date()
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`
}
