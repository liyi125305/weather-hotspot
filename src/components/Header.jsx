export default function Header({ lastUpdated, isRefreshing, onRefresh, loading, onOpenHistorical, mode }) {
  const formatTime = (date) => {
    if (!date) return '--:--'
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  // 计算距离下次 8 点刷新的时间
  const getNextDailyRefreshLabel = () => {
    const now = new Date()
    const next = new Date(now)
    next.setHours(8, 0, 0, 0)
    if (now.getHours() >= 8) {
      next.setDate(next.getDate() + 1)
    }
    const diff = next - now
    const h = Math.floor(diff / 3600000)
    const m = Math.floor((diff % 3600000) / 60000)
    if (h < 1) return `${m} 分钟后`
    return `${h} 小时 ${m} 分后`
  }
  
  // 请求浏览器通知权限（首次）
  const requestNotifyPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }

  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* 左侧：标题 */}
        <div className="flex items-center gap-3">
          <span className="text-2xl">🌤️</span>
          <div>
            <h1 className="text-xl font-semibold text-gray-800">气象今日热点</h1>
            <div className="text-[10px] text-gray-400">实时全国气象预警 · 自动 5min 刷新</div>
          </div>
        </div>

        {/* 中央：模式切换 */}
        <div className="flex items-center bg-gray-100 rounded-full p-1">
          <button
            onClick={() => mode !== 'realtime' && onOpenHistorical(null)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              mode === 'realtime' 
                ? 'bg-white text-sky-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            实时
          </button>
          <button
            onClick={() => mode !== 'historical' && onOpenHistorical('__open__')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              mode === 'historical' 
                ? 'bg-white text-amber-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            历史
          </button>
        </div>

        {/* 右侧：状态和操作 */}
        <div className="flex items-center gap-3">
          {/* 最后更新时间 + 下次定时刷新 */}
          <div className="text-right">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <span className={`w-1.5 h-1.5 rounded-full ${loading ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`} />
              <span>{loading ? '加载中...' : `最近 ${formatTime(lastUpdated)} 更新`}</span>
            </div>
            {mode === 'realtime' && (
              <button 
                onClick={requestNotifyPermission}
                className="text-[10px] text-gray-400 hover:text-sky-500 transition-colors"
                title="点击开启浏览器通知，到点提醒"
              >
                早 8:00 自动更新 · 下次 {getNextDailyRefreshLabel()} · 🔔
              </button>
            )}
          </div>

          {/* 历史按钮 */}
          <button
            onClick={() => onOpenHistorical('__open__')}
            className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 text-sm flex items-center gap-1.5"
            title="历史查询"
          >
            <span>📜</span>
            <span className="hidden md:inline">历史</span>
          </button>

          {/* 刷新按钮 */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className={`
              p-2 rounded-lg transition-all duration-200
              ${isRefreshing 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-sky-500 text-white hover:bg-sky-600 active:bg-sky-700 hover:scale-105 active:scale-95'
              }
            `}
            title="立即刷新数据"
          >
            <svg 
              className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
}
