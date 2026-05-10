// 학교 분포 지도 — react-leaflet. CircleMarker 크기 = 클러스터 낙찰 횟수
import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet'
import type { School } from '@/types/domain'

interface SchoolMapProps {
  schoolWins: { school: School; wins: number }[]
  className?: string
}

const BUSAN_CENTER: [number, number] = [35.18, 129.0756]

export function SchoolMap({ schoolWins, className }: SchoolMapProps) {
  return (
    <div className={className}>
      <MapContainer
        center={BUSAN_CENTER}
        zoom={11}
        scrollWheelZoom={false}
        style={{ height: 400, width: '100%' }}
        className="border border-line"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {schoolWins.map(({ school, wins }) => (
          <CircleMarker
            key={school.code}
            center={[school.lat, school.lon]}
            radius={Math.sqrt(wins) * 4 + 6}
            pathOptions={{
              color: '#d4ad3c',
              weight: 1.5,
              fillColor: '#d4ad3c',
              fillOpacity: 0.45,
            }}
          >
            <Popup>
              <strong>{school.name}</strong>
              <br />
              {school.district} · 낙찰 {wins}건
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  )
}
