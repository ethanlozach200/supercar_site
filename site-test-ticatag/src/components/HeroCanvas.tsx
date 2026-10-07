import { useEffect, useRef } from 'react'

interface Node { x: number; y: number; vx: number; vy: number; gw: boolean; phase: number; period: number }
interface Packet { a: number; b: number; t: number; speed: number }

/** Interconnected BLE nodes emitting signal waves, with data packets hopping toward gateways. */
export default function HeroCanvas() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current!
    const ctx = canvas.getContext('2d')!
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let w = 0, h = 0, dpr = 1, raf = 0, visible = true
    let nodes: Node[] = []
    const packets: Packet[] = []
    const mouse = { x: -999, y: -999 }

    const init = () => {
      const r = canvas.getBoundingClientRect()
      w = r.width; h = r.height
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = w * dpr; canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const count = Math.round(Math.min(70, Math.max(26, (w * h) / 22000)))
      nodes = Array.from({ length: count }, (_, i) => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.18, vy: (Math.random() - 0.5) * 0.18,
        gw: i % 11 === 0, phase: Math.random() * 6, period: 3 + Math.random() * 3,
      }))
    }

    const draw = (time: number) => {
      raf = requestAnimationFrame(draw)
      if (!visible || document.hidden) return
      const t = time / 1000
      ctx.clearRect(0, 0, w, h)
      const maxD = Math.min(190, Math.max(120, w / 7))

      for (const n of nodes) {
        if (!reduce) { n.x += n.vx; n.y += n.vy }
        if (n.x < -20) n.x = w + 20; if (n.x > w + 20) n.x = -20
        if (n.y < -20) n.y = h + 20; if (n.y > h + 20) n.y = -20
        const dx = n.x - mouse.x, dy = n.y - mouse.y, dd = dx * dx + dy * dy
        if (dd < 14000) { n.x += dx * 0.002; n.y += dy * 0.002 }
      }

      // links
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j]
          const d = Math.hypot(a.x - b.x, a.y - b.y)
          if (d < maxD) {
            ctx.strokeStyle = `rgba(0,150,255,${(1 - d / maxD) * 0.28})`
            ctx.lineWidth = 1
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke()
          }
        }
      }

      // waves + nodes
      for (const n of nodes) {
        const p = ((t + n.phase) % n.period) / n.period
        const rad = p * (n.gw ? 130 : 70)
        ctx.strokeStyle = `rgba(0,210,255,${(1 - p) * (n.gw ? 0.5 : 0.28)})`
        ctx.lineWidth = n.gw ? 1.6 : 1
        ctx.beginPath(); ctx.arc(n.x, n.y, rad, 0, Math.PI * 2); ctx.stroke()
        ctx.fillStyle = n.gw ? '#00D2FF' : 'rgba(120,180,255,.9)'
        ctx.shadowColor = '#00D2FF'; ctx.shadowBlur = n.gw ? 16 : 6
        ctx.beginPath(); ctx.arc(n.x, n.y, n.gw ? 3.6 : 2, 0, Math.PI * 2); ctx.fill()
        ctx.shadowBlur = 0
      }

      // packets
      if (!reduce && packets.length < 14 && Math.random() < 0.06) {
        const a = Math.floor(Math.random() * nodes.length)
        let best = -1, bd = maxD
        nodes.forEach((n, k) => { if (k !== a) { const d = Math.hypot(n.x - nodes[a].x, n.y - nodes[a].y); if (d < bd) { bd = d; best = k } } })
        if (best >= 0) packets.push({ a, b: best, t: 0, speed: 0.012 + Math.random() * 0.012 })
      }
      for (let i = packets.length - 1; i >= 0; i--) {
        const p = packets[i]; p.t += p.speed
        if (p.t >= 1) { packets.splice(i, 1); continue }
        const A = nodes[p.a], B = nodes[p.b]
        const x = A.x + (B.x - A.x) * p.t, y = A.y + (B.y - A.y) * p.t
        ctx.fillStyle = '#10B981'; ctx.shadowColor = '#10B981'; ctx.shadowBlur = 10
        ctx.beginPath(); ctx.arc(x, y, 2.2, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0
      }
    }

    init()
    raf = requestAnimationFrame(draw)
    const ro = new ResizeObserver(init); ro.observe(canvas)
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting }); io.observe(canvas)
    const move = (e: PointerEvent) => { const r = canvas.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top }
    window.addEventListener('pointermove', move, { passive: true })
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); window.removeEventListener('pointermove', move) }
  }, [])

  return <canvas ref={ref} className="absolute inset-0 h-full w-full" aria-hidden />
}
