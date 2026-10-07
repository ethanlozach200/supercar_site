import { useState } from 'react'
import * as Slider from '@radix-ui/react-slider'
import { Link } from 'react-router-dom'
import { ArrowRight, Clock, PiggyBank, TrendingUp } from 'lucide-react'
import { AnimatedNumber, Reveal } from './ui'
import { useI18n } from '../i18n'

const HOURLY = 35
const TAG_COST = 28 // € / asset hardware (illustrative)
const SUB_COST = 24 // € / asset / year platform (illustrative)

function Field({ id, label, value, unit, min, max, step, onChange, display }: { id: string; label: string; value: number; unit: string; min: number; max: number; step: number; onChange: (v: number) => void; display: string }) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <label id={id} className="text-sm font-medium text-ink/70">{label}</label>
        <span className="font-display text-lg font-extrabold tabular-nums text-ink">{display} <span className="text-xs font-medium text-ink/45">{unit}</span></span>
      </div>
      <Slider.Root
        className="relative mt-3 flex h-6 touch-none select-none items-center"
        value={[value]} min={min} max={max} step={step}
        onValueChange={([v]) => onChange(v)}
        aria-labelledby={id}
      >
        <Slider.Track className="relative h-1.5 grow rounded-full bg-slate-200">
          <Slider.Range className="absolute h-full rounded-full bg-gradient-to-r from-brand-500 to-beacon" />
        </Slider.Track>
        <Slider.Thumb className="block h-5 w-5 rounded-full border-2 border-brand-500 bg-white shadow-[0_2px_10px_rgba(0,82,255,.45)] outline-none transition hover:scale-110 focus-visible:ring-4 focus-visible:ring-brand/30" />
      </Slider.Root>
    </div>
  )
}

export default function RoiCalculator() {
  const { d, lang } = useI18n()
  const r = d.roi
  const locale = lang === 'fr' ? 'fr-FR' : 'en-GB'
  const [fleet, setFleet] = useState(300)
  const [lost, setLost] = useState(40)
  const [cost, setCost] = useState(1500)
  const [hours, setHours] = useState(6)

  const avoided = Math.round(lost * cost * 0.8)
  const timeHours = Math.round(hours * 52 * 0.7)
  const timeValue = timeHours * HOURLY
  const savings = avoided + timeValue
  const invest = fleet * (TAG_COST + SUB_COST)
  const months = savings > 0 ? (invest / savings) * 12 : Infinity
  const money = (n: number) => new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)
  const share = savings > 0 ? Math.round((avoided / savings) * 100) : 0

  return (
    <section id="roi" className="relative overflow-hidden bg-slate-50 py-28">
      <div className="wrap">
        <div className="max-w-2xl">
          <Reveal><span className="eyebrow !text-brand-500">{r.eyebrow}</span></Reveal>
          <Reveal delay={0.08}><h2 className="h2 mt-4">{r.title}</h2></Reveal>
          <Reveal delay={0.16}><p className="mt-4 text-ink/60">{r.sub}</p></Reveal>
        </div>

        <Reveal delay={0.1} className="mt-12">
          <div className="grid gap-6 lg:grid-cols-[1.05fr_1fr]">
            <div className="space-y-7 rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
              <Field id="f-fleet" label={r.fleet} value={fleet} unit={r.fleetUnit} min={20} max={2000} step={10} onChange={setFleet} display={new Intl.NumberFormat(locale).format(fleet)} />
              <Field id="f-lost" label={r.lost} value={lost} unit="" min={0} max={500} step={1} onChange={setLost} display={String(lost)} />
              <Field id="f-cost" label={r.cost} value={cost} unit="" min={50} max={20000} step={50} onChange={setCost} display={money(cost)} />
              <Field id="f-hours" label={r.hours} value={hours} unit={r.hoursUnit} min={0} max={40} step={1} onChange={setHours} display={String(hours)} />
              <p className="text-xs leading-relaxed text-ink/45">{r.note}</p>
            </div>

            <div className="relative overflow-hidden rounded-3xl bg-ink p-7 text-white shadow-[0_30px_80px_-30px_rgba(0,82,255,.55)] sm:p-9">
              <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand/40 blur-[90px]" />
              <div className="relative">
                <div className="flex items-center gap-2 text-sm text-white/60"><PiggyBank size={16} className="text-beacon" /> {r.savings}</div>
                <div className="mt-2 font-display text-5xl font-extrabold tabular-nums sm:text-6xl" aria-live="polite">
                  <AnimatedNumber value={savings} suffix=" €" locale={locale} />
                  <span className="ml-2 text-base font-medium text-white/40">{r.perYear}</span>
                </div>

                <div className="mt-5 flex h-2 overflow-hidden rounded-full bg-white/10" aria-hidden>
                  <div className="bg-brand-500 transition-all duration-500" style={{ width: `${share}%` }} />
                  <div className="bg-beacon transition-all duration-500" style={{ width: `${100 - share}%` }} />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <div><span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-brand-500" />{r.avoided}<div className="font-semibold tabular-nums">{money(avoided)}</div></div>
                  <div><span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-beacon" />{r.time}<div className="font-semibold tabular-nums">{new Intl.NumberFormat(locale).format(timeHours)} {r.hoursYear}</div></div>
                </div>

                <div className="mt-7 grid gap-3 sm:grid-cols-2">
                  <div className="glass rounded-2xl p-4">
                    <div className="flex items-center gap-2 text-xs text-white/55"><TrendingUp size={14} className="text-ok" /> {r.payback}</div>
                    <div className="mt-1 font-display text-3xl font-extrabold text-ok tabular-nums">
                      {!isFinite(months) ? '—' : months < 1 ? r.immediate : <><AnimatedNumber value={months} decimals={1} locale={locale} /> <span className="text-base font-medium">{r.months}</span></>}
                    </div>
                  </div>
                  <div className="glass rounded-2xl p-4">
                    <div className="flex items-center gap-2 text-xs text-white/55"><Clock size={14} className="text-warn" /> {r.invest}</div>
                    <div className="mt-1 font-display text-3xl font-extrabold tabular-nums"><AnimatedNumber value={invest} suffix=" €" locale={locale} /></div>
                  </div>
                </div>

                <Link to="/platform" className="btn-primary mt-7 w-full">{r.cta} <ArrowRight size={16} /></Link>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
