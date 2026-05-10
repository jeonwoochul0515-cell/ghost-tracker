// 사업자 상세 슬라이드 패널 — 우측 fixed, ESC/배경 클릭으로 닫기
import { useEffect } from 'react'
import { X } from 'lucide-react'
import type { Business } from '@/types/domain'
import type { MemberStats } from './aggregate'
import { SectionTitle } from '@/components/typography/SectionTitle'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/cn'

interface MemberDrawerProps {
  member: Business | null
  stats: MemberStats | null
  onClose: () => void
}

const STATUS_LABEL: Record<Business['status'], string> = {
  active: '운영 중',
  closed: '폐업',
  reopened: '재등록',
}

export function MemberDrawer({ member, stats, onClose }: MemberDrawerProps) {
  useEffect(() => {
    if (!member) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [member, onClose])

  return (
    <>
      {/* backdrop */}
      <div
        onClick={onClose}
        className={cn(
          'fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300',
          member ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        )}
        aria-hidden
      />
      {/* drawer */}
      <aside
        className={cn(
          'fixed top-0 right-0 z-50 h-full w-full max-w-md bg-bg-2 border-l border-line transform transition-transform duration-300',
          member ? 'translate-x-0' : 'translate-x-full',
        )}
        aria-label="사업자 디테일"
        aria-hidden={!member}
      >
        {member && (
          <div className="h-full overflow-y-auto p-8">
            <div className="flex items-start justify-between mb-6">
              <SectionTitle>사업자 디테일</SectionTitle>
              <button
                type="button"
                onClick={onClose}
                className="text-ink-dim hover:text-ink transition-colors"
                aria-label="닫기"
              >
                <X className="size-5" />
              </button>
            </div>
            <h3 className="font-display italic font-black text-3xl text-ink leading-tight">
              {member.repNameMasked}
            </h3>
            <p className="mt-1 text-ink-dim font-mono text-sm">
              {member.bizNoMasked}
            </p>

            <dl className="mt-8 grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 text-sm">
              <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">상호</dt>
              <dd className="text-ink">{member.bizName}</dd>
              <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">상태</dt>
              <dd>
                <Badge variant={member.status === 'active' ? 'low' : 'mid'}>
                  {STATUS_LABEL[member.status]}
                </Badge>
              </dd>
              <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">개업일</dt>
              <dd className="text-ink font-mono text-xs">{member.openDate}</dd>
              {member.closeDate && (
                <>
                  <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">폐업일</dt>
                  <dd className="text-ink font-mono text-xs">{member.closeDate}</dd>
                </>
              )}
              <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">업종</dt>
              <dd className="text-ink-dim">{member.industry}</dd>
              <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">주소</dt>
              <dd className="text-ink-dim">{member.addressNormalized}</dd>
            </dl>

            {stats && (
              <div className="mt-10 pt-6 border-t border-line">
                <SectionTitle>응찰 활동</SectionTitle>
                <div className="mt-4 grid grid-cols-2 gap-6">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">응찰</p>
                    <p className="mt-1 font-display font-black text-3xl tabular-nums text-ink">
                      {stats.bids}
                    </p>
                  </div>
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">낙찰</p>
                    <p className="mt-1 font-display font-black text-3xl tabular-nums text-accent">
                      {stats.wins}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <p className="mt-10 text-xs text-ink-faint leading-relaxed">
              본 정보는 공개정보 통계 결합으로 산출된 추정이며 위법 단정이 아닙니다.
              사업자번호·대표자명·주소는 공개 화면에서 마스킹됩니다.
            </p>
          </div>
        )}
      </aside>
    </>
  )
}
