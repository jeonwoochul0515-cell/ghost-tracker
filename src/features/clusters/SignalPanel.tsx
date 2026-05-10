// 정적 신호 4분할 패널 — 동일주소 / 가족추정 / 신규낙찰 / 폐업회전 매칭
import type { Cluster, ClusterSignal } from '@/types/domain'
import { Card } from '@/components/ui/Card'
import { SectionTitle } from '@/components/typography/SectionTitle'
import { cn } from '@/lib/cn'

interface SignalPanelProps {
  cluster: Cluster
}

interface PanelDef {
  key: string                          // substring 매칭
  label: string
  description: string
}

const PANELS: PanelDef[] = [
  {
    key: '동일주소',
    label: '동일 주소',
    description: '같은 빌라/번지에 다수 사업자가 등록된 패턴',
  },
  {
    key: '가족',
    label: '가족 추정',
    description: '같은 성씨·관계자 명의로 추정되는 등록',
  },
  {
    key: '신규',
    label: '신규 낙찰',
    description: '신규 등록 직후 단기 대형 낙찰 패턴',
  },
  {
    key: '폐업',
    label: '폐업 회전',
    description: '폐업 후 같은 주소·대표자로 재등록 회전',
  },
]

function levelClass(level: ClusterSignal['level']): string {
  if (level === 'S+' || level === 'S') return 'text-danger border-danger/40'
  if (level === 'A') return 'text-warning border-warning/40'
  return 'text-ink-faint border-line'
}

export function SignalPanel({ cluster }: SignalPanelProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {PANELS.map((panel) => {
        const matched = cluster.signals.find((s) => s.text.includes(panel.key))
        return (
          <Card key={panel.key} className="p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <SectionTitle>{panel.label}</SectionTitle>
              {matched ? (
                <span
                  className={cn(
                    'font-mono text-[9px] uppercase px-1.5 py-0.5 border',
                    levelClass(matched.level),
                  )}
                >
                  {matched.level}
                </span>
              ) : (
                <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 border border-line text-ink-faint">
                  N/A
                </span>
              )}
            </div>
            <p className="text-sm leading-relaxed text-ink-dim flex-1">
              {matched ? matched.text : '관측되지 않음'}
            </p>
            <p className="text-xs text-ink-faint leading-relaxed">
              {panel.description}
            </p>
          </Card>
        )
      })}
    </div>
  )
}
