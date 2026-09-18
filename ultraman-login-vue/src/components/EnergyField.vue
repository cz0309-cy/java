<script setup>
/**
 * 能量场背景：canvas 粒子 + 星尘 + 连线
 * - 自适应 DPR，窗口缩放自动重绘
 * - 支持通过 props 注入 "能量强度"，蓄力/发射时粒子加速
 */
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'

const props = defineProps({
  /** 0 ~ 1，能量强度，越高粒子越活跃 */
  intensity: { type: Number, default: 0.35 },
  /** 粒子数量系数 */
  density: { type: Number, default: 1 }
})

const canvasRef = ref(null)

let ctx = null
let rafId = 0
let particles = []
let stars = []
let width = 0
let height = 0
let dpr = 1
let energy = props.intensity
let time = 0

const PALETTE = [
  '47, 224, 255',
  '47, 124, 255',
  '138, 92, 255',
  '255, 212, 71',
  '255, 255, 255'
]

function rand(min, max) {
  return Math.random() * (max - min) + min
}

function createParticle() {
  const color = PALETTE[Math.floor(Math.random() * PALETTE.length)]
  const depth = rand(0.25, 1) // 景深：越大越快越亮
  return {
    x: rand(0, width),
    y: rand(0, height),
    vx: rand(-0.35, 0.35),
    vy: rand(-0.55, -0.12) * depth,
    r: rand(0.6, 2.4) * depth + 0.4,
    color,
    depth,
    alpha: rand(0.25, 0.85),
    phase: rand(0, Math.PI * 2)
  }
}

function createStar() {
  return {
    x: rand(0, width),
    y: rand(0, height),
    r: rand(0.3, 1.1),
    alpha: rand(0.15, 0.6),
    twinkle: rand(0.4, 1.6)
  }
}

function resize() {
  const canvas = canvasRef.value
  if (!canvas) return

  dpr = Math.min(window.devicePixelRatio || 1, 2)
  width = canvas.clientWidth
  height = canvas.clientHeight
  canvas.width = Math.floor(width * dpr)
  canvas.height = Math.floor(height * dpr)

  ctx = canvas.getContext('2d')
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

  const count = Math.round(
    Math.min(160, Math.max(50, (width * height) / 14000)) * props.density
  )
  particles = Array.from({ length: count }, createParticle)
  stars = Array.from({ length: Math.round(count * 0.9) }, createStar)
}

function draw() {
  if (!ctx) return
  time += 1

  ctx.clearRect(0, 0, width, height)

  // ---- 星尘 ----
  for (const s of stars) {
    const tw = 0.55 + 0.45 * Math.sin(time * 0.02 * s.twinkle + s.x)
    ctx.beginPath()
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(200, 225, 255, ${(s.alpha * tw).toFixed(3)})`
    ctx.fill()
  }

  // ---- 粒子 ----
  const boost = 1 + energy * 3.6
  for (const p of particles) {
    p.x += p.vx * boost * p.depth
    p.y += p.vy * boost * p.depth
    p.phase += 0.04

    // 环绕出界重置
    if (p.y < -20) {
      p.y = height + 10
      p.x = rand(0, width)
    }
    if (p.x < -20) p.x = width + 10
    if (p.x > width + 20) p.x = -10

    const glow = 0.6 + 0.4 * Math.sin(p.phase)
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(${p.color}, ${(p.alpha * glow).toFixed(3)})`
    ctx.shadowBlur = 12 * p.depth * (1 + energy)
    ctx.shadowColor = `rgba(${p.color}, 0.9)`
    ctx.fill()
  }
  ctx.shadowBlur = 0

  // ---- 能量提升时连线 ----
  if (energy > 0.55) {
    const linkAlpha = (energy - 0.55) * 0.5
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i]
        const b = particles[j]
        const dx = a.x - b.x
        const dy = a.y - b.y
        const dist = dx * dx + dy * dy
        if (dist < 9000) {
          const o = (1 - dist / 9000) * linkAlpha
          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(b.x, b.y)
          ctx.strokeStyle = `rgba(120, 220, 255, ${o.toFixed(3)})`
          ctx.lineWidth = 0.6
          ctx.stroke()
        }
      }
    }
  }

  rafId = requestAnimationFrame(draw)
}

watch(
  () => props.intensity,
  (val) => {
    energy = val
  }
)

onMounted(() => {
  resize()
  window.addEventListener('resize', resize)
  rafId = requestAnimationFrame(draw)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(rafId)
  window.removeEventListener('resize', resize)
})
</script>

<template>
  <canvas ref="canvasRef" class="energy-field" aria-hidden="true" />
</template>

<style scoped>
.energy-field {
  position: absolute;
  inset: 0;
  z-index: 0;
  width: 100%;
  height: 100%;
  display: block;
  pointer-events: none;
}
</style>
