import { useState, useMemo } from 'react'
import { MainTag, TagList } from './TagComponents'
import { ALL_TAGS } from '../utils/tags'

export default function HotspotList({ hotspots, activeHotspotId, onItemClick, searchQuery = '' }) {
  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return hotspots
    const q = searchQuery.toLowerCase()
    return hotspots.filter(h => 
      (h.title || '').toLowerCase().includes(q) ||
      (h.summary || '').toLowerCase().includes(q) ||
      (h.province || '').toLowerCase().includes(q) ||
      (h.source || '').toLowerCase().includes(q)
    )
  }, [hotspots, searchQuery])

  if (filtered.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="text-center text-gray-400">
          <div className="text-3xl mb-2">🔍</div>
          <p className="text-sm">
            {searchQuery ? `未找到"${searchQuery}"相关热点` : '当前筛选下无热点数据'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between sticky top-0 z-10">
        <h2 className="text-sm font-semibold text-gray-700">
          实时热点 <span className="text-sky-500">({filtered.length})</span>
        </h2>
        <span className="text-xs text-gray-400">自动 5min 刷新</span>
      </div>
      <div className="divide-y divide-gray-50">
        {filtered.map(hotspot => {
          const mainTag = ALL_TAGS[hotspot.mainTagKey]
          const allTags = (hotspot.tags || []).map(k => ALL_TAGS[k]).filter(Boolean)
          // 主标签外的副标签
          const subTags = allTags.filter(t => t.key !== hotspot.mainTagKey).slice(0, 3)
          const isActive = hotspot.id === activeHotspotId
          
          return (
            <div
              key={hotspot.id}
              onClick={() => onItemClick(hotspot)}
              className={`
                px-4 py-3 cursor-pointer transition-all
                hover:bg-sky-50
                ${isActive ? 'bg-sky-50 border-l-4 border-sky-500' : 'border-l-4 border-transparent'}
              `}
            >
              {/* 标题 + 主标签（最核心一个） */}
              <div className="flex items-start gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    {mainTag && <MainTag tag={mainTag} />}
                    <span className="text-xs text-gray-500">{hotspot.province}</span>
                  </div>
                  <div className="text-sm font-medium text-gray-800 line-clamp-2 leading-tight">
                    {hotspot.title}
                  </div>
                </div>
              </div>

              {/* 副标签 */}
              {subTags.length > 0 && (
                <div className="mb-2 ml-1">
                  <TagList tags={subTags} size="xs" />
                </div>
              )}

              {/* 摘要 */}
              <p className="text-xs text-gray-500 line-clamp-2 mb-1.5">
                {hotspot.summary}
              </p>

              {/* 元信息 */}
              <div className="text-[10px] text-gray-400 ml-1">
                {hotspot.source} · {new Date(hotspot.publishedAt).toLocaleString('zh-CN', {
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
