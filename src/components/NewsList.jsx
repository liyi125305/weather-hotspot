import { MainTag, TagList } from './TagComponents'
import { ALL_TAGS } from '../utils/tags'

export default function NewsList({ news, onItemClick, activeNewsId, onCapture, isCapturing, lastUpdated }) {
  if (news.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="text-center text-gray-400">
          <div className="text-3xl mb-2">📰</div>
          <p className="text-sm">暂无气象新闻</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {/* 头部：含手动补录按钮 */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between sticky top-0 z-10">
        <div>
          <h2 className="text-sm font-semibold text-gray-700">
            气象新闻 <span className="text-sky-500">({news.length})</span>
          </h2>
          <p className="text-[10px] text-gray-400 mt-0.5">
            {lastUpdated ? `更新 ${formatTime(lastUpdated)}` : '已按标签自动归类'}
          </p>
        </div>
        {onCapture && (
          <button
            onClick={onCapture}
            disabled={isCapturing}
            className={`
              flex items-center gap-1 px-2 py-1 rounded text-xs
              transition-all duration-200
              ${isCapturing
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700'
              }
            `}
            title="补录：把当前数据保存为今日历史快照"
          >
            <svg 
              className={`w-3 h-3 ${isCapturing ? 'animate-spin' : ''}`}
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
            {isCapturing ? '补录中...' : '补录'}
          </button>
        )}
      </div>
      <div className="divide-y divide-gray-50">
        {news.map(item => {
          const mainTag = ALL_TAGS[item.mainTagKey]
          const subTags = (item.tags || [])
            .map(k => ALL_TAGS[k])
            .filter(Boolean)
            .filter(t => t.key !== item.mainTagKey)
            .slice(0, 3)
          const isActive = item.id === activeNewsId
          
          return (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                if (onItemClick) {
                  e.preventDefault()
                  onItemClick(item)
                  // 在新窗口打开原文
                  window.open(item.url, '_blank', 'noopener,noreferrer')
                }
              }}
              className={`
                block px-4 py-3 transition-all hover:bg-sky-50 cursor-pointer
                ${isActive ? 'bg-sky-50 border-l-4 border-sky-500' : 'border-l-4 border-transparent'}
              `}
            >
              {/* 主标签 + 来源 */}
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                {mainTag && <MainTag tag={mainTag} />}
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 font-medium">
                  {item.source}
                </span>
                <span className="text-[10px] text-gray-400 ml-auto">
                  {formatDate(item.publishedAt)}
                </span>
              </div>

              {/* 标题 */}
              <div className="text-sm font-medium text-gray-800 line-clamp-2 leading-tight mb-1.5">
                {item.title}
              </div>

              {/* 摘要 */}
              {item.summary && (
                <p className="text-xs text-gray-500 line-clamp-2 mb-1.5">
                  {item.summary}
                </p>
              )}

              {/* 副标签 + 查看原文链接 */}
              <div className="flex items-center justify-between">
                {subTags.length > 0 ? (
                  <TagList tags={subTags} size="xs" />
                ) : <span />}
                <span className="text-[10px] text-sky-500 flex items-center gap-0.5">
                  查看原文
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </span>
              </div>
            </a>
          )
        })}
      </div>
    </div>
  )
}

function formatTime(date) {
  if (!date) return ''
  try {
    return new Date(date).toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  } catch (e) {
    return ''
  }
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr)
    const now = Date.now()
    const diff = now - d.getTime()
    const days = Math.floor(diff / 86400000)
    if (days === 0) {
      return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    }
    if (days < 7) {
      return `${days}天前`
    }
    return d.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
  } catch (e) {
    return ''
  }
}
