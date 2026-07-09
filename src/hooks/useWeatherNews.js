import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'

const DATA_MODE = import.meta.env.VITE_DATA_SOURCE || 'local'
const API_BASE = DATA_MODE === 'static'
  ? ''
  : (import.meta.env.DEV
      ? '/api'
      : `${window.location.protocol}//${window.location.hostname}:3001/api`)

export function useWeatherNews() {
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [isCapturing, setIsCapturing] = useState(false)

  const loadNews = useCallback(async () => {
    try {
      const url = DATA_MODE === 'static'
        ? `${API_BASE}/data/news.json`
        : `${API_BASE}/news`
      const res = await axios.get(url, { timeout: 30000 })
      const items = Array.isArray(res.data?.data) ? res.data.data : []
      setNews(items)
      setLastUpdated(new Date(res.data?.lastUpdated || Date.now()))
    } catch (err) {
      console.warn('新闻拉取失败:', err.message)
      setError({ message: err.message })
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * 手动触发补录（仅本地模式有效）
   */
  const capture = useCallback(async () => {
    if (DATA_MODE === 'static') {
      throw new Error('静态模式下无法手动补录，请等待每日自动更新')
    }
    setIsCapturing(true)
    try {
      const res = await axios.post(`${API_BASE}/snapshot/capture`, {}, { timeout: 60000 })
      if (res.data.success) {
        await loadNews()
        return res.data
      } else {
        throw new Error(res.data.error || '补录失败')
      }
    } catch (err) {
      console.error('补录失败:', err)
      throw err
    } finally {
      setIsCapturing(false)
    }
  }, [loadNews])

  useEffect(() => {
    loadNews()
  }, [loadNews])

  // 每日早 8:00 自动触发补录
  useEffect(() => {
    let lastTriggeredDate = null
    const checkDailyCapture = () => {
      const now = new Date()
      const hh = now.getHours()
      const mm = now.getMinutes()
      const todayKey = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`
      if (hh === 8 && mm < 6 && lastTriggeredDate !== todayKey) {
        lastTriggeredDate = todayKey
        console.log('[客户端定时] 早 8 点补录')
        capture().catch(err => console.warn('自动补录失败:', err))
      }
    }
    const interval = setInterval(checkDailyCapture, 60 * 1000)
    checkDailyCapture()
    return () => clearInterval(interval)
  }, [capture])

  return { news, loading, error, lastUpdated, isCapturing, refresh: loadNews, capture }
}
