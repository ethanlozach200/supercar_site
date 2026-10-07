import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useI18n } from '../i18n'
import { Reveal } from './ui'

export default function CtaBand() {
  const { d } = useI18n()
  const c = d.cta
  return (
    <section className="relative overflow-hidden bg-ink py-24 text-white">
      <div className="grid-bg absolute inset-0" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-[50rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/30 blur-[120px]" />
      <div className="wrap relative text-center">
        <Reveal><h2 className="h2 mx-auto max-w-3xl">{c.title}</h2></Reveal>
        <Reveal delay={0.08}><p className="mx-auto mt-4 max-w-xl text-white/60">{c.sub}</p></Reveal>
        <Reveal delay={0.16}>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a href="mailto:contact@example.com?subject=Demande%20de%20d%C3%A9mo%20Ticatag" className="btn-primary">{c.button} <ArrowRight size={16} /></a>
            <Link to="/platform" className="btn-ghost">{c.secondary}</Link>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
