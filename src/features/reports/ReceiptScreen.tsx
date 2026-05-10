// 제출 후 접수번호 화면 — REPORT-2026-XXXX 형식
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { SectionTitle } from '@/components/typography/SectionTitle'

interface ReceiptScreenProps {
  receiptId: string
  kind: 'tip' | 'objection'
  onReset: () => void
}

export function ReceiptScreen({ receiptId, kind, onReset }: ReceiptScreenProps) {
  const title = kind === 'tip' ? '제보가 접수되었습니다' : '이의제기가 접수되었습니다'
  const note =
    kind === 'tip'
      ? '운영진 검토 후 비공개로 처리됩니다. 추가 확인이 필요할 경우 입력하신 연락처로 통보됩니다.'
      : '24시간 이내에 검토되며, 검토 기간 동안 해당 클러스터는 비공개로 전환됩니다.'

  return (
    <Card className="p-8 max-w-xl">
      <SectionTitle>접수 완료</SectionTitle>
      <h3 className="mt-3 font-display italic font-black text-3xl text-ink">
        {title}
      </h3>
      <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.25em] text-ink-faint">
        접수번호
      </p>
      <p className="mt-1 font-mono text-2xl text-accent select-all">
        {receiptId}
      </p>
      <p className="mt-6 text-sm text-ink-dim leading-relaxed">{note}</p>
      <Button variant="ghost" size="sm" onClick={onReset} className="mt-8">
        새로 작성
      </Button>
    </Card>
  )
}
