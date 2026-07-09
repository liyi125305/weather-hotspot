import { useState, useMemo } from 'react'
import Header from './components/Header'
import ChinaMap from './components/ChinaMap'
import FilterBar from './components/FilterBar'
import HotspotList from './components/HotspotList'
import NewsList from './components/NewsList'
import SearchBox from './components/SearchBox'
import WelcomeBanner from './components/WelcomeBanner'
import { HistoricalPanel } from './components/HistoricalPanel'
import { useWeatherData } from './hooks/useWeatherData'
import { useWeatherNews } from './hooks/useWeatherNews'
import { ALL_TAGS, getTagsByCategory } from './utils/tags'
import { MainTag } from './components/TagComponents'

function LoadingScreen() {
  return (
    <div className="flex items-center justify-center h-full bg-sky-50">
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-4">
          <div className="absolute inset-0 border-4 border-sky-200 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-sky-500 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <p className="text-sky-600 font-medium">正在加载气象数据...</p>
      </div>
    </div>
  )
}

function NoDataScreen({ onRefresh, isRefreshing, dataSource }) {
  const showApiKeyHint = dataSource === 'no_api_key'
  
  return (
    <div className="flex flex-col h-full bg-sky-50">
      <Header 
        lastUpdated={null}
        isRefreshing={isRefreshing}
        onRefresh={onRefresh}
        loading={false}
        onOpenHistorical={() => {}}
        mode="realtime"
      />
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-xl text-center">
          <div className="text-6xl mb-4">🌤️</div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-3">
            {showApiKeyHint ? '需要配置和风天气 API Key' : '正在连接数据源...'}
          </h2>
          
          {showApiKeyHint ? (
            <>
              <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                应用已就绪，配置和风天气 API Key 后即可显示中国气象预警信息。
              </p>
              <div className="bg-white rounded-xl border border-gray-200 p-5 my-6 text-left">
                <h3 className="font-semibold text-gray-800 mb-3 text-sm">📋 配置步骤：</h3>
                <ol className="text-xs text-gray-700 space-y-2 list-decimal pl-5">
                  <li>访问 <a href="https://console.qweather.com/" target="_blank" rel="noopener" className="text-sky-600 underline">console.qweather.com</a> 注册账号</li>
                  <li>创建应用 → 选择「免费订阅」</li>
                  <li>复制 API Key</li>
                  <li>在项目根目录创建 <code className="bg-gray-100 px-1.5 py-0.5 rounded">.env</code> 文件，内容：</li>
                </ol>
                <pre className="text-xs bg-gray-900 text-green-300 p-3 rounded mt-2 overflow-x-auto">{`# 和风天气 API
QWEATHER_API_KEY=你的key_here
`}</pre>
                <p className="text-xs text-gray-500 mt-2">
                  ⑤ 重启服务（<code className="font-mono">./start.sh</code>）
                </p>
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-600 mb-6">
              正在等待数据返回。如长时间无响应，请检查后端服务是否运行。
            </p>
          )}
          
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="px-6 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 disabled:bg-gray-300 transition-colors"
          >
            {isRefreshing ? '刷新中...' : '🔄 重新尝试'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const { hotspots, loading, error, lastUpdated, isRefreshing, refresh, dataSource } = useWeatherData()
  const { news, lastUpdated: newsLastUpdated, isCapturing, capture } = useWeatherNews()
  const [selectedTypes, setSelectedTypes] = useState([])
  const [activeHotspotId, setActiveHotspotId] = useState(null)
  // 侧栏 tab：'hotspot' | 'news'
  const [sideTab, setSideTab] = useState('hotspot')
  const [showHistorical, setShowHistorical] = useState(false)
  const [historicalSnapshot, setHistoricalSnapshot] = useState(null)
  const [mode, setMode] = useState('realtime')
  // 搜索查询
  const [searchQuery, setSearchQuery] = useState('')
  // 选中的标签 key（用于按标签筛选）
  const [activeTagKey, setActiveTagKey] = useState(null)

  // 各类型数量
  const counts = useMemo(() => {
    return hotspots.reduce((acc, h) => {
      acc[h.type] = (acc[h.type] || 0) + 1
      return acc
    }, {})
  }, [hotspots])

  const provinceStats = useMemo(() => {
    return hotspots.reduce((acc, h) => {
      if (h.province) {
        if (!acc[h.province]) acc[h.province] = []
        acc[h.province].push(h)
      }
      return acc
    }, {})
  }, [hotspots])

  const handleTypeToggle = (type) => {
    if (type === '__all__') {
      setSelectedTypes([])
      return
    }
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    )
  }

  const handleMarkerClick = (hotspot) => {
    setActiveHotspotId(hotspot.id)
  }

  const handleProvinceClick = (firstHotspot) => {
    setActiveHotspotId(firstHotspot.id)
  }

  const handleListClick = (hotspot) => {
    setActiveHotspotId(hotspot.id)
  }

  const handleOpenHistorical = (arg) => {
    if (arg === '__open__') {
      setMode('historical')
      setShowHistorical(true)
    } else {
      setMode('realtime')
      setHistoricalSnapshot(null)
    }
  }

  const handleShowHistoricalDay = (dayData) => {
    setHistoricalSnapshot(dayData)
    setShowHistorical(false)
  }

  // 快速建议标签（现象类前 10 个 + 行业类前 8 个）
  const suggestionTags = useMemo(() => {
    const phenomenon = getTagsByCategory('phenomenon').filter(t => t.priority <= 2).slice(0, 8)
    const impact = getTagsByCategory('impact').slice(0, 4)
    return [...phenomenon, ...impact]
  }, [])

  // 点击标签建议
  const handleTagSuggestion = (tag) => {
    setActiveTagKey(tag.key)
  }

  // 清除标签筛选
  const handleClearTagFilter = () => {
    setActiveTagKey(null)
    setSearchQuery('')
  }

  // 当前显示数据
  const currentHotspots = mode === 'historical' && historicalSnapshot 
    ? historicalSnapshot 
    : hotspots

  // 综合筛选：类型 + 标签 + 搜索
  const filteredHotspots = useMemo(() => {
    let result = currentHotspots
    
    if (selectedTypes.length > 0) {
      result = result.filter(h => selectedTypes.includes(h.type))
    }
    
    if (activeTagKey) {
      result = result.filter(h => (h.tags || []).includes(activeTagKey))
    }
    
    return result
  }, [currentHotspots, selectedTypes, activeTagKey])

  if (loading && hotspots.length === 0) {
    return <LoadingScreen />
  }

  // 数据为空时的状态
  if (dataSource === 'empty' || dataSource === 'no_api_key' || dataSource === 'no_backend' || dataSource === 'api_error') {
    return <NoDataScreen onRefresh={refresh} isRefreshing={isRefreshing} dataSource={dataSource} />
  }

  return (
    <div className="flex flex-col h-full bg-sky-50">
      <Header 
        lastUpdated={lastUpdated}
        isRefreshing={isRefreshing}
        onRefresh={refresh}
        loading={loading}
        onOpenHistorical={handleOpenHistorical}
        mode={mode}
      />
      
      <div className="flex flex-1 overflow-hidden relative">
        <WelcomeBanner />
        {/* 左侧 */}
        <aside className="w-80 bg-white border-r border-gray-200 flex flex-col overflow-hidden shrink-0">
          {/* 搜索框 */}
          <div className="px-3 py-2 bg-white border-b border-gray-100">
            <SearchBox
              value={searchQuery}
              onChange={setSearchQuery}
              suggestions={suggestionTags}
              onTagSuggestion={handleTagSuggestion}
            />
            {/* 当前激活的标签筛选提示 */}
            {activeTagKey && ALL_TAGS[activeTagKey] && (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs text-gray-500">筛选：</span>
                <MainTag tag={ALL_TAGS[activeTagKey]} />
                <button
                  onClick={handleClearTagFilter}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  清除
                </button>
              </div>
            )}
          </div>

          {/* 侧栏 tab 切换：预警 / 新闻 */}
          <div className="flex border-b border-gray-200 bg-gray-50">
            <button
              onClick={() => setSideTab('hotspot')}
              className={`
                flex-1 py-2 text-sm font-medium transition-colors
                ${sideTab === 'hotspot' 
                  ? 'bg-white text-sky-600 border-b-2 border-sky-500' 
                  : 'text-gray-500 hover:text-gray-700'
                }
              `}
            >
              📍 实时预警 ({filteredHotspots.length})
            </button>
            <button
              onClick={() => setSideTab('news')}
              className={`
                flex-1 py-2 text-sm font-medium transition-colors
                ${sideTab === 'news' 
                  ? 'bg-white text-blue-600 border-b-2 border-blue-500' 
                  : 'text-gray-500 hover:text-gray-700'
                }
              `}
            >
              📰 气象新闻 ({news.length})
            </button>
          </div>

          {sideTab === 'hotspot' ? (
            <>
              <FilterBar 
                selectedTypes={selectedTypes}
                onTypeToggle={handleTypeToggle}
                counts={counts}
                compact={true}
              />
              <HotspotList 
                hotspots={filteredHotspots}
                activeHotspotId={activeHotspotId}
                onItemClick={handleListClick}
                searchQuery={searchQuery}
              />
            </>
          ) : (
            <NewsList 
              news={news}
              onCapture={capture}
              isCapturing={isCapturing}
              lastUpdated={newsLastUpdated}
            />
          )}
        </aside>

        {/* 右侧 */}
        <main className="flex-1 relative">
          <ChinaMap 
            hotspots={filteredHotspots}
            activeHotspotId={activeHotspotId}
            onSelect={handleMarkerClick}
            onProvinceClick={handleProvinceClick}
            isHistorical={mode === 'historical'}
          />
          
          {activeHotspotId && (
            <ProvinceInfo 
              hotspot={currentHotspots.find(h => h.id === activeHotspotId)}
              provinceHotspots={currentHotspots.filter(h => 
                h.province === currentHotspots.find(x => x.id === activeHotspotId)?.province
              )}
              onClose={() => setActiveHotspotId(null)}
            />
          )}
          
          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg px-4 py-2 text-sm text-gray-600">
            展示 <span className="font-semibold text-sky-500">{filteredHotspots.length}</span> / {currentHotspots.length} 个热点 ·
            覆盖 <span className="font-semibold text-sky-500">{Object.keys(provinceStats).length}</span> 省
          </div>
        </main>
      </div>

      <HistoricalPanel 
        open={showHistorical}
        onClose={() => {
          setShowHistorical(false)
          setMode('realtime')
        }}
        onShowDay={handleShowHistoricalDay}
      />
    </div>
  )
}

function ProvinceInfo({ hotspot, provinceHotspots, onClose }) {
  if (!hotspot) return null
  const typeMap = { typhoon: '🌪️', rainstorm: '🌧️', heatwave: '🥵', coldwave: '🥶', sandstorm: '🌫️', fog: '🌫️' }
  const mainTag = ALL_TAGS[hotspot.mainTagKey]
  const subTags = (hotspot.tags || [])
    .map(k => ALL_TAGS[k])
    .filter(Boolean)
    .filter(t => t.key !== hotspot.mainTagKey)
    .slice(0, 6)
  
  return (
    <div className="absolute top-4 right-4 w-80 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl overflow-hidden z-[500]">
      <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
        <div>
          <div className="text-xs text-gray-400">当前高亮省份</div>
          <div className="font-semibold text-gray-800">{hotspot.province}</div>
        </div>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-xl leading-none w-6 h-6"
        >
          ×
        </button>
      </div>
      
      {/* 主标签 + 副标签 */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2 mb-2">
          {mainTag && <MainTag tag={mainTag} />}
          <span 
            className="text-xs px-2 py-0.5 rounded-full border"
            style={{
              borderColor: '#1E90FF',
              color: '#1E90FF'
            }}
          >
            {hotspot.severity}预警
          </span>
        </div>
        {subTags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {subTags.map(t => (
              <span 
                key={t.key}
                className="text-[10px] px-1.5 py-0.5 rounded-full"
                style={{
                  backgroundColor: `${t.color}15`,
                  color: t.color,
                  border: `1px solid ${t.color}40`
                }}
              >
                {t.icon} {t.label}
              </span>
            ))}
          </div>
        )}
      </div>
      
      {/* 摘要 */}
      <div className="px-4 py-3 border-b border-gray-50">
        <p className="text-xs text-gray-600 line-clamp-3">{hotspot.summary}</p>
      </div>
      
      {/* 同省其他热点 */}
      <div className="max-h-44 overflow-y-auto">
        <div className="px-4 py-2 text-xs text-gray-400 bg-gray-50">同省其他热点 ({provinceHotspots.length})</div>
        {provinceHotspots.map(h => (
          <div 
            key={h.id}
            className={`px-4 py-2 border-b border-gray-50 cursor-pointer hover:bg-gray-50 ${h.id === hotspot.id ? 'bg-sky-50' : ''}`}
          >
            <div className="flex items-center gap-1.5 mb-0.5">
              {h.mainTagKey && ALL_TAGS[h.mainTagKey] && (
                <span style={{ color: ALL_TAGS[h.mainTagKey].color }}>
                  {ALL_TAGS[h.mainTagKey].icon}
                </span>
              )}
              <span className="text-xs text-gray-700 flex-1 truncate">{h.title}</span>
            </div>
            <div className="text-[10px] text-gray-400 ml-4">{h.severity}预警 · {h.source}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
