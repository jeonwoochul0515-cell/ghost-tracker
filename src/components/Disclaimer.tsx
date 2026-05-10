// 면책 표시 — 클러스터·사업자 화면 어디든 자동 노출되는 공통 박스
import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'

interface DisclaimerProps {
  className?: string
  variant?: 'default' | 'compact'
}

export function Disclaimer({ className, variant = 'default' }: DisclaimerProps) {
  if (variant === 'compact') {
    return (
      <p
        className={cn(
          'text-xs text-ink-faint leading-relaxed',
          className,
        )}
      >
        본 정보는 공개정보 통계 결합으로 산출된 추정이며 위법 단정이 아닙니다.
        이의제기는 24시간 내 비공개 처리됩니다.
      </p>
    )
  }
  return (
    <div className={cn('border-l-2 border-warning/40 pl-4 py-2', className)}>
      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-warning mb-2">
        Disclaimer
      </p>
      <p className="text-xs text-ink-faint leading-relaxed">
        본 추적은 공개정보 통계 결합으로 산출된 패턴 추정이며 위법 단정이 아닙니다.
        사업자번호·대표자명·주소는 마스킹되어 표시되며, 매칭 결과에 이의가 있는
        경우{' '}
        <Link to="/report" className="text-ink-dim hover:text-ink underline underline-offset-4">
          제보·이의제기 페이지
        </Link>{' '}
        에서 24시간 이내 비공개 처리됩니다. 출처: 공공데이터포털(eaT · 국세청) · 도로명주소 · 사법정보공유포털 / 라이선스 공공누리 1유형.
      </p>
    </div>
  )
}
