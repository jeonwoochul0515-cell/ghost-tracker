// 단골 응찰자 TOP 10 테이블 — 클러스터 소속 행은 accent 배지
import { Link } from 'react-router-dom'
import type { BidderRow } from './aggregate'

interface TopBiddersProps {
  rows: BidderRow[]
}

export function TopBidders({ rows }: TopBiddersProps) {
  if (rows.length === 0) {
    return (
      <p className="text-ink-faint font-mono text-xs">
        응찰 이력이 없습니다.
      </p>
    )
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left border-b border-line">
            <th className="py-3 pr-4 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint font-normal">
              #
            </th>
            <th className="py-3 pr-4 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint font-normal">
              사업자명
            </th>
            <th className="py-3 pr-4 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint font-normal">
              사업자번호
            </th>
            <th className="py-3 pr-4 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint font-normal">
              대표
            </th>
            <th className="py-3 pr-4 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint font-normal">
              클러스터
            </th>
            <th className="py-3 pl-4 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint font-normal text-right">
              낙찰/응찰
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.bizNo} className="border-b border-line/50">
              <td className="py-3 pr-4 font-mono text-xs text-ink-faint">
                {String(i + 1).padStart(2, '0')}
              </td>
              <td className="py-3 pr-4 text-ink">{r.bizName}</td>
              <td className="py-3 pr-4 font-mono text-xs text-ink-dim">
                {r.bizNoMasked}
              </td>
              <td className="py-3 pr-4 text-ink-dim">{r.repNameMasked}</td>
              <td className="py-3 pr-4">
                {r.clusterId ? (
                  <Link
                    to={`/clusters/${r.clusterId}`}
                    className="font-mono text-xs text-accent hover:underline"
                  >
                    {r.clusterId}
                  </Link>
                ) : (
                  <span className="text-ink-faint text-xs">—</span>
                )}
              </td>
              <td className="py-3 pl-4 text-right font-mono text-xs">
                <span className="text-accent">{r.wins}</span>
                <span className="text-ink-faint mx-1">/</span>
                <span className="text-ink">{r.bids}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
