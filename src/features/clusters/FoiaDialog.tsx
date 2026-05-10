// 정보공개청구 양식 다이얼로그 — 자동 생성 미리보기 + .doc 다운로드 + info.go.kr 링크
import type { Cluster } from '@/types/domain'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { SectionTitle } from '@/components/typography/SectionTitle'
import { buildFoiaFormData, downloadFoiaDoc } from './foiaForm'

interface FoiaDialogProps {
  cluster: Cluster
  open: boolean
  onClose: () => void
}

export function FoiaDialog({ cluster, open, onClose }: FoiaDialogProps) {
  const data = buildFoiaFormData(cluster)

  return (
    <Dialog open={open} onClose={onClose} ariaLabel="정보공개청구 양식" className="max-w-2xl">
      <SectionTitle>정보공개청구 양식</SectionTitle>
      <h3 className="mt-2 font-display italic font-black text-2xl text-ink leading-tight">
        {data.subject}
      </h3>

      <dl className="mt-6 space-y-3 text-sm">
        <div>
          <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
            청구기관
          </dt>
          <dd className="mt-1 text-ink">
            {data.agency}
            <span className="ml-2 text-ink-dim text-xs">
              ({data.agencyDescription})
            </span>
          </dd>
        </div>
        <div>
          <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
            청구 범위
          </dt>
          <dd className="mt-1 text-ink-dim leading-relaxed">{data.scope}</dd>
        </div>
        <div>
          <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
            대상 기간
          </dt>
          <dd className="mt-1 text-ink-dim font-mono text-xs">
            {data.periodFrom} ~ {data.periodTo}
          </dd>
        </div>
        <div>
          <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
            공개 요청 항목 ({data.fields.length}개)
          </dt>
          <dd className="mt-1">
            <ul className="list-disc pl-5 text-ink-dim text-xs leading-relaxed">
              {data.fields.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </dd>
        </div>
      </dl>

      <p className="mt-6 text-xs text-ink-faint leading-relaxed">
        다운로드한 .doc 파일을 Word·한글·Google Docs 에서 열어 청구인 정보를 기재한
        뒤, 정보공개포털 (open.go.kr) 에서 제출하시면 됩니다.
      </p>

      <div className="mt-8 flex flex-wrap gap-3 justify-end">
        <Button variant="ghost" size="sm" onClick={onClose}>
          닫기
        </Button>
        <a
          href="https://www.open.go.kr"
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex items-center justify-center gap-2 h-8 px-3 text-[10px] font-mono uppercase tracking-[0.15em] bg-transparent text-ink border border-line hover:bg-bg-2 transition-colors"
        >
          정보공개포털 ↗
        </a>
        <Button
          variant="primary"
          size="sm"
          onClick={() => downloadFoiaDoc(cluster)}
        >
          .doc 다운로드
        </Button>
      </div>
    </Dialog>
  )
}
