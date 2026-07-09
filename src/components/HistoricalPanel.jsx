import { useState, useMemo } from 'react'
import axios from 'axios'
import { WEATHER_TYPES, SEVERITY_LEVELS } from '../utils/constants'
import { autoTagBatch } from '../utils/autoTagger'

const API_BASE = '/api'

// 获取历史数据
export async function fetchHistorical() {
  try {
    const response = await axios.get(`${API_BASE}/historical`)
    if (response.data.success) {
      // 自动打标
      const taggedDays = {}
      Object.entries(response.data.data).forEach(([day, items]) => {
        taggedDays[day] = autoTagBatch(items)
      })
      return { ...response.data, data: taggedDays }
    }
    return response.data
  } catch (error) {
    console.log('暂无历史数据（需接入真实 API）')
    return { success: true, data: {}, lastUpdated: new Date().toISOString() }
  }
}

export function HistoricalPanel({ open, onClose, onShowDay }) {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState(null)
  const [selectedDay, setSelectedDay] = useState(null)

  // 加载历史数据
  const loadHistorical = async () => {
    setLoading(true)
    try {
      const result = await fetchHistorical()
      setData(result.data)
    } catch (error) {
      // 极端兜底：连 buildHistoricalHotspots 都失败时，返回空
      setData({})
    } finally {
      setLoading(false)
    }
  }

  // 打开面板时自动加载
  useMemo(() => {
    if (open && !data) {
      loadHistorical()
    }
  }, [open])

  if (!open) return null

  const days = data ? Object.keys(data).sort().reverse() : []
  const totalCount = data ? days.reduce((sum, day) => sum + data[day].length, 0) : 0

  return (
    <div className="fixed inset-0 bg-black/40 z-[2000] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[80vh] flex flex-col overflow-hidden">
        {/* 头部 */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">📜 历史热点查询</h2>
            <p className="text-xs text-gray-500 mt-1">
              {loading ? '加载中...' : `近 7 天共 ${totalCount} 条热点记录`}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 text-xl"
          >
            ×
          </button>
        </div>

        {/* 内容 */}
        <div className="flex flex-1 overflow-hidden">
          {/* 左侧：日期列表 */}
          <div className="w-56 border-r border-gray-200 overflow-y-auto bg-gray-50">
            <div className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">日期</div>
            {days.map(day => {
              const count = data[day].length
              const isActive = day === selectedDay
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`
                    w-full text-left px-4 py-3 border-l-4 transition-all
                    ${isActive 
                      ? 'bg-white border-sky-500 shadow-sm' 
                      : 'border-transparent hover:bg-white/50'
                    }
                  `}
                >
                  <div className="font-medium text-gray-800">{formatDate(day)}</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {day === days[0] ? '昨天' : `${count} 条记录`}
                  </div>
                </button>
              )
            })}
          </div>

          {/* 右侧：当日热点详情 */}
          <div className="flex-1 overflow-y-auto p-6">
            {!selectedDay ? (
              <div className="h-full flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <div className="text-4xl mb-2">📅</div>
                  <p>请选择左侧日期查看历史热点</p>
                </div>
              </div>
            ) : data[selectedDay].length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-400">
                该日无气象预警记录
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  onClick={() => onShowDay(data[selectedDay])}
                  className="mb-4 px-4 py-2 bg-sky-500 text-white rounded-lg text-sm hover:bg-sky-600 transition-colors"
                >
                  🗺️ 在地图上显示该日热点
                </button>
                {data[selectedDay].map(hotspot => {
                  const weatherConfig = WEATHER_TYPES[hotspot.type]
                  const severityConfig = SEVERITY_LEVELS[hotspot.severity]
                  return (
                    <div key={hotspot.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-3">
                        <span 
                          className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0"
                          style={{ backgroundColor: `${weatherConfig.color}25` }}
                        >
                          {weatherConfig.emoji}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span 
                              className="px-2 py-0.5 rounded text-xs font-medium text-white"
                              style={{ backgroundColor: weatherConfig.color }}
                            >
                              {weatherConfig.label}
                            </span>
                            <span 
                              className="px-2 py-0.5 rounded text-xs font-medium border"
                              style={{ 
                                backgroundColor: severityConfig.bgColor,
                                color: severityConfig.color,
                                borderColor: severityConfig.color
                              }}
                            >
                              {severityConfig.label}预警
                            </span>
                            <span className="text-xs text-gray-500">{hotspot.province}</span>
                          </div>
                          <h3 className="text-sm font-medium text-gray-800 mb-1">{hotspot.title}</h3>
                          <p className="text-xs text-gray-500 line-clamp-2">{hotspot.summary}</p>
                          <div className="text-xs text-gray-400 mt-2">
                            {hotspot.source} · {new Date(hotspot.publishedAt).toLocaleString('zh-CN')}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}月${d.getDate()}日`
}
