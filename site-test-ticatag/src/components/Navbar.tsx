import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Languages, Menu, Radio, X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useI18n } from '../i18n'

export default function Navbar() {
  const { d, lang, toggle } = useI18n()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  const links = [
    { to: '/', label: d.nav.home },
    { to: '/products', label: d.nav.products },
    { to: '/solutions', label: d.nav.solutions },
    { to: '/platform', label: d.nav.platform },
  ]

  const cls = ({ isActive }: { isActive: boolean }) =>
    `relative px-3 py-2 text-sm font-medium transition-colors ${isActive ? 'text-white' : 'text-white/60 hover:text-white'}`

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled || open ? 'bg-ink/90 backdrop-blur-xl border-b border-white/10' : 'bg-transparent'}`}>
      <div className="wrap flex h-[68px] items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)} aria-label="Ticatag">
          <span className="relative grid h-8 w-8 place-items-center rounded-lg bg-brand">
            <Radio size={16} className="text-white" />
            <span className="absolute inset-0 rounded-lg bg-beacon/40 animate-ping2" />
          </span>
          <span className="font-display text-xl font-extrabold tracking-tight text-white">ticatag</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Principal">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.to === '/'} className={cls}>
              {({ isActive }) => (
                <>
                  {l.label}
                  {isActive && <motion.span layoutId="nav-dot" className="absolute inset-x-3 -bottom-0.5 h-px bg-beacon" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button onClick={toggle} className="flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-xs font-semibold text-white/80 transition hover:border-white/40 hover:text-white" aria-label={d.theme.lang}>
            <Languages size={14} /> {lang.toUpperCase()}
          </button>
          <Link to="/#roi" className="btn-primary hidden !py-2 sm:inline-flex">{d.nav.demo}</Link>
          <button className="grid h-9 w-9 place-items-center rounded-full text-white md:hidden" onClick={() => setOpen(!open)} aria-label={d.nav.menu} aria-expanded={open}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden md:hidden">
            <div className="wrap flex flex-col gap-1 pb-5">
              {links.map((l) => (
                <NavLink key={l.to} to={l.to} end={l.to === '/'} onClick={() => setOpen(false)} className="rounded-lg px-3 py-3 font-display text-lg font-semibold text-white/80 hover:bg-white/5 hover:text-white">
                  {l.label}
                </NavLink>
              ))}
              <Link to="/#roi" onClick={() => setOpen(false)} className="btn-primary mt-2">{d.nav.demo}</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
