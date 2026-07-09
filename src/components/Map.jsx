import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import { useEffect } from 'react'
import { MAP_CONFIG, TILE_LAYER } from '../utils/constants'
import HotspotMarker from './HotspotMarker'

// 子组件：监听外部位置变化，飞到目标
function MapNavigator({ flyToTarget }) {
  const map = useMap()

  useEffect(() => {
    if (flyToTarget) {
      map.flyTo(flyToTarget, 8, {
        duration: 1.2
      })
    }
  }, [flyToTarget, map])

  return null
}

export default function Map({ hotspots, selectedTypes, onMarkerClick, flyToTarget, activeHotspotId }) {
  return (
    <MapContainer
      center={MAP_CONFIG.center}
      zoom={MAP_CONFIG.zoom}
      minZoom={MAP_CONFIG.minZoom}
      maxZoom={MAP_CONFIG.maxZoom}
      className="h-full w-full"
    >
      <TileLayer
        url={TILE_LAYER.url}
        attribution={TILE_LAYER.attribution}
        subdomains={TILE_LAYER.subdomains}
      />
      
      <MapNavigator flyToTarget={flyToTarget} />
      
      {hotspots.map(hotspot => (
        <HotspotMarker
          key={hotspot.id}
          hotspot={hotspot}
          onClick={() => onMarkerClick(hotspot)}
          isActive={activeHotspotId === hotspot.id}
        />
      ))}
    </MapContainer>
  )
}
