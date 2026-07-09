import { WEATHER_TYPES } from '../utils/constants'

export default function FilterBar({ selectedTypes, onTypeToggle, counts, compact = false }) {
  const typeKeys = Object.keys(WEATHER_TYPES)

  return (
    <div className={`bg-white ${compact ? 'border-b' : 'border-t'} border-gray-200 px-3 py-3`}>
      <div className="flex flex-wrap gap-1.5">
        {typeKeys.map(type => {
          const config = WEATHER_TYPES[type]
          const isSelected = selectedTypes.includes(type)
          const allActive = selectedTypes.length === 0
          const isOn = isSelected || allActive
          const count = counts[type] || 0
          
          return (
            <button
              key={type}
              onClick={() => onTypeToggle(type)}
              className={`
                px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200
                flex items-center gap-1
                ${isOn 
                  ? 'text-white shadow-sm' 
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }
              `}
              style={{
                backgroundColor: isOn ? config.color : undefined
              }}
            >
              <span>{config.emoji}</span>
              <span>{config.label}</span>
              {count > 0 && (
                <span className={`
                  px-1 rounded text-[10px]
                  ${isOn ? 'bg-white/30' : 'bg-gray-200 text-gray-600'}
                `}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>
      {selectedTypes.length > 0 && (
        <button 
          onClick={() => onTypeToggle('__all__')}
          className="text-xs text-sky-500 hover:text-sky-700 mt-2 inline-block"
        >
          ✕ 清除筛选（{selectedTypes.length} 个）
        </button>
      )}
    </div>
  )
}
