// 응찰·낙찰 시계열 — Recharts ComposedChart. 막대(좌측 응찰 수) + 선(우측 낙찰액).
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { MonthBucket } from './aggregate'
import { formatKRW } from '@/lib/format'

interface ClusterTimeSeriesChartProps {
  monthly: MonthBucket[]
}

export function ClusterTimeSeriesChart({ monthly }: ClusterTimeSeriesChartProps) {
  const data = monthly.map((m) => ({
    month: m.month.slice(2), // 'YY-MM'
    bids: m.bids,
    winAmount: m.winAmount,
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={data} margin={{ top: 16, right: 32, bottom: 8, left: 8 }}>
        <CartesianGrid strokeDasharray="2 4" stroke="#2a2825" />
        <XAxis
          dataKey="month"
          tick={{ fill: '#a8a29a', fontSize: 10, fontFamily: 'IBM Plex Mono' }}
          stroke="#2a2825"
          interval={1}
        />
        <YAxis
          yAxisId="left"
          tick={{ fill: '#a8a29a', fontSize: 10, fontFamily: 'IBM Plex Mono' }}
          stroke="#2a2825"
          label={{
            value: '응찰',
            angle: -90,
            position: 'insideLeft',
            fill: '#5a564f',
            fontSize: 10,
          }}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          tick={{ fill: '#a8a29a', fontSize: 10, fontFamily: 'IBM Plex Mono' }}
          stroke="#2a2825"
          tickFormatter={(v: number) => formatKRW(v).replace('원', '')}
          label={{
            value: '낙찰액',
            angle: 90,
            position: 'insideRight',
            fill: '#5a564f',
            fontSize: 10,
          }}
        />
        <Tooltip
          contentStyle={{
            background: '#131312',
            border: '1px solid #2a2825',
            fontFamily: 'IBM Plex Mono',
            fontSize: 11,
          }}
          labelStyle={{ color: '#f5f1e8' }}
          formatter={(value: number, name: string) => {
            if (name === '낙찰액') return [formatKRW(value), name]
            return [value, name]
          }}
        />
        <Bar yAxisId="left" dataKey="bids" fill="#5a564f" name="응찰" />
        <Line
          yAxisId="right"
          dataKey="winAmount"
          stroke="#d4ad3c"
          strokeWidth={2}
          dot={{ fill: '#d4ad3c', r: 3 }}
          name="낙찰액"
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
