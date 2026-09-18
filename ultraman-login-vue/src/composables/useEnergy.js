import { ref } from 'vue'

/**
 * 全局能量强度（0 ~ 1），用于驱动背景能量场的活跃程度。
 * 登录页在蓄力/发射时会把它拉满，形成"能量注入"的联动效果。
 */
const intensity = ref(0.35)

export function useEnergy() {
  function setIntensity(value) {
    intensity.value = Math.min(1, Math.max(0, value))
  }

  /** 平滑过渡到目标能量值 */
  function rampTo(target, duration = 600) {
    const start = intensity.value
    const startAt = performance.now()

    return new Promise((resolve) => {
      function step(now) {
        const t = Math.min(1, (now - startAt) / duration)
        // easeOutCubic
        const eased = 1 - Math.pow(1 - t, 3)
        intensity.value = start + (target - start) * eased
        if (t < 1) {
          requestAnimationFrame(step)
        } else {
          resolve()
        }
      }
      requestAnimationFrame(step)
    })
  }

  return { intensity, setIntensity, rampTo }
}
