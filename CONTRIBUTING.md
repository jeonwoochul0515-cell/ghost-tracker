# Contributing

Ghost Bidder Tracker 에 기여해주셔서 감사합니다.

## 시작 가이드

`README.md` 의 로컬 개발 섹션 참고. mock 모드(`VITE_USE_MOCK=true`)로 5분 안에 실행 가능합니다.

## 이슈 리포트

다음 정보를 포함해주세요.
- 재현 절차 (스크린샷 권장)
- 기대 동작 vs 실제 동작
- 환경 (브라우저, OS, mock/live 모드)

## PR 가이드

1. `main` 에서 분기 → 의미 단위 커밋 (Conventional Commits)
   - `feat:` 새 기능
   - `fix:` 버그 수정
   - `docs:` 문서
   - `refactor:` 리팩토링
2. 커밋 단위로 다음 검증 통과 필요:
   - `npm run typecheck`
   - `npm run test`
   - `npm run build`
3. 표현 가이드 준수 (`src/lib/wording.ts` 의 금지 단어 회피)
4. 면책 표시 영향 변경 시 변호사 검토 라벨 부여

## 신호 추가

`src/features/scoring/signals.ts` 에 새 `SignalDef` 추가하고 다음 함께 갱신.
- `signals.test.ts` — 정/오 케이스 ≥ 2개
- `MethodologyPage` — 자동으로 노출됨 (`ALL_SIGNALS` import)
- `seed.test.ts` — 기대 등급 영향 시 갱신

## 코드 스타일

- 파일 첫 줄에 한국어 한 줄 주석 (역할 설명)
- 변수·함수명은 영문 camelCase, 표시 텍스트는 한국어
- 컴포넌트 1 파일 1 export 권장

## 커뮤니케이션

- 이슈: GitHub Issues
- 보안 취약점: security@ghostbid.kr (공개 이슈 X)
- 일반 문의: contact@ghostbid.kr
