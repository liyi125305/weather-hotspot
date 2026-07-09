import { ALL_TAGS } from '../utils/tags'

// 标签组件
export function Tag({ tag, size = 'sm', onClick, active = false }) {
  if (!tag) return null
  
  const sizeClasses = {
    xs: 'text-[10px] px-1.5 py-0.5 gap-0.5',
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-sm px-2.5 py-1 gap-1'
  }
  
  return (
    <span
      onClick={onClick}
      className={`
        inline-flex items-center font-medium rounded-full whitespace-nowrap
        transition-all duration-150
        ${sizeClasses[size] || sizeClasses.sm}
        ${onClick ? 'cursor-pointer hover:scale-105' : ''}
        ${active ? 'ring-2 ring-offset-1' : ''}
      `}
      style={{
        backgroundColor: `${tag.color}20`,
        color: tag.color,
        border: `1px solid ${tag.color}40`,
        ...(active && { ringColor: tag.color })
      }}
    >
      <span>{tag.icon}</span>
      <span>{tag.label}</span>
    </span>
  )
}

// 标签组（多标签）
export function TagList({ tags, size = 'sm', limit, onTagClick, activeTagKey }) {
  if (!tags || tags.length === 0) return null
  const displayTags = limit ? tags.slice(0, limit) : tags
  const remaining = limit && tags.length > limit ? tags.length - limit : 0
  
  return (
    <div className="flex flex-wrap items-center gap-1">
      {displayTags.map(tag => (
        <Tag
          key={tag.key}
          tag={tag}
          size={size}
          onClick={onTagClick ? () => onTagClick(tag) : undefined}
          active={activeTagKey === tag.key}
        />
      ))}
      {remaining > 0 && (
        <span className="text-[10px] text-gray-400">+{remaining}</span>
      )}
    </div>
  )
}

// 主标签（突出显示）
export function MainTag({ tag }) {
  if (!tag) return null
  return (
    <span
      className="inline-flex items-center gap-1 text-sm font-semibold px-2.5 py-1 rounded-full shadow-sm"
      style={{
        backgroundColor: tag.color,
        color: '#fff'
      }}
    >
      <span>{tag.icon}</span>
      <span>{tag.label}</span>
    </span>
  )
}

// 全局对象可访问
window.__ALL_TAGS__ = ALL_TAGS
