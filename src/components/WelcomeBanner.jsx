import { useState } from 'react'

export default function WelcomeBanner() {
  const [visible, setVisible] = useState(() => {
    return !localStorage.getItem('weather_hotspot_banner_dismissed')
  })

  if (!visible) return null

  const handleDismiss = () => {
    localStorage.setItem('weather_hotspot_banner_dismissed', '1')
    setVisible(false)
  }

  return (
    <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl shadow-2xl px-5 py-3 max-w-xl z-[2000] flex items-center gap-4">
      <div className="text-2xl">🌐</div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm">局域网部署成功</div>
        <div className="text-xs opacity-90 mt-0.5">
          同一个 WiFi 的其他设备也可以通过 <b className="font-mono">dailymeteo.local:9999</b> 访问
        </div>
      </div>
      <button
        onClick={handleDismiss}
        className="text-white/80 hover:text-white text-xl w-6 h-6 shrink-0"
      >
        ×
      </button>
    </div>
  )
}
