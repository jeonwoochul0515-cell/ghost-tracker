// 앱 루트 — BrowserRouter + 라우트 단위 lazy 코드 스플릿 + Header/Footer
import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

// 페이지는 named export 라 default 로 변환해 lazy() 에 전달.
const DashboardPage = lazy(() =>
  import('@/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })),
)
const ClustersPage = lazy(() =>
  import('@/pages/ClustersPage').then((m) => ({ default: m.ClustersPage })),
)
const ClusterDetailPage = lazy(() =>
  import('@/pages/ClusterDetailPage').then((m) => ({
    default: m.ClusterDetailPage,
  })),
)
const SchoolsPage = lazy(() =>
  import('@/pages/SchoolsPage').then((m) => ({ default: m.SchoolsPage })),
)
const SchoolDetailPage = lazy(() =>
  import('@/pages/SchoolDetailPage').then((m) => ({
    default: m.SchoolDetailPage,
  })),
)
const CasesPage = lazy(() =>
  import('@/pages/CasesPage').then((m) => ({ default: m.CasesPage })),
)
const CaseDetailPage = lazy(() =>
  import('@/pages/CaseDetailPage').then((m) => ({ default: m.CaseDetailPage })),
)
const ReportPage = lazy(() =>
  import('@/pages/ReportPage').then((m) => ({ default: m.ReportPage })),
)
const MethodologyPage = lazy(() =>
  import('@/pages/MethodologyPage').then((m) => ({
    default: m.MethodologyPage,
  })),
)
const ApiPage = lazy(() =>
  import('@/pages/ApiPage').then((m) => ({ default: m.ApiPage })),
)
const AdminPage = lazy(() =>
  import('@/pages/AdminPage').then((m) => ({ default: m.AdminPage })),
)
const TermsPage = lazy(() =>
  import('@/pages/TermsPage').then((m) => ({ default: m.TermsPage })),
)
const PrivacyPage = lazy(() =>
  import('@/pages/PrivacyPage').then((m) => ({ default: m.PrivacyPage })),
)

function PageFallback() {
  return (
    <div className="max-w-[1400px] mx-auto px-8 py-24 relative z-10">
      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-faint">
        로딩 중...
      </p>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Header />
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/clusters" element={<ClustersPage />} />
          <Route path="/clusters/:id" element={<ClusterDetailPage />} />
          <Route path="/schools" element={<SchoolsPage />} />
          <Route path="/schools/:code" element={<SchoolDetailPage />} />
          <Route path="/cases" element={<CasesPage />} />
          <Route path="/cases/:id" element={<CaseDetailPage />} />
          <Route path="/report" element={<ReportPage />} />
          <Route path="/methodology" element={<MethodologyPage />} />
          <Route path="/api" element={<ApiPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
        </Routes>
      </Suspense>
      <Footer />
    </BrowserRouter>
  )
}

export default App
