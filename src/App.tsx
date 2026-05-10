// 앱 루트 — BrowserRouter + 10개 라우트 + Header/Footer 공통 레이아웃
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { DashboardPage } from '@/pages/DashboardPage'
import { ClustersPage } from '@/pages/ClustersPage'
import { ClusterDetailPage } from '@/pages/ClusterDetailPage'
import { SchoolsPage } from '@/pages/SchoolsPage'
import { SchoolDetailPage } from '@/pages/SchoolDetailPage'
import { CasesPage } from '@/pages/CasesPage'
import { CaseDetailPage } from '@/pages/CaseDetailPage'
import { ReportPage } from '@/pages/ReportPage'
import { MethodologyPage } from '@/pages/MethodologyPage'
import { ApiPage } from '@/pages/ApiPage'

function App() {
  return (
    <BrowserRouter>
      <Header />
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
      </Routes>
      <Footer />
    </BrowserRouter>
  )
}

export default App
