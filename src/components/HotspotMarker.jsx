import { Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { useEffect, useRef } from 'react'
import { WEATHER_TYPES, SEVERITY_LEVELS } from '../utils/constants'

export default function HotspotMarker({ hotspot, onClick, isActive }) {
  const popupRef = useRef(null)
  const markerRef = useRef(null)
  const weatherConfig = WEATHER_TYPES[hotspot.type]
  const severityConfig = SEVERITY_LEVELS[hotspot.severity]

  // 当 isActive 变化时，自动打开 popup
  useEffect(() => {
    if (isActive && popupRef.current && markerRef.current) {
      // 等待地图飞到位再打开
      setTimeout(() => {
        markerRef.current.openPopup()
      }, 1300)
    }
  }, [isActive])

  const icon = L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div class="custom-marker ${hotspot.type}" style="
        width: 36px;
        height: 36px;
        background-color: ${weatherConfig.color};
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        cursor: pointer;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      ">
        ${weatherConfig.emoji}
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20]
  })

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Marker
      ref={markerRef}
      position={hotspot.location}
      icon={icon}
      eventHandlers={{
        click: onClick
      }}
    >
      <Popup ref={popupRef} className="hotspot-popup">
        <div className="p-4 min-w-[280px]">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {hotspot.title}
          </h3>
          <div className="flex items-center gap-2 mb-3">
            <span 
              className="px-2 py-1 rounded-full text-xs font-medium text-white"
              style={{ backgroundColor: weatherConfig.color }}
            >
              {weatherConfig.emoji} {weatherConfig.label}
            </span>
            <span 
              className="px-2 py-1 rounded-full text-xs font-medium"
              style={{ 
                backgroundColor: severityConfig.bgColor,
                color: severityConfig.color
              }}
            >
              {severityConfig.label}预警
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            {hotspot.summary}
          </p>
          <div className="text-xs text-gray-400 space-y-1 border-t pt-3">
            <div className="flex justify-between">
              <span>数据来源</span>
              <span className="text-gray-600">{hotspot.source}</span>
            </div>
            <div className="flex justify-between">
              <span>发布时间</span>
              <span className="text-gray-600">{formatDate(hotspot.publishedAt)}</span>
            </div>
            <div className="flex justify-between">
              <span>位置</span>
              <span className="text-gray-600">
                {hotspot.location[1].toFixed(2)}°N, {hotspot.location[0].toFixed(2)}°E
              </span>
            </div>
          </div>
        </div>
      </Popup>
    </Marker>
  )
}
