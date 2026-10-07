import { useI18n } from '../i18n'
import { Reveal } from './ui'

export default function SocialProof() {
  const { d } = useI18n()
  const s = d.social
  const row = [...s.refs, ...s.refs]
  return (
    <section className="overflow-hidden border-y border-slate-200 bg-white py-16">
      <div className="wrap text-center">
        <Reveal><h2 className="font-display text-2xl font-extrabold sm:text-3xl">{s.title}</h2></Reveal>
        <Reveal delay={0.08}><p className="mt-2 text-sm text-ink/55">{s.sub}</p></Reveal>
      </div>
      <div className="relative mt-10 [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
        <div className="flex w-max animate-marquee gap-4 hover:[animation-play-state:paused]">
          {row.map((r, i) => (
            <span key={i} aria-hidden={i >= s.refs.length} className="whitespace-nowrap rounded-2xl border border-slate-200 bg-slate-50 px-7 py-4 font-display text-lg font-extrabold tracking-tight text-ink/55 transition hover:border-brand/30 hover:text-brand">
              {r}
            </span>
          ))}
        </div>
      </div>
      <p className="wrap mt-6 text-center text-[11px] text-ink/35">{s.note}</p>
    </section>
  )
}
