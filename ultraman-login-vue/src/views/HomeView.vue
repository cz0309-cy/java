<script setup>
/**
 * HomeView —— 变身成功后的作战指挥舱
 */
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'

import UltramanHero from '@/components/UltramanHero.vue'
import { useAuth } from '@/composables/useAuth'
import { useEnergy } from '@/composables/useEnergy'

const router = useRouter()
const { user, logout } = useAuth()
const { rampTo, setIntensity } = useEnergy()

const phase = ref('success')
const timers = []

function later(fn, ms) {
  timers.push(setTimeout(fn, ms))
}

const stats = computed(() => [
  { label: '变身次数', value: 128, unit: '次' },
  { label: '战斗胜率', value: 96.4, unit: '%' },
  { label: '能量储备', value: 87, unit: '%' },
  { label: '守护时长', value: 3260, unit: 'h' }
])

const tasks = [
  { name: '巡逻 M78 星云', status: '进行中', tone: 'run' },
  { name: '修复能量护盾矩阵', status: '待处理', tone: 'wait' },
  { name: '与地球防卫队同步情报', status: '已完成', tone: 'done' }
]

function signOut() {
  phase.value = 'idle'
  setIntensity(0.3)
  later(() => {
    logout()
    router.push({ name: 'login' })
  }, 420)
}

onMounted(() => {
  setIntensity(0.55)
  rampTo(0.62, 900)
  later(() => {
    phase.value = 'idle'
  }, 1800)
})

onBeforeUnmount(() => {
  timers.forEach(clearTimeout)
  timers.length = 0
  setIntensity(0.35)
})
</script>

<template>
  <section class="home">
    <header class="home__bar glass">
      <div class="bar__brand">
        <span class="bar__logo" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 3l2.2 5.4L20 9.6l-4.4 3.6L17 19l-5-3.1L7 19l1.4-5.8L4 9.6l5.8-1.2z" />
          </svg>
        </span>
        <span class="bar__name">光之国 · 作战指挥舱</span>
      </div>

      <div class="bar__right">
        <span class="bar__user">
          <i class="bar__dot" />
          {{ user?.name || '战士' }} · {{ user?.role || '成员' }}
        </span>
        <button class="bar__logout" type="button" @click="signOut">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" />
            <path d="M10 17l-5-5 5-5" />
            <path d="M5 12h11" />
          </svg>
          解除变身
        </button>
      </div>
    </header>

    <div class="home__grid">
      <div class="home__hero glass">
        <UltramanHero :phase="phase" :scale="0.94" />
        <div class="hero__info">
          <p class="hero__eyebrow">STATUS · ONLINE</p>
          <h2 class="hero__welcome">欢迎回来，{{ user?.name || '战士' }}</h2>
          <p class="hero__desc">
            光之能量已同步，计时器状态稳定。随时准备执行下一次守护任务。
          </p>
          <div class="hero__tags">
            <span class="tag tag--cyan">M78 星云</span>
            <span class="tag tag--violet">能量充盈</span>
            <span class="tag tag--gold">S 级战备</span>
          </div>
        </div>
      </div>

      <div class="home__side">
        <div class="stats">
          <div v-for="s in stats" :key="s.label" class="stat glass">
            <p class="stat__label">{{ s.label }}</p>
            <p class="stat__value">
              {{ s.value }}<span class="stat__unit">{{ s.unit }}</span>
            </p>
          </div>
        </div>

        <div class="tasks glass">
          <header class="tasks__head">
            <h3>今日任务</h3>
            <span class="tasks__date">{{ new Date().toLocaleDateString('zh-CN') }}</span>
          </header>
          <ul class="tasks__list">
            <li v-for="t in tasks" :key="t.name" class="task">
              <span class="task__dot" :class="`task__dot--${t.tone}`" />
              <span class="task__name">{{ t.name }}</span>
              <span class="task__status" :class="`task__status--${t.tone}`">{{ t.status }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <footer class="home__footer">
      <p>Vue 3 + Vite · 光之战士主题登录系统 · 演示数据仅用于界面展示</p>
    </footer>
  </section>
</template>

<style scoped>
.home {
  position: relative;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  padding: clamp(18px, 2.6vw, 34px) clamp(20px, 4vw, 64px) 26px;
  display: flex;
  flex-direction: column;
  gap: clamp(16px, 2vw, 26px);
}

/* ---------- 顶栏 ---------- */
.home__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 13px 20px;
  border-radius: var(--radius-md);
  flex-wrap: wrap;
}

.bar__brand {
  display: flex;
  align-items: center;
  gap: 11px;
}

.bar__logo {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: 10px;
  color: #04121f;
  background: linear-gradient(135deg, var(--energy-cyan), var(--energy-blue));
  box-shadow: 0 0 20px rgba(47, 224, 255, 0.5);
}

.bar__name {
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.08em;
}

.bar__right {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.bar__user {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text-secondary);
}

.bar__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #34e39b;
  box-shadow: 0 0 12px #34e39b;
  animation: pulse-dot 1.8s ease-in-out infinite;
}

@keyframes pulse-dot {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.45;
    transform: scale(0.82);
  }
}

.bar__logout {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 8px 15px;
  border-radius: 999px;
  border: 1px solid rgba(255, 90, 110, 0.4);
  background: rgba(255, 59, 78, 0.1);
  color: #ffa3ad;
  font-size: 13px;
  transition: all 0.22s var(--ease-out-soft);
}

.bar__logout:hover {
  background: rgba(255, 59, 78, 0.2);
  border-color: rgba(255, 90, 110, 0.8);
  transform: translateY(-1px);
  box-shadow: 0 8px 22px rgba(255, 59, 78, 0.25);
}

/* ---------- 主网格 ---------- */
.home__grid {
  display: grid;
  grid-template-columns: 1.25fr 1fr;
  gap: clamp(16px, 2vw, 26px);
  align-items: stretch;
}

.home__hero {
  position: relative;
  display: grid;
  grid-template-columns: minmax(120px, 0.8fr) 1.2fr;
  align-items: center;
  gap: 14px;
  padding: clamp(20px, 2.4vw, 34px);
  border-radius: var(--radius-lg);
  min-height: 380px;
  overflow: hidden;
}

.home__hero::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(
    70% 60% at 26% 46%,
    rgba(47, 224, 255, 0.12) 0%,
    transparent 70%
  );
}

.hero__info {
  display: flex;
  flex-direction: column;
  gap: 11px;
  position: relative;
  z-index: 1;
}

.hero__eyebrow {
  font-family: var(--font-num);
  font-size: 10.5px;
  letter-spacing: 0.3em;
  color: var(--energy-cyan);
}

.hero__welcome {
  font-size: clamp(20px, 2.1vw, 28px);
  font-weight: 700;
  letter-spacing: 0.05em;
  background: linear-gradient(100deg, #ffffff, #8fe8ff 55%, #b9a5ff);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.hero__desc {
  font-size: 13.5px;
  line-height: 1.8;
  color: var(--text-secondary);
  max-width: 34ch;
}

.hero__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 4px;
}

.tag {
  padding: 6px 13px;
  border-radius: 999px;
  font-size: 12px;
  letter-spacing: 0.06em;
  border: 1px solid transparent;
}

.tag--cyan {
  color: #8fe8ff;
  border-color: rgba(47, 224, 255, 0.35);
  background: rgba(47, 224, 255, 0.1);
}
.tag--violet {
  color: #c3b0ff;
  border-color: rgba(138, 92, 255, 0.35);
  background: rgba(138, 92, 255, 0.1);
}
.tag--gold {
  color: #ffdf8a;
  border-color: rgba(255, 212, 71, 0.32);
  background: rgba(255, 212, 71, 0.1);
}

/* ---------- 右侧 ---------- */
.home__side {
  display: flex;
  flex-direction: column;
  gap: clamp(14px, 1.8vw, 22px);
}

.stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: clamp(12px, 1.4vw, 18px);
}

.stat {
  padding: 17px 19px;
  border-radius: var(--radius-md);
  transition: transform 0.25s var(--ease-out-soft), border-color 0.25s;
}

.stat:hover {
  transform: translateY(-3px);
  border-color: var(--panel-border-strong);
}

.stat__label {
  font-size: 12.5px;
  color: var(--text-secondary);
  letter-spacing: 0.08em;
}

.stat__value {
  margin-top: 7px;
  font-family: var(--font-num);
  font-size: 27px;
  font-weight: 700;
  line-height: 1;
  background: linear-gradient(120deg, #ffffff, #7fe0ff);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.stat__unit {
  margin-left: 4px;
  font-size: 12px;
  font-weight: 400;
  color: var(--text-muted);
  -webkit-text-fill-color: var(--text-muted);
}

/* ---------- 任务列表 ---------- */
.tasks {
  flex: 1;
  padding: 19px 21px;
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.tasks__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}

.tasks__head h3 {
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.1em;
}

.tasks__date {
  font-family: var(--font-num);
  font-size: 12px;
  color: var(--text-muted);
}

.tasks__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 11px;
}

.task {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 11px 13px;
  border-radius: var(--radius-sm);
  background: rgba(8, 16, 34, 0.5);
  border: 1px solid rgba(120, 190, 255, 0.12);
  transition: all 0.22s var(--ease-out-soft);
}

.task:hover {
  border-color: rgba(47, 224, 255, 0.4);
  background: rgba(47, 224, 255, 0.07);
  transform: translateX(3px);
}

.task__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex: none;
}
.task__dot--run {
  background: var(--energy-cyan);
  box-shadow: 0 0 12px var(--energy-cyan);
}
.task__dot--wait {
  background: var(--energy-gold);
  box-shadow: 0 0 12px var(--energy-gold);
}
.task__dot--done {
  background: #34e39b;
  box-shadow: 0 0 12px #34e39b;
}

.task__name {
  flex: 1;
  font-size: 13.5px;
  color: var(--text-primary);
}

.task__status {
  font-size: 12px;
  letter-spacing: 0.04em;
}
.task__status--run {
  color: var(--energy-cyan);
}
.task__status--wait {
  color: var(--energy-gold);
}
.task__status--done {
  color: #34e39b;
}

/* ---------- 页脚 ---------- */
.home__footer {
  margin-top: auto;
  text-align: center;
  font-size: 12px;
  color: var(--text-muted);
  letter-spacing: 0.06em;
}

/* ---------- 响应式 ---------- */
@media (max-width: 1080px) {
  .home__grid {
    grid-template-columns: 1fr;
  }
  .home__hero {
    grid-template-columns: minmax(110px, 0.55fr) 1fr;
  }
}

@media (max-width: 640px) {
  .home__hero {
    grid-template-columns: 1fr;
    justify-items: center;
    text-align: center;
    min-height: 0;
  }
  .hero__info {
    align-items: center;
  }
  .hero__tags {
    justify-content: center;
  }
  .bar__name {
    font-size: 13.5px;
  }
}
</style>
