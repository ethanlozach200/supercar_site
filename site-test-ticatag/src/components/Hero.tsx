import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowDown, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import HeroCanvas from './HeroCanvas'
import { useI18n } from '../i18n'
import { scrollToId } from '../App'

export default function Hero() {
  const { d, lang } = useI18n()
  const h = d.hero
  const [count, setCount] = useState(1250000)

  // Live "ticker" — the counter climbs a little, as if assets were reporting in.
  useEffect(() => {
    const id = setInterval(() => setCount((c) => c + Math.floor(Math.random() * 7) + 1), 1400)
    return () => clearInterval(id)
  }, [])

  const fmt = String(count).replace(/\B(?=(\d{3})+(?!\d))/g, lang === 'fr' ? '\u00A0' : ',')

  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden bg-ink pb-24 pt-32 text-white">
      <HeroCanvas />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,transparent_20%,#0A0F1D_85%)]" />
      <div className="pointer-events-none absolute -bottom-40 left-1/2 h-96 w-[70rem] -translate-x-1/2 rounded-full bg-brand/25 blur-[140px]" />

      <div className="wrap relative">
        <motion.span initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="eyebrow">
          <span className="h-px w-8 bg-beacon" /> {h.eyebrow}
        </motion.span>

        <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }} className="mt-5 max-w-5xl font-display text-5xl font-extrabold leading-[1.02] sm:text-7xl lg:text-[5.5rem]">
          {h.title1}
          <br />
          <span className="bg-gradient-to-r from-brand-500 via-beacon to-white bg-clip-text text-transparent">{h.title2}</span>
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.25 }} className="mt-7 max-w-2xl text-lg leading-relaxed text-white/65 sm:text-xl">
          {h.sub}
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }} className="mt-9 flex flex-wrap gap-3">
          <button onClick={() => scrollToId('products')} className="btn-primary">
            {h.ctaProducts} <ArrowDown size={16} />
          </button>
          <Link to="/#roi" className="btn-ghost">
            {h.ctaDemo} <ArrowRight size={16} />
          </Link>
        </motion.div>

        <motion.ul initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="mt-8 flex flex-wrap gap-2">
          {h.chips.map((c) => (
            <li key={c} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/65">{c}</li>
          ))}
        </motion.ul>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: [0, -6, 0] }}
        transition={{ opacity: { delay: 0.9 }, y: { delay: 1, duration: 5, repeat: Infinity, ease: 'easeInOut' } }}
        className="glass absolute bottom-6 left-5 right-5 flex items-center gap-3 rounded-2xl px-4 py-3 shadow-[0_0_40px_rgba(0,102,255,0.25)] sm:left-auto sm:right-8 sm:w-auto sm:max-w-sm"
        role="status"
      >
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          <span className="absolute inset-0 rounded-full bg-ok animate-ping2" />
          <span className="relative h-2.5 w-2.5 rounded-full bg-ok" />
        </span>
        <span className="text-sm text-white/80">
          {lang === 'fr' ? 'Plus de ' : 'Over '}
          <strong className="font-display font-bold tabular-nums text-white">{fmt}</strong>
          {lang === 'fr' ? ' actifs géolocalisés en temps réel' : ' assets tracked in real time'}
        </span>
      </motion.div>
    </section>
  )
}
