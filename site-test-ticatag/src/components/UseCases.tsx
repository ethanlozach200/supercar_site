import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Check, Snowflake, Stethoscope, Timer, Truck } from 'lucide-react'
import { useI18n } from '../i18n'
import { Reveal } from './ui'

gsap.registerPlugin(ScrollTrigger)

const ICONS = [Stethoscope, Timer, Truck, Snowflake]
const COLORS = ['#00D2FF', '#8B5CF6', '#F59E0B', '#10B981']

/** Horizontal scroll panel pinned with GSAP ScrollTrigger (desktop); stacked cards on mobile. */
export default function UseCases() {
  const { d } = useI18n()
  const u = d.usecases
  const root = useRef<HTMLElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const bar = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const mm = gsap.matchMedia()
    mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
      const el = track.current!
      const dist = () => el.scrollWidth - window.innerWidth
      const tween = gsap.to(el, {
        x: () => -dist(),
        ease: 'none',
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: () => `+=${dist()}`,
          pin: true,
          scrub: 0.6,
          invalidateOnRefresh: true,
          onUpdate: (self) => { if (bar.current) bar.current.style.transform = `scaleX(${self.progress})` },
        },
      })
      gsap.utils.toArray<HTMLElement>('.uc-visual').forEach((v) => {
        gsap.fromTo(v, { yPercent: 12, scale: 0.92 }, {
          yPercent: -6, scale: 1, ease: 'none',
          scrollTrigger: { trigger: v.parentElement, containerAnimation: tween, start: 'left 90%', end: 'left 20%', scrub: true },
        })
      })
    })
    return () => mm.revert()
  }, [d])

  return (
    <section id="usecases" ref={root} className="relative bg-ink text-white lg:h-screen lg:overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 hidden h-1 bg-white/10 lg:block">
        <div ref={bar} className="h-full origin-left scale-x-0 bg-gradient-to-r from-brand-500 to-beacon" />
      </div>

      <div ref={track} className="flex flex-col gap-6 px-5 py-20 lg:h-full lg:w-max lg:flex-row lg:items-center lg:gap-10 lg:px-[8vw] lg:py-0">
        <div className="w-full shrink-0 lg:w-[34vw] lg:max-w-md">
          <Reveal><span className="eyebrow">{u.eyebrow}</span></Reveal>
          <Reveal delay={0.08}><h2 className="h2 mt-4">{u.title}</h2></Reveal>
          <p className="mt-6 hidden items-center gap-2 text-sm text-white/40 lg:flex">
            <span className="h-px w-10 bg-white/30" /> scroll
          </p>
        </div>

        {u.items.map((it, i) => {
          const Icon = ICONS[i]
          const c = COLORS[i]
          return (
            <article
              key={it.tag}
              className="relative flex w-full shrink-0 flex-col justify-between overflow-hidden rounded-[2rem] border border-white/10 bg-ink-800 p-7 sm:p-10 lg:h-[72vh] lg:max-h-[600px] lg:w-[64vw] lg:max-w-[880px] lg:flex-row lg:gap-10"
              style={{ boxShadow: `0 0 80px -30px ${c}` }}
            >
              <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full blur-[100px]" style={{ background: `${c}33` }} />
              <div className="relative flex flex-1 flex-col">
                <span className="inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold" style={{ color: c, borderColor: `${c}55`, background: `${c}14` }}>
                  <Icon size={14} /> {it.tag}
                </span>
                <h3 className="mt-5 font-display text-3xl font-extrabold leading-tight sm:text-4xl">{it.title}</h3>
                <p className="mt-4 text-white/60">{it.text}</p>
                <ul className="mt-6 space-y-2">
                  {it.bullets.map((b) => (
                    <li key={b} className="flex items-center gap-2.5 text-sm text-white/80">
                      <span className="grid h-5 w-5 place-items-center rounded-full" style={{ background: `${c}26`, color: c }}><Check size={12} /></span>{b}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 text-xs uppercase tracking-widest text-white/35 lg:mt-auto">{it.product}</div>
              </div>

              <div className="relative mt-8 flex items-center justify-center lg:mt-0 lg:w-[38%]">
                <div className="uc-visual relative grid aspect-square w-full max-w-[260px] place-items-center rounded-3xl border border-white/10 bg-ink/70 p-6 text-center">
                  <div className="absolute inset-0 rounded-3xl opacity-60" style={{ background: `radial-gradient(circle at 50% 30%, ${c}30, transparent 65%)` }} />
                  <div className="relative">
                    <div className="font-display text-6xl font-extrabold tabular-nums sm:text-7xl" style={{ color: c, textShadow: `0 0 40px ${c}77` }}>{it.stat.v}</div>
                    <div className="mt-2 text-sm text-white/60">{it.stat.l}</div>
                  </div>
                </div>
              </div>
              <span className="absolute bottom-5 right-7 font-display text-7xl font-extrabold text-white/[0.04]">0{i + 1}</span>
            </article>
          )
        })}
        <div className="hidden w-[6vw] shrink-0 lg:block" />
      </div>
    </section>
  )
}
