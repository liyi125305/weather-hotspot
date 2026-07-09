import { useEffect, useRef } from 'react'
import * as echarts from 'echarts'
import { WEATHER_TYPES, SEVERITY_LEVELS } from '../utils/constants'

// 省份 adcode -> 中文名
const ADCODE_NAME = {
  110000: '北京市', 120000: '天津市', 130000: '河北省', 140000: '山西省', 150000: '内蒙古自治区',
  210000: '辽宁省', 220000: '吉林省', 230000: '黑龙江省', 310000: '上海市', 320000: '江苏省',
  330000: '浙江省', 340000: '安徽省', 350000: '福建省', 360000: '江西省', 370000: '山东省',
  410000: '河南省', 420000: '湖北省', 430000: '湖南省', 440000: '广东省', 450000: '广西壮族自治区',
  460000: '海南省', 500000: '重庆市', 510000: '四川省', 520000: '贵州省', 530000: '云南省',
  540000: '西藏自治区', 610000: '陕西省', 620000: '甘肃省', 630000: '青海省', 640000: '宁夏回族自治区',
  650000: '新疆维吾尔自治区', 710000: '台湾省', 810000: '香港特别行政区', 820000: '澳门特别行政区'
}

const SEVERITY_COLOR = {
  blue: '#1E90FF',
  yellow: '#FFD700',
  orange: '#FF8C00',
  red: '#FF0000'
}

const SEVERITY_RANK = { blue: 1, yellow: 2, orange: 3, red: 4 }

export default function ChinaMap({ hotspots, activeHotspotId, onSelect, onProvinceClick, isHistorical = false }) {
  const chartRef = useRef(null)
  const chartInstance = useRef(null)

  useEffect(() => {
    if (!chartRef.current) return

    chartInstance.current = echarts.init(chartRef.current)

    fetch('/data/china-provinces.json')
      .then(res => res.json())
      .then(geoJson => {
        echarts.registerMap('china', geoJson)
        renderChart()
      })
      .catch(err => {
        console.error('地图数据加载失败:', err)
      })

    function renderChart() {
      // 渲染用 onShowNews 注入到 popup 内部
      // 统计省份
      const provinceCount = {}
      const provinceSeverity = {}

      hotspots.forEach(h => {
        if (h.provinceCode) {
          provinceCount[h.provinceCode] = (provinceCount[h.provinceCode] || 0) + 1
          const cur = provinceSeverity[h.provinceCode]
          if (!cur || SEVERITY_RANK[h.severity] > SEVERITY_RANK[cur]) {
            provinceSeverity[h.provinceCode] = h.severity
          }
        }
      })

      const activeProvinceCode = activeHotspotId
        ? hotspots.find(h => h.id === activeHotspotId)?.provinceCode
        : null

      const option = {
        backgroundColor: '#F0F8FF',
        tooltip: {
          trigger: 'item',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderColor: '#94A3B8',
          borderWidth: 1,
          textStyle: { color: '#1F2937', fontSize: 12 },
          extraCssText: 'box-shadow: 0 4px 12px rgba(0,0,0,0.15); border-radius: 8px;',
          formatter: (params) => {
            if (params.seriesType === 'map') {
              const code = Number(params.data?.adcode || params.value)
              const name = ADCODE_NAME[code] || params.name
              const count = provinceCount[code] || 0
              const sev = provinceSeverity[code]
              if (count > 0) {
                return `
                  <div style="padding: 6px 10px; min-width: 140px">
                    <div style="font-weight: 600; margin-bottom: 4px; color: #1F2937">${name}</div>
                    <div style="font-size: 12px; color: #4B5563">预警数: <b style="color: ${SEVERITY_COLOR[sev]}">${count}</b></div>
                    <div style="font-size: 12px; color: #4B5563">最高等级: <b style="color: ${SEVERITY_COLOR[sev]}">${sev ? sev.toUpperCase() : '-'}</b></div>
                  </div>
                `
              }
              return `
                <div style="padding: 4px 8px">
                  <div style="font-weight: 600; color: #1F2937">${name}</div>
                  <div style="color: #9CA3AF; font-size: 11px; margin-top: 2px">暂无预警</div>
                </div>
              `
            }
            return ''
          }
        },
        grid: {
          left: '2%',
          right: '2%',
          top: '5%',
          bottom: '5%',
          containLabel: true
        },
        series: [
          // 主地图（占据大部分画布）
          {
            name: '中国地图',
            type: 'map',
            map: 'china',
            roam: true,
            zoom: 1.5,
            aspectScale: 0.75, // 调整宽高比，使地图更紧凑
            scaleLimit: { min: 0.6, max: 8 },
            layoutCenter: ['38%', '50%'], // 主图位置：稍偏左
            layoutSize: '120%', // 主图大小占画面 120%（铺满可用空间）
            label: {
              show: true,
              color: '#374151',
              fontSize: 10,
              fontWeight: 500
            },
            itemStyle: {
              areaColor: '#FFFFFF',
              borderColor: '#93C5FD',
              borderWidth: 1,
              shadowColor: 'rgba(0,0,0,0.05)',
              shadowBlur: 4,
              shadowOffsetY: 2
            },
            emphasis: {
              label: { color: '#fff', fontSize: 12, fontWeight: 600 },
              itemStyle: { areaColor: '#3B82F6' }
            },
            select: {
              label: { color: '#fff' },
              itemStyle: { areaColor: '#1E40AF' }
            },
            data: Object.keys(ADCODE_NAME).map(code => {
              const numCode = Number(code)
              const count = provinceCount[numCode] || 0
              const sev = provinceSeverity[numCode]
              const isActive = numCode === activeProvinceCode
              const isHighlighted = count > 0
              
              return {
                name: ADCODE_NAME[numCode],
                adcode: numCode,
                value: numCode, // 用于 tooltip
                itemStyle: {
                  areaColor: isActive
                    ? SEVERITY_COLOR[sev] || '#3B82F6'
                    : (isHighlighted
                      ? `${SEVERITY_COLOR[sev]}35`
                      : '#FFFFFF'),
                  borderColor: isActive 
                    ? '#FFF' 
                    : (isHighlighted ? SEVERITY_COLOR[sev] : '#93C5FD'),
                  borderWidth: isActive ? 3 : 1
                }
              }
            })
          },
          // 南海诸岛小图（右下角）
          {
            name: '南海诸岛',
            type: 'map',
            map: 'china',
            roam: false,
            zoom: 0.45,
            layoutCenter: ['85%', '88%'], // 右下角
            layoutSize: '20%', // 占主图 20% 大小
            aspectScale: 0.75,
            label: { show: false },
            itemStyle: {
              areaColor: '#F0F9FF',
              borderColor: '#93C5FD',
              borderWidth: 0.5
            },
            emphasis: { disabled: true },
            data: [
              { name: '海南省', adcode: 460000 }, // 只显示海南/南海
              // 隐藏其他省份
              ...Object.keys(ADCODE_NAME).filter(c => Number(c) !== 460000).map(c => ({
                name: ADCODE_NAME[Number(c)],
                adcode: Number(c),
                itemStyle: { opacity: 0 }
              }))
            ]
          },
          // 热点散点
          {
            name: '热点',
            type: 'effectScatter',
            coordinateSystem: 'geo',
            showEffectOn: 'render',
            rippleEffect: { brushType: 'stroke', scale: 3.5, period: 4 },
            symbolSize: (val) => {
              const sev = hotspots.find(h => h.location[0] === val[0] && h.location[1] === val[1])?.severity
              return { blue: 8, yellow: 10, orange: 14, red: 18 }[sev] || 10
            },
            itemStyle: {
              color: (params) => {
                const h = hotspots.find(x => x.location[0] === params.data[0] && x.location[1] === params.data[1])
                return SEVERITY_COLOR[h?.severity] || '#666'
              },
              shadowBlur: 12,
              shadowColor: 'rgba(0, 0, 0, 0.3)'
            },
            label: {
              show: true,
              position: 'top',
              offset: [0, -2],
              formatter: (params) => {
                const h = hotspots.find(x => x.location[0] === params.data[0] && x.location[1] === params.data[1])
                return h ? WEATHER_TYPES[h.type].emoji : ''
              },
              fontSize: 14
            },
            data: hotspots.map(h => ({
              name: h.title,
              value: [...h.location, h.id],
              hotspot: h
            })),
            zlevel: 2
          }
        ]
      }

      chartInstance.current.setOption(option, true)

      // 点击事件
      chartInstance.current.off('click')
      chartInstance.current.on('click', (params) => {
        if (params.seriesType === 'map' && params.seriesName === '中国地图') {
          const hotspotsInProvince = hotspots.filter(h => h.provinceCode === params.data.adcode)
          if (hotspotsInProvince.length > 0) {
            onProvinceClick && onProvinceClick(hotspotsInProvince[0])
          }
        } else if (params.seriesType === 'effectScatter') {
          const hotspot = params.data.hotspot
          if (hotspot) {
            onSelect && onSelect(hotspot)
          }
        }
      })
    }

    const handleResize = () => {
      chartInstance.current?.resize()
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chartInstance.current?.dispose()
    }
  }, [hotspots, activeHotspotId, onSelect, onProvinceClick])

  return (
    <div className="relative w-full h-full">
      <div ref={chartRef} className="w-full h-full" />
      {/* 历史模式标识 */}
      {isHistorical && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-xs px-3 py-1 rounded-full shadow-lg z-10">
          📜 历史数据快照模式
        </div>
      )}
    </div>
  )
}
