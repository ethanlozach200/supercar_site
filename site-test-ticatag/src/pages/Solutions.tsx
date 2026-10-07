import { useEffect, useState } from 'react'
import * as Tabs from '@radix-ui/react-tabs'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, ArrowRight, CheckCircle2, Cpu, RotateCcw, Sparkles } from 'lucide-react'
import { PageHeader, Reveal } from '../components/ui'
import CtaBand from '../components/CtaBand'
import { useI18n } from '../i18n'

const STEP_ICONS = [AlertTriangle, Cpu, CheckCircle2]
const STEP_COLORS = ['#F59E0B', '#00D2FF', '#10B981']

export default function Solutions() {
  const { d } = useI18n()
  const s = d.solutions
  const [tab, setTab] = useState('0')
  const [step, setStep] = useState(0)

  useEffect(() => { setStep(0) }, [tab])

  const idx = Number(tab)
  const persona = s.personas[idx]
  const labels = [s.problem, s.solution, s.result]

  return (
    <>
      <PageHeader eyebrow={s.eyebrow} title={s.title} sub={s.sub} />

      <section className="bg-slate-50 py-20">
        <div className="wrap">
          <Tabs.Root value={tab} onValueChange={setTab}>
            <Tabs.List className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-2 sm:mx-0 sm:flex-wrap sm:px-0" aria-label={s.title}>
              {s.personas.map((p, i) => (
                <Tabs.Trigger
                  key={p.tab}
                  value={String(i)}
                  className="shrink-0 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-ink/65 outline-none transition hover:border-brand/40 hover:text-ink focus-visible:ring-2 focus-visible:ring-brand data-[state=active]:border-brand-500 data-[state=active]:bg-brand-500 data-[state=active]:text-white data-[state=active]:shadow-[0_8px_30px_-6px_rgba(0,82,255,.55)]"
                >
                  {p.tab}
                </Tabs.Trigger>
              ))}
            </Tabs.List>

            {s.personas.map((p, i) => (
              <Tabs.Content key={p.tab} value={String(i)} className="outline-none" />
            ))}
          </Tabs.Root>

          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.35 }} className="mt-10 grid gap-8 lg:grid-cols-[1fr_1.25fr]">
              <div>
                <span className="text-xs font-semibold uppercase tracking-widest text-brand-500">{persona.role}</span>
                <h2 className="h2 mt-3">{persona.headline}</h2>
                <ul className="mt-7 space-y-3">
                  {persona.problems.map((x) => (
                    <li key={x} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-ink/75">
                      <AlertTriangle size={16} className="mt-0.5 shrink-0 text-warn" /> {x}
                    </li>
                  ))}
                </ul>
                <div className="mt-8 grid grid-cols-3 gap-3">
                  {persona.kpis.map((k) => (
                    <div key={k.l} className="rounded-2xl bg-ink p-4 text-white">
                      <div className="font-display text-xl font-extrabold text-beacon sm:text-2xl">{k.v}</div>
                      <div className="mt-1 text-[11px] leading-snug text-white/55 sm:text-xs">{k.l}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* problem → solution → result flow */}
              <div className="relative overflow-hidden rounded-3xl bg-ink p-6 text-white shadow-[0_30px_80px_-30px_rgba(0,82,255,.5)] sm:p-9">
                <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full blur-[90px] transition-colors duration-500" style={{ background: `${STEP_COLORS[step]}44` }} />
                <ol className="relative flex items-center">
                  {labels.map((l, n) => {
                    const Icon = STEP_ICONS[n]
                    const done = n <= step
                    return (
                      <li key={l} className="flex flex-1 items-center last:flex-none">
                        <button
                          onClick={() => setStep(n)}
                          aria-current={n === step ? 'step' : undefined}
                          className="group flex flex-col items-center gap-2 outline-none"
                        >
                          <span
                            className="grid h-12 w-12 place-items-center rounded-2xl border transition-all duration-300 group-focus-visible:ring-2 group-focus-visible:ring-white"
                            style={{ borderColor: done ? STEP_COLORS[n] : 'rgba(255,255,255,.15)', background: done ? `${STEP_COLORS[n]}22` : 'transparent', color: done ? STEP_COLORS[n] : 'rgba(255,255,255,.4)', boxShadow: n === step ? `0 0 28px ${STEP_COLORS[n]}77` : 'none' }}
                          >
                            <Icon size={20} />
                          </span>
                          <span className={`text-xs font-semibold ${done ? 'text-white' : 'text-white/40'}`}>{l}</span>
                        </button>
                        {n < 2 && (
                          <span className="relative mx-2 mb-6 h-px flex-1 bg-white/15">
                            <motion.span className="absolute inset-y-0 left-0 bg-gradient-to-r from-beacon to-ok" initial={false} animate={{ width: step > n ? '100%' : '0%' }} transition={{ duration: 0.5 }} />
                          </span>
                        )}
                      </li>
                    )
                  })}
                </ol>

                <div className="relative mt-8 min-h-[190px]" aria-live="polite">
                  <AnimatePresence mode="wait">
                    <motion.div key={`${tab}-${step}`} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.3 }}>
                      <h3 className="font-display text-2xl font-extrabold">{persona.steps[step].t}</h3>
                      <p className="mt-3 leading-relaxed text-white/65">{persona.steps[step].d}</p>
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="relative mt-4 flex gap-3">
                  {step < 2 ? (
                    <button onClick={() => setStep(step + 1)} className="btn-primary">{s.next} <ArrowRight size={16} /></button>
                  ) : (
                    <button onClick={() => setStep(0)} className="btn-ghost"><RotateCcw size={15} /> {s.restart}</button>
                  )}
                  {step === 2 && <span className="inline-flex items-center gap-1.5 text-sm text-ok"><Sparkles size={15} /> {persona.kpis[0].v} · {persona.kpis[0].l}</span>}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      <Reveal><CtaBand /></Reveal>
    </>
  )
}
