// 이의제기 폼 — 대상 클러스터 ID + 사유 + 상세 + 신원(선택). 24시간 SLA 안내 박스.
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { api } from '@/hooks/_api'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { SectionTitle } from '@/components/typography/SectionTitle'
import { ReceiptScreen } from './ReceiptScreen'

const REASONS = ['오매칭', '사실관계 오류', '추가 정보'] as const

const objectionSchema = z.object({
  clusterId: z
    .string()
    .min(1, '클러스터 ID 를 입력해주세요. 예) BSN-2026-0001'),
  reason: z.enum(REASONS),
  detail: z
    .string()
    .min(10, '상세 사유는 최소 10자 이상 작성해주세요.'),
  identity: z.string().optional(),
  contactEmail: z
    .union([z.string().email('올바른 이메일을 입력해주세요.'), z.literal('')])
    .optional(),
})

type ObjectionForm = z.infer<typeof objectionSchema>

interface ObjectionFormProps {
  initialClusterId?: string
}

export function ObjectionForm({ initialClusterId = '' }: ObjectionFormProps) {
  const [receipt, setReceipt] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ObjectionForm>({
    resolver: zodResolver(objectionSchema),
    defaultValues: {
      clusterId: initialClusterId,
      reason: '오매칭',
      detail: '',
      identity: '',
      contactEmail: '',
    },
  })

  async function onSubmit(values: ObjectionForm) {
    setSubmitError(null)
    try {
      const note = [
        `[사유] ${values.reason}`,
        values.identity ? `[신원] ${values.identity}` : null,
        '',
        values.detail,
      ]
        .filter(Boolean)
        .join('\n')

      const result = await api.submitReport({
        type: 'objection',
        targetClusterId: values.clusterId,
        content: note,
        contactEmail: values.contactEmail || undefined,
      })
      setReceipt(result.id)
      reset()
    } catch (e: unknown) {
      setSubmitError(
        e instanceof Error ? e.message : '제출 중 오류가 발생했습니다.',
      )
    }
  }

  if (receipt) {
    return (
      <ReceiptScreen
        receiptId={receipt}
        kind="objection"
        onReset={() => setReceipt(null)}
      />
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-2xl">
      <div className="border border-warning/40 bg-warning/10 p-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-warning">
          24시간 내 비공개 처리
        </p>
        <p className="mt-2 text-sm text-ink-dim leading-relaxed">
          접수된 이의제기는 운영진이 24시간 이내에 검토하며, 검토 기간 동안 해당
          클러스터를 비공개로 전환합니다. 사업자 본인 검증을 위해 사업자등록증
          첨부가 권장됩니다 (현재 시드 단계에서는 첨부 처리 안 됨).
        </p>
      </div>

      <div>
        <SectionTitle>대상 클러스터 ID</SectionTitle>
        <Input
          {...register('clusterId')}
          placeholder="BSN-2026-0001"
          className="mt-3"
        />
        {errors.clusterId && (
          <p className="mt-1 text-xs text-danger">{errors.clusterId.message}</p>
        )}
      </div>

      <div>
        <SectionTitle>사유</SectionTitle>
        <ul className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
          {REASONS.map((r) => (
            <li key={r}>
              <label className="flex items-center gap-2 px-3 py-2 border border-line cursor-pointer hover:bg-bg-3/50 has-[:checked]:border-accent has-[:checked]:text-accent">
                <input
                  type="radio"
                  value={r}
                  {...register('reason')}
                  className="accent-accent"
                />
                <span className="text-sm">{r}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <SectionTitle>상세 사유</SectionTitle>
        <textarea
          {...register('detail')}
          rows={6}
          placeholder="해당 클러스터 매칭이 부당한 이유를 구체적으로 작성해주세요."
          className="mt-3 w-full bg-bg border border-line p-3 text-sm text-ink placeholder:text-ink-faint font-serif-kr leading-relaxed focus:outline-none focus:border-accent"
        />
        {errors.detail && (
          <p className="mt-1 text-xs text-danger">{errors.detail.message}</p>
        )}
      </div>

      <div>
        <SectionTitle>신원 (선택)</SectionTitle>
        <Input
          {...register('identity')}
          placeholder="대표자명 또는 사업자번호 (사업자 본인 검증용)"
          className="mt-3"
        />
      </div>

      <div>
        <SectionTitle>연락처 (선택)</SectionTitle>
        <Input
          {...register('contactEmail')}
          type="email"
          placeholder="처리 결과 통보용 이메일"
          className="mt-3"
        />
        {errors.contactEmail && (
          <p className="mt-1 text-xs text-danger">
            {errors.contactEmail.message}
          </p>
        )}
      </div>

      {submitError && (
        <p className="text-sm text-danger font-mono">{submitError}</p>
      )}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? '제출 중...' : '이의제기 제출'}
      </Button>
    </form>
  )
}
