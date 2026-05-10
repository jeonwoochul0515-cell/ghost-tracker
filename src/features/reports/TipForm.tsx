// 제보 폼 — RHF + Zod. 제보 유형 / 의심 사업자 / 의심 학교 / 내용 / 연락처 / 동의
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { api } from '@/hooks/_api'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { SectionTitle } from '@/components/typography/SectionTitle'
import { ReceiptScreen } from './ReceiptScreen'

const TIP_TYPES = ['분신술', '담합', '리베이트', '위생', '기타'] as const

const tipSchema = z.object({
  tipType: z.enum(TIP_TYPES),
  suspectBizNo: z.string().optional(),
  suspectSchool: z.string().optional(),
  content: z
    .string()
    .min(10, '제보 내용은 최소 10자 이상 작성해주세요.'),
  contactEmail: z
    .union([z.string().email('올바른 이메일을 입력해주세요.'), z.literal('')])
    .optional(),
  consent: z.literal(true, {
    errorMap: () => ({ message: '개인정보 처리·허위제보 책임 동의가 필요합니다.' }),
  }),
})

type TipForm = z.infer<typeof tipSchema>

export function TipForm() {
  const [receipt, setReceipt] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<TipForm>({
    resolver: zodResolver(tipSchema),
    defaultValues: {
      tipType: '분신술',
      suspectBizNo: '',
      suspectSchool: '',
      content: '',
      contactEmail: '',
    },
  })

  async function onSubmit(values: TipForm) {
    setSubmitError(null)
    try {
      const tipNote = [
        `[유형] ${values.tipType}`,
        values.suspectBizNo ? `[의심 사업자] ${values.suspectBizNo}` : null,
        values.suspectSchool ? `[의심 학교] ${values.suspectSchool}` : null,
        '',
        values.content,
      ]
        .filter(Boolean)
        .join('\n')

      const result = await api.submitReport({
        type: 'tip',
        targetBizNo: values.suspectBizNo || undefined,
        content: tipNote,
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
        kind="tip"
        onReset={() => setReceipt(null)}
      />
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-2xl">
      <div>
        <SectionTitle>제보 유형</SectionTitle>
        <select
          {...register('tipType')}
          className="mt-3 h-10 w-full bg-bg border border-line px-3 text-sm text-ink font-mono focus:outline-none focus:border-accent"
        >
          {TIP_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <SectionTitle>의심 사업자 (선택)</SectionTitle>
          <Input
            {...register('suspectBizNo')}
            placeholder="사업자번호 또는 상호"
            className="mt-3"
          />
        </div>
        <div>
          <SectionTitle>의심 학교 (선택)</SectionTitle>
          <Input
            {...register('suspectSchool')}
            placeholder="학교명"
            className="mt-3"
          />
        </div>
      </div>

      <div>
        <SectionTitle>제보 내용</SectionTitle>
        <textarea
          {...register('content')}
          rows={6}
          placeholder="관찰한 사실관계를 가능한 구체적으로 작성해주세요."
          className="mt-3 w-full bg-bg border border-line p-3 text-sm text-ink placeholder:text-ink-faint font-serif-kr leading-relaxed focus:outline-none focus:border-accent"
        />
        {errors.content && (
          <p className="mt-1 text-xs text-danger">{errors.content.message}</p>
        )}
      </div>

      <div>
        <SectionTitle>연락처 (선택, 익명 가능)</SectionTitle>
        <Input
          {...register('contactEmail')}
          type="email"
          placeholder="추가 확인이 필요할 때만 사용됩니다"
          className="mt-3"
        />
        {errors.contactEmail && (
          <p className="mt-1 text-xs text-danger">
            {errors.contactEmail.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label className="flex items-start gap-3 text-sm cursor-pointer">
          <input
            type="checkbox"
            {...register('consent')}
            className="mt-1 accent-accent"
          />
          <span className="text-ink-dim leading-relaxed">
            제보 내용은 운영진이 검토 후 비공개로 처리되며, 제보자의 개인정보는
            확인 목적 외에는 사용되지 않습니다. 허위·악의적 제보의 경우
            법적 책임을 질 수 있음에 동의합니다.
          </span>
        </label>
        {errors.consent && (
          <p className="text-xs text-danger">{errors.consent.message}</p>
        )}
      </div>

      {submitError && (
        <p className="text-sm text-danger font-mono">{submitError}</p>
      )}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? '제출 중...' : '제보 제출'}
      </Button>
    </form>
  )
}
