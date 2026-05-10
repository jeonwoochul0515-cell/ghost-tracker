// 사이트 푸터 — 운영주체·출처·면책 3분할
import { cn } from '@/lib/cn'

interface FooterProps {
  className?: string
}

export function Footer({ className }: FooterProps) {
  return (
    <footer className={cn('border-t border-line mt-16 relative z-10', className)}>
      <div className="max-w-[1400px] mx-auto px-8 py-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-dim mb-3">
            Operator
          </p>
          <p className="text-ink-dim leading-relaxed">
            법무법인 청송과 협력하는 부산 시민 공익 모니터링 도구.
          </p>
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-dim mb-3">
            Sources
          </p>
          <ul className="space-y-1 text-ink-dim">
            <li>공공데이터포털 — eaT · 국세청</li>
            <li>도로명주소 — 행정안전부</li>
            <li>사법정보공유포털</li>
            <li className="pt-1 text-ink-faint">라이선스: 공공누리 1유형</li>
          </ul>
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-dim mb-3">
            Disclaimer
          </p>
          <p className="text-ink-faint leading-relaxed text-xs">
            본 정보는 공개정보 통계 결합으로 산출된 추정이며 위법 단정이 아닙니다.
            이의제기는 24시간 내 비공개 처리됩니다.
          </p>
        </div>
      </div>
    </footer>
  )
}
