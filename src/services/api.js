import axios from 'axios'

const API_BASE = '/api'

// 获取所有气象热点
export async function fetchHotspots() {
  try {
    const response = await axios.get(`${API_BASE}/hotspots`)
    return response.data
  } catch (error) {
    console.error('获取气象数据失败:', error)
    throw error
  }
}

// 获取单个热点详情
export async function fetchHotspotById(id) {
  try {
    const response = await axios.get(`${API_BASE}/hotspots/${id}`)
    return response.data
  } catch (error) {
    console.error('获取热点详情失败:', error)
    throw error
  }
}
