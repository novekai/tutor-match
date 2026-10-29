import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MotionConfig } from 'framer-motion'
import { useEffect } from 'react'
import { BrowserRouter, Link, Route, Routes, useLocation } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { buttonClass } from './components/ui/buttonClass'
import { ConfirmationPage } from './pages/ConfirmationPage'
import { ResultsPage } from './pages/ResultsPage'
import { SearchPage } from './pages/SearchPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (count, err) => {
        const status = (err as { status?: number }).status ?? 0
        return count < 2 && (status === 0 || status >= 500)
      },
      refetchOnWindowFocus: false,
    },
  },
})

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [pathname])
  return null
}

function TitleOnHome() {
  const { pathname } = useLocation()
  useEffect(() => {
    if (pathname === '/') document.title = 'Trouvez le tuteur idéal – Studena'
  }, [pathname])
  return null
}

function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <p className="text-caption font-semibold tracking-wide text-primary-600 uppercase">Erreur 404</p>
      <h1 className="mt-2 text-h1 text-neutral-900">Page introuvable</h1>
      <p className="mt-2 text-body text-neutral-500">Cette page n'existe pas ou a été déplacée.</p>
      <Link to="/" className={buttonClass('primary', 'md', 'mt-6')}>
        Trouver un tuteur
      </Link>
    </div>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MotionConfig reducedMotion="user">
        <BrowserRouter>
          <ScrollToTop />
          <TitleOnHome />
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<SearchPage />} />
              <Route path="tuteurs" element={<ResultsPage />} />
              <Route path="reservation/:reference" element={<ConfirmationPage />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </MotionConfig>
    </QueryClientProvider>
  )
}
