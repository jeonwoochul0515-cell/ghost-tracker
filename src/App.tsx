// 앱 루트 — P01 스캐폴드 검증용 최소 placeholder. P02 에서 디자인 시스템·라우팅으로 교체 예정.
function App() {
  return (
    <main className="min-h-screen px-8 py-16 max-w-4xl mx-auto">
      <p className="text-xs uppercase tracking-[0.2em] text-accent font-mono">
        Vol. 01 · Public Interest Monitor
      </p>
      <h1 className="mt-4 text-5xl md:text-6xl font-display italic font-black leading-tight">
        Ghost Bidder Tracker
      </h1>
      <p className="mt-2 text-2xl font-serif-kr text-ink-dim">
        부산 학교급식 유령입찰 추적기
      </p>
      <hr className="my-8 border-line" />
      <p className="text-ink-dim leading-relaxed">
        P01 스캐폴드 검증 페이지. Vite + React 19 + TypeScript + TailwindCSS 가 정상 동작 중이면
        다크 배경(#0a0a0a) 위에 본문(#f5f1e8) 과 강조(#d4ad3c) 가 보입니다.
      </p>
      <p className="mt-2 text-ink-faint text-sm font-mono">
        다음 단계 — P02 디자인 시스템 + 글로벌 스타일.
      </p>
    </main>
  )
}

export default App
