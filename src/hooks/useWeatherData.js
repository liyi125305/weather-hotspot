import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import { REFRESH_INTERVAL } from '../utils/constants'
import { autoTagBatch } from '../utils/autoTagger'

// 数据源模式：
// - 'static'    : 部署模式，从 public/data/*.json 拉（Vercel）
// - 'local'     : 本地模式，从后端 3001 拉（局域网/开发）
const DATA_MODE = import.meta.env.VITE_DATA_SOURCE || 'local'
const API_BASE = DATA_MODE === 'static'
  ? ''
  : (import.meta.env.DEV
      ? '/api'
      : `${window.location.protocol}//${window.location.hostname}:3001/api`)

export function useWeatherData() {
  const [hotspots, setHotspots] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  // dataSource: loading | live | empty | no_api_key | no_backend | api_error
  const [dataSource, setDataSource] = useState('loading')

  const loadData = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true)
    setIsRefreshing(true)
    setError(null)

    try {
      const url = DATA_MODE === 'static' 
        ? `${API_BASE}/data/hotspots.json`
        : `${API_BASE}/hotspots`
      const res = await axios.get(url, { timeout: 15000 })
      
      if (DATA_MODE === 'static') {
        // 静态模式：直接解析文件
        const list = Array.isArray(res.data?.data) ? res.data.data : []
        const tagged = autoTagBatch(list)
        setHotspots(tagged)
        setLastUpdated(new Date(res.data?.lastUpdated || Date.now()))
        setDataSource(tagged.length > 0 ? 'live' : 'empty')
      } else if (res.data.success) {
        // API 模式
        const tagged = autoTagBatch(res.data.data)
        setHotspots(tagged)
        setLastUpdated(new Date(res.data.lastUpdated))
        setDataSource(tagged.length > 0 ? 'live' : 'empty')
      } else {
        setHotspots([])
        setDataSource(res.data.error || 'empty')
        setError({
          type: res.data.error,
          message: res.data.message
        })
      }
    } catch (err) {
      console.warn(DATA_MODE === 'static' ? '静态数据加载失败' : '后端未连接:', err.message)
      setHotspots([])
      setDataSource(DATA_MODE === 'static' ? 'empty' : 'no_backend')
      setError({
        type: DATA_MODE === 'static' ? 'empty' : 'no_backend',
        message: DATA_MODE === 'static' 
          ? '暂无数据（GitHub Actions 可能还没跑过）'
          : '后端服务未启动'
      })
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  const refresh = useCallback(() => {
    loadData(false)
  }, [loadData])

  useEffect(() => {
    loadData()
    const intervalId = setInterval(() => {
      loadData(false)
    }, REFRESH_INTERVAL)
    return () => clearInterval(intervalId)
  }, [loadData])

  // 每日早 8:00 自动刷新
  useEffect(() => {
    let lastTriggeredDate = null
    
    const checkDailyRefresh = () => {
      const now = new Date()
      const hh = now.getHours()
      const mm = now.getMinutes()
      const todayKey = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`
      
      if (hh === 8 && mm < 6 && lastTriggeredDate !== todayKey) {
        lastTriggeredDate = todayKey
        console.log('[定时刷新] 早 8 点数据更新')
        loadData(false)
        
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('🌤️ 气象热点已更新', {
            body: '今日气象预警已就绪',
            icon: '/vite.svg'
          })
        }
      }
    }
    
    const dailyCheckInterval = setInterval(checkDailyRefresh, 60 * 1000)
    checkDailyRefresh()
    
    return () => clearInterval(dailyCheckInterval)
  }, [loadData])

  return {
    hotspots,
    loading,
    error,
    lastUpdated,
    isRefreshing,
    dataSource,
    refresh
  }
}
