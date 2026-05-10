// 24개월 응찰·낙찰 타임라인 — 막대 24개, win=accent / bid=ink-faint, hover tooltip
import type { MonthBucket } from './aggregate'
import { Tooltip } from '@/components/ui/Tooltip'
import { cn } from '@/lib/cn'

interface TimelineBarsProps {
  data: MonthBucket[]
  className?: string
}

export function TimelineBars({ data, className }: TimelineBarsProps) {
  const maxBids = Math.max(1, ...data.map((m) => m.bids))
  return (
    <div className={cn('flex items-end gap-0.5 h-16 w-full', className)}>
      {data.map((m) => {
        const bidPct = (m.bids / maxBids) * 100
        const winPct = (m.wins / maxBids) * 100
        return (
          <Tooltip
            key={m.month}
            content={`${m.month} · 응찰 ${m.bids} · 낙찰 ${m.wins}`}
            className="text-[10px]"
          >
            <span className="relative flex-1 h-full flex flex-col-reverse cursor-default">
              <span
                className="bg-ink-faint/60 w-full"
                style={{ height: `${Math.max(bidPct, m.bids > 0 ? 6 : 0)}%` }}
              />
              {m.wins > 0 && (
                <span
                  className="bg-accent w-full absolute bottom-0 left-0"
                  style={{ height: `${Math.max(winPct, 6)}%` }}
                />
              )}
            </span>
          </Tooltip>
        )
      })}
    </div>
  )
}
