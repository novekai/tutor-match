import { BadgeCheck, CircleQuestionMark, Shield, User } from 'lucide-react'
import { Link, Outlet } from 'react-router-dom'
import logo from '../../assets/logo-studena.webp'

const YEAR = new Date().getFullYear()

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200/70 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 sm:h-[72px] sm:px-8">
        <Link to="/" className="rounded-sm" aria-label="Studena — accueil">
          <img src={logo} alt="Studena" width={110} height={34} className="h-8 w-auto sm:h-[34px]" />
        </Link>
        <div className="flex items-center gap-3 sm:gap-6">
          <a
            href="mailto:contact@studena.com"
            className="flex items-center gap-1.5 rounded-sm text-small font-medium text-neutral-700 transition-colors hover:text-primary-600"
          >
            <CircleQuestionMark className="size-[18px]" aria-hidden="true" />
            <span className="hidden sm:inline">Besoin d'aide ?</span>
            <span className="sm:hidden">Aide</span>
          </a>
          <button
            type="button"
            className="flex size-10 items-center justify-center rounded-full bg-primary-500 text-white shadow-sm transition-colors hover:bg-primary-600"
            aria-label="Mon compte"
          >
            <User className="size-[18px]" aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  )
}

export function Footer() {
  return (
    <footer className="mt-auto border-t border-neutral-200/70 bg-white">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-3 px-4 py-6 text-caption font-medium text-neutral-700 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p>© {YEAR} Studena. Accompagnement pédagogique et réussite scolaire.</p>
        <ul className="flex items-center gap-4">
          <li className="flex items-center gap-1.5">
            <BadgeCheck className="size-4 text-primary-500" aria-hidden="true" /> Enseignants certifiés
          </li>
          <li className="flex items-center gap-1.5">
            <Shield className="size-4 text-primary-500" aria-hidden="true" /> Sans engagement
          </li>
        </ul>
      </div>
    </footer>
  )
}

export function Layout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#contenu"
        className="sr-only z-50 rounded-md bg-primary-500 px-4 py-2 text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Aller au contenu
      </a>
      <Header />
      <main id="contenu" className="flex flex-1 flex-col">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
