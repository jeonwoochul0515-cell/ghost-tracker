// 시드 제보·이의제기 3건 (관리자 큐 시연용).
import type { Report } from '@/types/domain'

export const reportsSeed: Report[] = [
  {
    id: 'REPORT-2026-0001',
    type: 'tip',
    targetClusterId: 'BSN-2026-0001',
    content:
      '같은 빌라에 등록된 5개 사업자가 우리 학교 입찰에 매번 함께 들어옵니다. 가족 명의로 분산 응찰하는 것 같습니다. 학부모로서 신고합니다.',
    contactEmail: 'tipster1@example.com',
    status: 'reviewing',
    createdAt: '2026-04-12',
  },
  {
    id: 'REPORT-2026-0002',
    type: 'objection',
    targetClusterId: 'BSN-2026-0006',
    targetBizNo: '9992200001',
    content:
      '도매시장에 정상 입주하여 영업 중인 사업자입니다. 같은 시장 입점이라는 이유로 의심 클러스터에 포함된 것은 부당합니다. 사업자등록증·임대차 계약서 첨부합니다.',
    contactEmail: 'biz@example.com',
    status: 'received',
    createdAt: '2026-04-28',
  },
  {
    id: 'REPORT-2026-0003',
    type: 'tip',
    content:
      '특정 식자재 업체가 학교 영양사에게 리베이트를 제공한다는 소문이 있습니다. 분신술과 별도 사안이지만 함께 살펴주시면 좋겠습니다.',
    status: 'received',
    createdAt: '2026-05-02',
  },
]
