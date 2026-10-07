import { useEffect, useMemo, useRef, useState } from 'react'
import * as Switch from '@radix-ui/react-switch'
import { SECTOR_COLOR, type SectorId } from '../lib/data'
import { Reveal } from './ui'
import { useI18n } from '../i18n'

interface Beacon {
  id: number
  sector: SectorId
  a: number // angle
  r: number // 0..1 radius
  va: number
  vr: number
  battery: number
  lastPing: number
  label: string
}

const SECTORS = Object.keys(SECTOR_COLOR) as SectorId[]
const SWEEP_PERIOD = 5 // seconds per full turn

function makeBeacons(): Beacon[] {
  const out: Beacon[] = []
  let id = 0
  for (const s of SECTORS) {
    for (let i = 0; i < 9; i++) {
      out.push({
        id: id++, sector: s,
        a: Math.random() * Math.PI * 2, r: 0.12 + Math.random() * 0.82,
        va: (Math.random() - 0.5) * 0.05, vr: (Math.random() - 0.5) * 0.012,
        battery: Math.round(35 + Math.random() * 65), lastPing: -10,
        label: `${String.fromCharCode(65 + (id % 26))}${100 + Math.floor(Math.random() * 899)}`,
      })
    }
  }
  return out
}

export default function RadarDemo() {
  const { d } = useI18n()
  const rd = d.radar
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const beacons = useMemo(makeBeacons, [])
  const [active, setActive] = useState<Record<SectorId, boolean>>({ medical: true, logistics: true, btp: true, sport: true })
  const activeRef = useRef(active)
  activeRef.current = active
  const [hover, setHover] = useState<Beacon | null>(null)
  const hoverRef = useRef<Beacon | null>(null)
  const pointer = useRef<{ x: number; y: number } | null>(null)
  const dictRef = useRef(rd)
  dictRef.current = rd

  const total = SECTORS.reduce((n, s) => n + (active[s] ? beacons.filter((b) => b.sector === s).length : 0), 0)

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let size = 0, dpr = 1, raf = 0, visible = true
    let sweep = 0, last = performance.now(), clock = 0

    const resize = () => {
      const r = canvas.getBoundingClientRect()
      size = r.width
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = size * dpr; canvas.height = size * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    const ro = new ResizeObserver(resize); ro.observe(canvas)
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting }); io.observe(canvas)

    const pos = (b: Beacon) => {
      const R = size / 2 - 10
      return { x: size / 2 + Math.cos(b.a) * b.r * R, y: size / 2 + Math.sin(b.a) * b.r * R }
    }

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame)
      if (!visible || document.hidden) { last = now; return }
      const dt = Math.min((now - last) / 1000, 0.1); last = now
      clock += dt
      if (!reduce) sweep = (sweep + (dt / SWEEP_PERIOD) * Math.PI * 2) % (Math.PI * 2)
      const cx = size / 2, cy = size / 2, R = size / 2 - 10

      ctx.clearRect(0, 0, size, size)
      // background disc
      const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, R)
      bg.addColorStop(0, 'rgba(0,82,255,.16)'); bg.addColorStop(1, 'rgba(10,15,29,.9)')
      ctx.fillStyle = bg; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill()

      // grid
      ctx.strokeStyle = 'rgba(0,210,255,.18)'; ctx.lineWidth = 1
      for (let i = 1; i <= 4; i++) { ctx.beginPath(); ctx.arc(cx, cy, (R * i) / 4, 0, Math.PI * 2); ctx.stroke() }
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); ctx.stroke()
      }

      // sweep cone
      const g = ctx.createConicGradient ? ctx.createConicGradient(sweep - Math.PI * 0.55, cx, cy) : null
      if (g) {
        g.addColorStop(0, 'rgba(0,210,255,0)'); g.addColorStop(0.27, 'rgba(0,210,255,.33)'); g.addColorStop(0.275, 'rgba(0,210,255,0)'); g.addColorStop(1, 'rgba(0,210,255,0)')
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill()
      }
      ctx.strokeStyle = 'rgba(0,210,255,.9)'; ctx.lineWidth = 1.5
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(sweep) * R, cy + Math.sin(sweep) * R); ctx.stroke()

      // beacons
      let nearest: Beacon | null = null, nd = 18
      for (const b of beacons) {
        if (!activeRef.current[b.sector]) continue
        if (!reduce) {
          b.a += b.va * dt; b.r += b.vr * dt
          if (b.r > 0.95 || b.r < 0.1) b.vr *= -1
        }
        const diff = ((sweep - b.a) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2)
        if (diff < 0.12 || reduce) b.lastPing = clock
        const age = clock - b.lastPing
        const alpha = Math.max(0.28, 1 - age / SWEEP_PERIOD)
        const p = pos(b)
        const col = SECTOR_COLOR[b.sector]
        // ping ring
        if (age < 1.2) {
          ctx.strokeStyle = col; ctx.globalAlpha = 1 - age / 1.2
          ctx.beginPath(); ctx.arc(p.x, p.y, 4 + age * 18, 0, Math.PI * 2); ctx.stroke()
        }
        ctx.globalAlpha = alpha
        ctx.fillStyle = col; ctx.shadowColor = col; ctx.shadowBlur = 10
        ctx.beginPath(); ctx.arc(p.x, p.y, b === hoverRef.current ? 6 : 3.6, 0, Math.PI * 2); ctx.fill()
        ctx.shadowBlur = 0; ctx.globalAlpha = 1
        if (pointer.current) {
          const dd = Math.hypot(p.x - pointer.current.x, p.y - pointer.current.y)
          if (dd < nd) { nd = dd; nearest = b }
        }
      }
      if (nearest !== hoverRef.current) { hoverRef.current = nearest; setHover(nearest) }

      if (hoverRef.current) {
        const p = pos(hoverRef.current)
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.2
        ctx.beginPath(); ctx.arc(p.x, p.y, 11, 0, Math.PI * 2); ctx.stroke()
      }
    }
    raf = requestAnimationFrame(frame)
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect() }
  }, [beacons])

  const onMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    pointer.current = { x: e.clientX - r.left, y: e.clientY - r.top }
  }

  return (
    <section id="radar" className="relative overflow-hidden bg-ink-800 py-28 text-white">
      <div className="grid-bg absolute inset-0 opacity-60" />
      <div className="wrap relative grid items-center gap-14 lg:grid-cols-[1fr_1.05fr]">
        <div>
          <Reveal><span className="eyebrow"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-beacon" /> {rd.eyebrow}</span></Reveal>
          <Reveal delay={0.08}><h2 className="h2 mt-4">{rd.title}</h2></Reveal>
          <Reveal delay={0.16}><p className="mt-4 max-w-md text-white/60">{rd.sub}</p></Reveal>

          <Reveal delay={0.24}>
            <ul className="mt-8 space-y-2.5">
              {SECTORS.map((s) => (
                <li key={s} className="glass flex items-center justify-between rounded-2xl px-4 py-3 transition hover:bg-white/[0.07]">
                  <label htmlFor={`sw-${s}`} className="flex flex-1 cursor-pointer items-center gap-3 text-sm font-semibold">
                    <span className="h-3 w-3 rounded-full" style={{ background: SECTOR_COLOR[s], boxShadow: `0 0 12px ${SECTOR_COLOR[s]}` }} />
                    {rd.filters[s]}
                    <span className="text-xs font-normal text-white/40">{beacons.filter((b) => b.sector === s).length}</span>
                  </label>
                  <Switch.Root
                    id={`sw-${s}`}
                    checked={active[s]}
                    onCheckedChange={(v) => setActive((a) => ({ ...a, [s]: v }))}
                    className="relative h-6 w-11 shrink-0 rounded-full bg-white/15 outline-none transition data-[state=checked]:bg-brand-500 focus-visible:ring-2 focus-visible:ring-beacon"
                  >
                    <Switch.Thumb className="block h-5 w-5 translate-x-0.5 rounded-full bg-white shadow transition-transform data-[state=checked]:translate-x-[22px]" />
                  </Switch.Root>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.3}>
            <div className="mt-6 flex items-center gap-5 text-sm">
              <div>
                <div className="font-display text-4xl font-extrabold tabular-nums text-beacon">{total}</div>
                <div className="text-white/50">{rd.detected}</div>
              </div>
              <div className="h-10 w-px bg-white/10" />
              <div className="min-h-[3.25rem] flex-1 text-white/70" aria-live="polite">
                {total === 0 ? (
                  <span className="text-warn">{rd.empty}</span>
                ) : hover ? (
                  <div>
                    <div className="font-semibold text-white">{rd.assets[hover.sector]} · {hover.label}</div>
                    <div className="text-xs text-white/50">
                      {rd.zone} {rd.filters[hover.sector]} · {rd.battery}{' '}
                      <span className={hover.battery < 50 ? 'text-warn' : 'text-ok'}>{hover.battery}%</span>
                    </div>
                  </div>
                ) : (
                  <span className="text-white/40">{rd.hint}</span>
                )}
              </div>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.1} className="mx-auto w-full max-w-[560px]">
          <div className="relative aspect-square rounded-full shadow-[0_0_80px_-10px_rgba(0,102,255,0.6)]">
            <canvas
              ref={canvasRef}
              onPointerMove={onMove}
              onPointerLeave={() => { pointer.current = null }}
              className="h-full w-full cursor-crosshair rounded-full"
              aria-label={rd.sweep}
            />
          </div>
        </Reveal>
      </div>
    </section>
  )
}
