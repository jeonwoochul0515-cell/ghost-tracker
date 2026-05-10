// 부산 학교 분포 지도 — 마커 색상은 의심 응찰 빈도, 클릭 시 onSelect
import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet'
import type { School } from '@/types/domain'
import type { SchoolBidStats } from './aggregate'

interface SchoolListMapProps {
  schools: School[]
  schoolStats: Map<string, SchoolBidStats>
  selectedCode: string | null
  onSelect: (code: string) => void
  className?: string
}

const BUSAN_CENTER: [number, number] = [35.1796, 129.0756]

function suspectColor(suspectCount: number): string {
  if (suspectCount === 0) return '#5a564f'      // ink-faint
  if (suspectCount < 3) return '#d4843c'         // warning
  return '#c14545'                                // danger
}

export function SchoolListMap({
  schools,
  schoolStats,
  selectedCode,
  onSelect,
  className,
}: SchoolListMapProps) {
  return (
    <div className={className}>
      <MapContainer
        center={BUSAN_CENTER}
        zoom={11}
        scrollWheelZoom={false}
        style={{ height: 520, width: '100%' }}
        className="border border-line"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {schools.map((school) => {
          const stats = schoolStats.get(school.code)
          const suspect = stats?.suspectBidCount ?? 0
          const color = suspectColor(suspect)
          const selected = selectedCode === school.code
          return (
            <CircleMarker
              key={school.code}
              center={[school.lat, school.lon]}
              radius={selected ? 11 : 7}
              pathOptions={{
                color,
                weight: selected ? 3 : 1.5,
                fillColor: color,
                fillOpacity: selected ? 0.7 : 0.5,
              }}
              eventHandlers={{ click: () => onSelect(school.code) }}
            >
              <Popup>
                <strong>{school.name}</strong>
                <br />
                {school.district}
                <br />
                의심 응찰 {suspect}건 / 총 {stats?.bidCount ?? 0}건
              </Popup>
            </CircleMarker>
          )
        })}
      </MapContainer>
    </div>
  )
}
