import { useEffect, useRef, type ReactNode } from 'react'
import { animate, motion, useInView } from 'framer-motion'

export function Reveal({ children, delay = 0, className = '', y = 28 }: { children: ReactNode; delay?: number; className?: string; y?: number }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

/** Animated number with French/English grouping, tweened on value change. */
export function AnimatedNumber({ value, suffix = '', decimals = 0, locale = 'fr-FR' }: { value: number; suffix?: string; decimals?: number; locale?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const prev = useRef(0)
  const inView = useInView(ref, { once: true })
  const fmt = new Intl.NumberFormat(locale, { maximumFractionDigits: decimals, minimumFractionDigits: decimals })

  useEffect(() => {
    if (!inView || !ref.current) return
    const node = ref.current
    const c = animate(prev.current, value, {
      duration: 0.6,
      ease: 'easeOut',
      onUpdate: (v) => { node.textContent = fmt.format(v) + suffix },
    })
    prev.current = value
    return () => c.stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, inView, locale])

  return <span ref={ref}>{fmt.format(0)}{suffix}</span>
}

export function PageHeader({ eyebrow, title, sub }: { eyebrow: string; title: string; sub: string }) {
  return (
    <section className="relative overflow-hidden bg-ink pb-16 pt-36 text-white">
      <div className="grid-bg absolute inset-0" />
      <div className="pointer-events-none absolute -top-32 right-0 h-96 w-96 rounded-full bg-brand/30 blur-[120px]" />
      <div className="wrap relative">
        <Reveal><span className="eyebrow">{eyebrow}</span></Reveal>
        <Reveal delay={0.08}><h1 className="mt-4 max-w-3xl font-display text-4xl font-extrabold leading-[1.05] sm:text-6xl">{title}</h1></Reveal>
        <Reveal delay={0.16}><p className="mt-5 max-w-2xl text-lg text-white/65">{sub}</p></Reveal>
      </div>
    </section>
  )
}
