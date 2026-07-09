import { useState, useRef, useEffect } from 'react'

export default function SearchBox({ value, onChange, onTagSuggestion, suggestions = [] }) {
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef(null)

  // 关闭建议面板
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.search-container')) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="search-container relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          placeholder="🔍 搜索 台风、暴雨、电力... 或点击下方标签"
          className="w-full px-3 py-2 pr-8 text-sm border border-gray-200 rounded-lg
                     focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent
                     bg-gray-50 transition-all"
        />
        {value && (
          <button
            onClick={() => { onChange(''); inputRef.current?.focus() }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 w-5 h-5"
          >
            ×
          </button>
        )}
      </div>

      {/* 快速筛选建议 */}
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-80 overflow-y-auto">
          <div className="px-3 py-2 text-xs text-gray-500 border-b border-gray-100">
            💡 热门标签快捷搜索
          </div>
          <div className="p-2 flex flex-wrap gap-1.5">
            {suggestions.map(tag => (
              <button
                key={tag.key}
                onClick={() => {
                  onChange(tag.label)
                  onTagSuggestion && onTagSuggestion(tag)
                  setShowSuggestions(false)
                }}
                className="text-xs px-2 py-1 rounded-full border transition-all hover:shadow-sm"
                style={{
                  backgroundColor: `${tag.color}15`,
                  color: tag.color,
                  borderColor: `${tag.color}40`
                }}
              >
                {tag.icon} {tag.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
