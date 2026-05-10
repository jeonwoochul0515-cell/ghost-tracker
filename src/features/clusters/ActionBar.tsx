// 클러스터 상세 sticky 액션 바 — 정보공개청구 / 이의제기 / CSV / 공유
import { Button } from '@/components/ui/Button'

interface ActionBarProps {
  clusterId: string
}

export function ActionBar({ clusterId }: ActionBarProps) {
  const handle = (action: string) =>
    console.info(`[Ghost Tracker] ${clusterId} action:`, action)

  return (
    <div className="sticky bottom-0 z-20 backdrop-blur-md bg-bg/85 border-t border-line">
      <div className="max-w-[1400px] mx-auto px-8 py-4 flex flex-wrap gap-3 items-center justify-end">
        <Button
          variant="primary"
          size="sm"
          onClick={() => handle('foia')}
        >
          정보공개청구 양식 만들기
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handle('objection')}
        >
          이의제기
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handle('csv')}
        >
          CSV 다운로드
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handle('share')}
        >
          공유 링크 복사
        </Button>
      </div>
    </div>
  )
}
