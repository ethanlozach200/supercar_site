import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Check, Radio, ShieldCheck } from 'lucide-react'
import { useI18n } from '../i18n'

export default function Footer() {
  const { d } = useI18n()
  const f = d.footer
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'ok' | 'err'>('idle')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (/^\S+@\S+\.\S+$/.test(email)) { setState('ok'); setEmail('') } else setState('err')
  }

  return (
    <footer className="relative overflow-hidden bg-ink text-white">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[60rem] -translate-x-1/2 rounded-full bg-brand/20 blur-[120px]" />
      <div className="wrap relative grid gap-12 py-16 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1.6fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand"><Radio size={16} /></span>
            <span className="font-display text-xl font-extrabold">ticatag</span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/60">{f.tagline}</p>
        </div>

        {(['product', 'company', 'resources'] as const).map((k) => (
          <div key={k}>
            <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-white/40">{f.cols[k]}</h4>
            <ul className="mt-4 space-y-2.5">
              {f.links[k].map((l) => (
                <li key={l}>
                  <Link to={k === 'product' ? '/products' : '/'} className="text-sm text-white/70 transition hover:text-beacon">{l}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <h4 className="font-display text-lg font-bold">{f.newsletterTitle}</h4>
          <p className="mt-1 text-sm text-white/55">{f.newsletterSub}</p>
          <form onSubmit={submit} className="group mt-4 flex items-center gap-1 rounded-full border border-white/15 bg-white/5 p-1 pl-4 transition focus-within:border-beacon focus-within:shadow-[0_0_0_4px_rgba(0,210,255,0.15),0_0_32px_rgba(0,210,255,0.35)]" noValidate>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setState('idle') }}
              placeholder={f.placeholder}
              aria-label="Email"
              className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/35"
            />
            <button className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-500 transition hover:bg-brand" aria-label={f.subscribe}>
              {state === 'ok' ? <Check size={16} /> : <ArrowRight size={16} />}
            </button>
          </form>
          <p role="status" className={`mt-2 min-h-5 text-xs ${state === 'ok' ? 'text-ok' : 'text-warn'}`}>
            {state === 'ok' ? f.thanks : state === 'err' ? f.invalid : ''}
          </p>
        </div>
      </div>

      <div className="wrap relative border-t border-white/10 py-6">
        <div className="flex flex-wrap items-center gap-2">
          {f.badges.map((b) => (
            <span key={b} className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-white/70">
              <ShieldCheck size={12} className="text-ok" /> {b}
            </span>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-white/30">{f.badgesNote}</p>
        <div className="mt-5 flex flex-col justify-between gap-2 text-xs text-white/40 sm:flex-row">
          <span>© {new Date().getFullYear()} Ticatag — {f.rights}</span>
          <span className="flex gap-4"><a href="#" className="hover:text-white">{f.legal}</a><a href="#" className="hover:text-white">{f.privacy}</a></span>
        </div>
      </div>
    </footer>
  )
}
