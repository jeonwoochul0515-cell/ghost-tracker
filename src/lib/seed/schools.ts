// 부산 16개 구·군 분포 학교 50개 시드. 코드는 PSN-001 형식, 이름·주소 모두 가상.
import type { School } from '@/types/domain'

interface S {
  code: string
  name: string
  district: string
  lat: number
  lon: number
  road: string
  num: number
  students: number
}

function toSchool(s: S): School {
  return {
    code: s.code,
    name: s.name,
    address: `부산광역시 ${s.district} ${s.road} ${s.num}`,
    district: s.district,
    lat: s.lat,
    lon: s.lon,
    studentCount: s.students,
  }
}

export const schoolsSeed: School[] = [
  // 동래구 (클러스터 다발 구역, 5개)
  { code: 'PSN-001', name: '동래데모초등학교 (가상)', district: '동래구', lat: 35.2058, lon: 129.0790, road: '가상로', num: 11, students: 612 },
  { code: 'PSN-002', name: '동래샘플중학교 (가상)', district: '동래구', lat: 35.2104, lon: 129.0815, road: '가상대로', num: 88, students: 488 },
  { code: 'PSN-003', name: '동래데모고등학교 (가상)', district: '동래구', lat: 35.2030, lon: 129.0856, road: '가상로', num: 24, students: 821 },
  { code: 'PSN-004', name: '온천샘플초등학교 (가상)', district: '동래구', lat: 35.2155, lon: 129.0742, road: '가상천로', num: 12, students: 530 },
  { code: 'PSN-005', name: '복천데모초등학교 (가상)', district: '동래구', lat: 35.2089, lon: 129.0901, road: '가상복천로', num: 33, students: 410 },

  // 연제구 (5개)
  { code: 'PSN-006', name: '연산데모초등학교 (가상)', district: '연제구', lat: 35.1788, lon: 129.0810, road: '가상로', num: 77, students: 678 },
  { code: 'PSN-007', name: '거제샘플초등학교 (가상)', district: '연제구', lat: 35.1820, lon: 129.0742, road: '가상대로', num: 88, students: 552 },
  { code: 'PSN-008', name: '연제데모중학교 (가상)', district: '연제구', lat: 35.1755, lon: 129.0768, road: '가상로', num: 33, students: 433 },
  { code: 'PSN-009', name: '거제샘플고등학교 (가상)', district: '연제구', lat: 35.1842, lon: 129.0805, road: '가상로', num: 11, students: 745 },
  { code: 'PSN-010', name: '연산샘플여자중학교 (가상)', district: '연제구', lat: 35.1801, lon: 129.0832, road: '가상로', num: 55, students: 380 },

  // 해운대구 (5개)
  { code: 'PSN-011', name: '해운대데모초등학교 (가상)', district: '해운대구', lat: 35.1631, lon: 129.1635, road: '가상해변로', num: 12, students: 720 },
  { code: 'PSN-012', name: '센텀샘플초등학교 (가상)', district: '해운대구', lat: 35.1696, lon: 129.1303, road: '가상로', num: 9, students: 590 },
  { code: 'PSN-013', name: '좌동데모중학교 (가상)', district: '해운대구', lat: 35.1660, lon: 129.1737, road: '가상해변로', num: 33, students: 510 },
  { code: 'PSN-014', name: '반여샘플고등학교 (가상)', district: '해운대구', lat: 35.1985, lon: 129.1342, road: '가상로', num: 7, students: 920 },
  { code: 'PSN-015', name: '재송데모초등학교 (가상)', district: '해운대구', lat: 35.1789, lon: 129.1218, road: '가상로', num: 22, students: 488 },

  // 사상구 (4개)
  { code: 'PSN-016', name: '사상데모초등학교 (가상)', district: '사상구', lat: 35.1525, lon: 128.9911, road: '가상공단로', num: 55, students: 421 },
  { code: 'PSN-017', name: '괘법샘플중학교 (가상)', district: '사상구', lat: 35.1592, lon: 128.9836, road: '가상로', num: 12, students: 389 },
  { code: 'PSN-018', name: '주례데모고등학교 (가상)', district: '사상구', lat: 35.1466, lon: 128.9956, road: '가상공단로', num: 99, students: 612 },
  { code: 'PSN-019', name: '학장샘플초등학교 (가상)', district: '사상구', lat: 35.1418, lon: 128.9889, road: '가상로', num: 17, students: 322 },

  // 강서구 (3개)
  { code: 'PSN-020', name: '강서데모초등학교 (가상)', district: '강서구', lat: 35.2128, lon: 128.9805, road: '가상강로', num: 21, students: 410 },
  { code: 'PSN-021', name: '명지샘플중학교 (가상)', district: '강서구', lat: 35.0970, lon: 128.9180, road: '가상해안로', num: 33, students: 528 },
  { code: 'PSN-022', name: '대저데모초등학교 (가상)', district: '강서구', lat: 35.2240, lon: 128.9682, road: '가상강로', num: 8, students: 256 },

  // 금정구 (3개)
  { code: 'PSN-023', name: '금정데모초등학교 (가상)', district: '금정구', lat: 35.2425, lon: 129.0925, road: '가상로', num: 14, students: 480 },
  { code: 'PSN-024', name: '구서샘플중학교 (가상)', district: '금정구', lat: 35.2510, lon: 129.0918, road: '가상로', num: 28, students: 412 },
  { code: 'PSN-025', name: '장전데모고등학교 (가상)', district: '금정구', lat: 35.2333, lon: 129.0860, road: '가상로', num: 5, students: 730 },

  // 기장군 (3개)
  { code: 'PSN-026', name: '기장데모초등학교 (가상)', district: '기장군', lat: 35.2440, lon: 129.2189, road: '가상해안로', num: 19, students: 388 },
  { code: 'PSN-027', name: '정관샘플중학교 (가상)', district: '기장군', lat: 35.3215, lon: 129.1942, road: '가상로', num: 11, students: 502 },
  { code: 'PSN-028', name: '일광데모초등학교 (가상)', district: '기장군', lat: 35.2698, lon: 129.2382, road: '가상해안로', num: 7, students: 218 },

  // 남구 (3개)
  { code: 'PSN-029', name: '남구데모초등학교 (가상)', district: '남구', lat: 35.1364, lon: 129.0838, road: '가상로', num: 16, students: 522 },
  { code: 'PSN-030', name: '용호샘플중학교 (가상)', district: '남구', lat: 35.1235, lon: 129.1013, road: '가상해안로', num: 22, students: 460 },
  { code: 'PSN-031', name: '대연데모고등학교 (가상)', district: '남구', lat: 35.1335, lon: 129.0936, road: '가상로', num: 8, students: 815 },

  // 동구 (2개)
  { code: 'PSN-032', name: '범일데모초등학교 (가상)', district: '동구', lat: 35.1373, lon: 129.0588, road: '가상로', num: 13, students: 312 },
  { code: 'PSN-033', name: '수정샘플중학교 (가상)', district: '동구', lat: 35.1308, lon: 129.0470, road: '가상로', num: 27, students: 388 },

  // 부산진구 (3개)
  { code: 'PSN-034', name: '서면데모초등학교 (가상)', district: '부산진구', lat: 35.1572, lon: 129.0598, road: '가상로', num: 11, students: 580 },
  { code: 'PSN-035', name: '양정샘플중학교 (가상)', district: '부산진구', lat: 35.1721, lon: 129.0708, road: '가상로', num: 33, students: 470 },
  { code: 'PSN-036', name: '연지데모초등학교 (가상)', district: '부산진구', lat: 35.1689, lon: 129.0596, road: '가상로', num: 22, students: 392 },

  // 북구 (3개)
  { code: 'PSN-037', name: '북구데모초등학교 (가상)', district: '북구', lat: 35.1985, lon: 129.0124, road: '가상로', num: 9, students: 415 },
  { code: 'PSN-038', name: '구포샘플중학교 (가상)', district: '북구', lat: 35.2068, lon: 129.0089, road: '가상강로', num: 18, students: 502 },
  { code: 'PSN-039', name: '만덕데모고등학교 (가상)', district: '북구', lat: 35.2183, lon: 129.0379, road: '가상로', num: 7, students: 770 },

  // 사하구 (3개)
  { code: 'PSN-040', name: '사하데모초등학교 (가상)', district: '사하구', lat: 35.1041, lon: 128.9745, road: '가상로', num: 16, students: 348 },
  { code: 'PSN-041', name: '하단샘플중학교 (가상)', district: '사하구', lat: 35.1078, lon: 128.9665, road: '가상로', num: 25, students: 432 },
  { code: 'PSN-042', name: '다대데모초등학교 (가상)', district: '사하구', lat: 35.0656, lon: 128.9678, road: '가상해안로', num: 11, students: 289 },

  // 서구 (2개)
  { code: 'PSN-043', name: '서구데모초등학교 (가상)', district: '서구', lat: 35.0972, lon: 129.0237, road: '가상로', num: 14, students: 268 },
  { code: 'PSN-044', name: '아미샘플중학교 (가상)', district: '서구', lat: 35.1046, lon: 129.0162, road: '가상로', num: 8, students: 354 },

  // 수영구 (2개)
  { code: 'PSN-045', name: '수영데모초등학교 (가상)', district: '수영구', lat: 35.1455, lon: 129.1180, road: '가상로', num: 21, students: 510 },
  { code: 'PSN-046', name: '광안샘플중학교 (가상)', district: '수영구', lat: 35.1530, lon: 129.1188, road: '가상해변로', num: 13, students: 462 },

  // 영도구 (2개)
  { code: 'PSN-047', name: '영도데모초등학교 (가상)', district: '영도구', lat: 35.0936, lon: 129.0648, road: '가상로', num: 12, students: 318 },
  { code: 'PSN-048', name: '청학샘플중학교 (가상)', district: '영도구', lat: 35.0858, lon: 129.0695, road: '가상해안로', num: 9, students: 277 },

  // 중구 (1개)
  { code: 'PSN-049', name: '중구데모초등학교 (가상)', district: '중구', lat: 35.1010, lon: 129.0327, road: '가상로', num: 7, students: 198 },

  // 강서구 추가 1개로 50번 채움
  { code: 'PSN-050', name: '가덕샘플초등학교 (가상)', district: '강서구', lat: 35.0322, lon: 128.8312, road: '가상해안로', num: 5, students: 142 },
].map(toSchool)
