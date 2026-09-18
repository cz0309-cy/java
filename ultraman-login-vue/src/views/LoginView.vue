<script setup>
/**
 * LoginView —— 光之战士登录页
 *
 * 状态机：
 *   idle → charging（蓄力 1.1s）→ 校验
 *        ├─ 成功 → firing（发射光束转场）→ success → 跳转 /home
 *        └─ 失败 → error（抖动 + 提示）→ 2.6s 后回到 idle
 */
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'

import UltramanHero from '@/components/UltramanHero.vue'
import BeamOverlay from '@/components/BeamOverlay.vue'
import BaseInput from '@/components/BaseInput.vue'
import { useAuth, DEMO_ACCOUNTS } from '@/composables/useAuth'
import { useEnergy } from '@/composables/useEnergy'

const router = useRouter()
const { login } = useAuth()
const { setIntensity, rampTo } = useEnergy()

const username = ref('')
const password = ref('')
const remember = ref(true)

const phase = ref('idle')
const beamActive = ref(false)
const busy = ref(false)
const message = ref('')
const showPasswordHint = ref(false)

const errors = ref({ username: '', password: '' })

const heroScale = ref(1)
const timers = []

function later(fn, ms) {
  timers.push(setTimeout(fn, ms))
}

const buttonText = computed(() => {
  if (phase.value === 'charging') return '能量注入中…'
  if (phase.value === 'firing') return '发射！'
  if (phase.value === 'success') return '已变身'
  return '变 身 登 录'
})

/** 能量计量条百分比（纯装饰，随状态变化） */
const energyPercent = computed(() => {
  switch (phase.value) {
    case 'charging':
      return 92
    case 'firing':
    case 'success':
      return 100
    case 'error':
      return 22
    default:
      return 68
  }
})

const heroHint = computed(() => {
  switch (phase.value) {
    case 'charging':
      return '检测到身份信号，正在注入光之能量…'
    case 'firing':
      return '光之射线发射！'
    case 'success':
      return '变身成功，欢迎回来，战士。'
    case 'error':
      return '能量不匹配，认证被拒绝。'
    default:
      return '我是光，也是你的守护者。'
  }
})

function validate() {
  errors.value = { username: '', password: '' }
  let ok = true

  if (!username.value.trim()) {
    errors.value.username = '请输入光之代号'
    ok = false
  } else if (username.value.trim().length < 3) {
    errors.value.username = '代号至少 3 个字符'
    ok = false
  }

  if (!password.value) {
    errors.value.password = '请输入能量密钥'
    ok = false
  } else if (password.value.length < 6) {
    errors.value.password = '密钥至少 6 位'
    ok = false
  }

  return ok
}

function clearError() {
  message.value = ''
  if (phase.value === 'error') phase.value = 'idle'
}

async function handleSubmit() {
  if (busy.value) return

  if (!validate()) {
    message.value = '请先补全认证信息'
    shakePanel()
    return
  }

  busy.value = true
  message.value = ''
  phase.value = 'charging'
  setIntensity(0.9)

  // 蓄力动画
  await new Promise((r) => later(r, 1150))

  const result = await login(username.value, password.value)

  if (result.ok) {
    // ---- 发射转场 ----
    phase.value = 'firing'
    beamActive.value = true
    setIntensity(1)

    later(() => {
      phase.value = 'success'
    }, 520)

    later(async () => {
      beamActive.value = false
      await rampTo(0.45, 500)
      busy.value = false
      router.push({ name: 'home' })
    }, 1250)
  } else {
    // ---- 认证失败 ----
    phase.value = 'error'
    message.value = result.message || '身份认证失败'
    setIntensity(0.18)
    busy.value = false

    later(() => {
      phase.value = 'idle'
      rampTo(0.35, 700)
    }, 2600)
  }
}

function shakePanel() {
  const el = document.querySelector('.login__panel')
  if (!el) return
  el.classList.remove('is-shake')
  // 强制重排以便重复触发动画
  void el.offsetWidth
  el.classList.add('is-shake')
}

function fillDemo(account) {
  username.value = account.username
  password.value = account.password
  errors.value = { username: '', password: '' }
  clearError()
}

function resetForm() {
  username.value = ''
  password.value = ''
  errors.value = { username: '', password: '' }
  phase.value = 'idle'
  message.value = ''
}

onMounted(() => {
  // 出场：从远处飞入
  heroScale.value = 0.86
  later(() => {
    heroScale.value = 1
  }, 80)

  later(() => {
    showPasswordHint.value = true
  }, 900)
})

onBeforeUnmount(() => {
  timers.forEach(clearTimeout)
  timers.length = 0
  setIntensity(0.35)
})
</script>

<template>
  <section class="login">
    <!-- ==================== 左侧：英雄 ==================== -->
    <div class="login__stage">
      <div class="stage__badge">
        <span class="dot" />
        <span>LIGHT FORCE · 光之国认证系统</span>
      </div>

      <div class="stage__hero">
        <UltramanHero :phase="phase" :scale="heroScale" />
      </div>

      <div class="stage__caption">
        <h1 class="stage__title">
          <span class="title__cn">光 之 战 士</span>
          <span class="title__en">ULTRA SIGN-IN</span>
        </h1>
        <p class="stage__hint" :class="{ 'is-alert': phase === 'error' }">
          {{ heroHint }}
        </p>
        <div class="stage__meter">
          <span class="meter__label">ENERGY</span>
          <span class="meter__bar"><i :style="{ width: `${energyPercent}%` }" /></span>
        </div>
      </div>
    </div>

    <!-- ==================== 右侧：登录面板 ==================== -->
    <div class="login__panel glass">
      <div class="panel__corner panel__corner--tl" />
      <div class="panel__corner panel__corner--br" />

      <header class="panel__head">
        <p class="panel__eyebrow">SECURE ACCESS</p>
        <h2 class="panel__title">身份认证</h2>
        <p class="panel__sub">请输入你的光之代号与能量密钥</p>
      </header>

      <form class="panel__form" novalidate @submit.prevent="handleSubmit">
        <BaseInput
          v-model="username"
          label="光之代号"
          placeholder="如 admin"
          autocomplete="username"
          :error="errors.username"
          :disabled="busy"
          @enter="handleSubmit"
        >
          <template #icon>
            <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round">
              <circle cx="12" cy="8" r="3.6" />
              <path d="M4.5 20c0-3.6 3.4-6 7.5-6s7.5 2.4 7.5 6" />
            </svg>
          </template>
        </BaseInput>

        <BaseInput
          v-model="password"
          label="能量密钥"
          type="password"
          placeholder="如 ultraman"
          autocomplete="current-password"
          :error="errors.password"
          :disabled="busy"
          @enter="handleSubmit"
        >
          <template #icon>
            <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round">
              <rect x="4" y="10.5" width="16" height="10" rx="3" />
              <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
              <circle cx="12" cy="15.5" r="1.4" fill="currentColor" stroke="none" />
            </svg>
          </template>
        </BaseInput>

        <div class="panel__options">
          <label class="checkbox">
            <input v-model="remember" type="checkbox" />
            <span class="checkbox__box" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#04121f" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4.5 12.5l5 5 10-11" />
              </svg>
            </span>
            <span class="checkbox__text">记住我</span>
          </label>
          <button type="button" class="link" @click="message = '请联系光之国管理员重置密钥'">
            忘记密钥?
          </button>
        </div>

        <Transition name="hint">
          <p v-if="message" class="panel__message" :class="{ 'is-error': phase === 'error' }">
            {{ message }}
          </p>
        </Transition>

        <button
          type="submit"
          class="submit"
          :class="{
            'submit--busy': busy,
            'submit--ready': !busy,
            'submit--error': phase === 'error'
          }"
          :disabled="busy"
        >
          <span class="submit__glow" />
          <span class="submit__beam" />
          <span class="submit__text">{{ buttonText }}</span>
          <span class="submit__spinner" v-if="busy">
            <i /><i /><i />
          </span>
        </button>
      </form>

      <!-- 演示账号 -->
      <footer class="panel__footer">
        <p class="footer__label">演示账号（点击自动填充）</p>
        <div class="footer__chips">
          <button
            v-for="acc in DEMO_ACCOUNTS"
            :key="acc.username"
            type="button"
            class="chip"
            :disabled="busy"
            @click="fillDemo(acc)"
          >
            <span class="chip__name">{{ acc.name }}</span>
            <span class="chip__cred">{{ acc.username }} / {{ acc.password }}</span>
          </button>
        </div>
        <button type="button" class="footer__reset" :disabled="busy" @click="resetForm">
          清空重置
        </button>
      </footer>

      <Transition name="hint">
        <p v-if="showPasswordHint" class="panel__tip">
          提示：登录触发的是「能量注入 → 光之射线发射」完整动画
        </p>
      </Transition>
    </div>

    <!-- ==================== 全屏光束转场 ==================== -->
    <BeamOverlay :active="beamActive" />

    <!-- 发射时的屏幕抖动 -->
    <div class="screen-shake" :class="{ 'is-firing': phase === 'firing' }" />
  </section>
</template>

<style scoped>
.login {
  position: relative;
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  align-items: center;
  gap: clamp(24px, 5vw, 72px);
  padding: clamp(24px, 4vw, 64px) clamp(24px, 6vw, 110px);
}

/* ==================== 左侧舞台 ==================== */
.login__stage {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 0;
}

.stage__badge {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  padding: 7px 15px;
  border-radius: 999px;
  border: 1px solid rgba(47, 224, 255, 0.28);
  background: rgba(10, 24, 48, 0.55);
  backdrop-filter: blur(10px);
  font-size: 11.5px;
  letter-spacing: 0.22em;
  color: #9fd8ee;
  white-space: nowrap;
}

.stage__badge .dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--energy-cyan);
  box-shadow: 0 0 12px var(--energy-cyan);
  animation: blink 1.8s ease-in-out infinite;
}

@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.25;
  }
}

.stage__hero {
  width: min(46vh, 340px);
  height: min(62vh, 500px);
  display: grid;
  place-items: center;
  transition: transform 0.9s var(--ease-spring);
}

.stage__caption {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.stage__title {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.title__cn {
  font-size: clamp(20px, 2.2vw, 30px);
  font-weight: 800;
  letter-spacing: 0.3em;
  background: linear-gradient(100deg, #ffffff 8%, #7fe6ff 42%, #a48bff 78%, #ffffff 100%);
  background-size: 220% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: title-flow 6s linear infinite;
}

@keyframes title-flow {
  0% {
    background-position: 0% 0;
  }
  100% {
    background-position: 220% 0;
  }
}

.title__en {
  font-size: 11px;
  letter-spacing: 0.42em;
  color: var(--text-muted);
}

.stage__hint {
  font-size: 13.5px;
  color: var(--text-secondary);
  letter-spacing: 0.06em;
  min-height: 20px;
  transition: color 0.3s;
}

.stage__hint.is-alert {
  color: #ff8b98;
}

.stage__meter {
  display: flex;
  align-items: center;
  gap: 10px;
  width: min(320px, 74%);
}

.meter__label {
  font-family: var(--font-num);
  font-size: 10px;
  letter-spacing: 0.24em;
  color: var(--text-muted);
}

.meter__bar {
  position: relative;
  flex: 1;
  height: 4px;
  border-radius: 999px;
  background: rgba(120, 190, 255, 0.14);
  overflow: hidden;
}

.meter__bar i {
  position: absolute;
  inset: 0 auto 0 0;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--energy-blue), var(--energy-cyan));
  box-shadow: 0 0 12px rgba(47, 224, 255, 0.8);
  transition: width 0.6s var(--ease-out-soft);
}

/* ==================== 右侧面板 ==================== */
.login__panel {
  position: relative;
  width: 100%;
  max-width: 460px;
  justify-self: end;
  padding: clamp(26px, 3vw, 40px);
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  gap: 22px;
  animation: panel-in 0.85s var(--ease-out-soft) both;
}

@keyframes panel-in {
  0% {
    opacity: 0;
    transform: translateY(26px) scale(0.98);
  }
  100% {
    opacity: 1;
    transform: none;
  }
}

.login__panel.is-shake {
  animation: panel-shake 0.45s cubic-bezier(0.36, 0.07, 0.19, 0.97);
}

@keyframes panel-shake {
  0%,
  100% {
    transform: translateX(0);
  }
  12% {
    transform: translateX(-12px);
  }
  28% {
    transform: translateX(10px);
  }
  44% {
    transform: translateX(-7px);
  }
  62% {
    transform: translateX(5px);
  }
  80% {
    transform: translateX(-3px);
  }
}

/* 面板科技角标 */
.panel__corner {
  position: absolute;
  width: 26px;
  height: 26px;
  border: 2px solid rgba(47, 224, 255, 0.55);
  pointer-events: none;
}
.panel__corner--tl {
  top: 12px;
  left: 12px;
  border-right: none;
  border-bottom: none;
  border-radius: 8px 0 0 0;
}
.panel__corner--br {
  right: 12px;
  bottom: 12px;
  border-left: none;
  border-top: none;
  border-radius: 0 0 8px 0;
}

.panel__head {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.panel__eyebrow {
  font-family: var(--font-num);
  font-size: 10.5px;
  letter-spacing: 0.34em;
  color: var(--energy-cyan);
  opacity: 0.9;
}

.panel__title {
  font-size: 25px;
  font-weight: 700;
  letter-spacing: 0.1em;
}

.panel__sub {
  font-size: 13px;
  color: var(--text-secondary);
}

.panel__form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.panel__options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: -4px;
}

.checkbox {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  cursor: pointer;
  user-select: none;
}

.checkbox input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.checkbox__box {
  display: grid;
  place-items: center;
  width: 17px;
  height: 17px;
  border-radius: 5px;
  border: 1.5px solid rgba(120, 190, 255, 0.4);
  background: rgba(6, 12, 26, 0.7);
  transition: all 0.2s var(--ease-out-soft);
}

.checkbox__box svg {
  opacity: 0;
  transform: scale(0.6);
  transition: all 0.2s var(--ease-spring);
}

.checkbox input:checked + .checkbox__box {
  background: linear-gradient(135deg, var(--energy-cyan), var(--energy-blue));
  border-color: transparent;
  box-shadow: 0 0 14px rgba(47, 224, 255, 0.6);
}

.checkbox input:checked + .checkbox__box svg {
  opacity: 1;
  transform: scale(1);
}

.checkbox__text {
  font-size: 13px;
  color: var(--text-secondary);
}

.link {
  border: none;
  background: none;
  padding: 0;
  font-size: 13px;
  color: var(--text-secondary);
  transition: color 0.2s;
}

.link:hover {
  color: var(--energy-cyan);
}

.panel__message {
  margin-top: -6px;
  padding: 10px 13px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  color: #9fe0ff;
  background: rgba(47, 224, 255, 0.09);
  border-left: 3px solid var(--energy-cyan);
}

.panel__message.is-error {
  color: #ffa3ad;
  background: rgba(255, 59, 78, 0.1);
  border-left-color: var(--energy-red);
}

/* ---------- 提交按钮 ---------- */
.submit {
  position: relative;
  height: 54px;
  margin-top: 4px;
  border: none;
  border-radius: var(--radius-md);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.22em;
  color: #04121f;
  background: linear-gradient(120deg, #7fe9ff 0%, #2fe0ff 34%, #3d8bff 68%, #8a5cff 100%);
  background-size: 200% 100%;
  box-shadow: 0 10px 30px rgba(47, 160, 255, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
  transition: transform 0.18s var(--ease-out-soft), box-shadow 0.3s,
    filter 0.3s;
}

.submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 16px 40px rgba(47, 200, 255, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
  animation: btn-flow 1.6s linear infinite;
}

@keyframes btn-flow {
  0% {
    background-position: 0% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.submit:active:not(:disabled) {
  transform: translateY(0) scale(0.985);
}

.submit:disabled {
  cursor: not-allowed;
}

.submit--error {
  background: linear-gradient(120deg, #ff8b98, #ff3b4e 60%, #b3121f);
  color: #fff;
  box-shadow: 0 10px 30px rgba(255, 59, 78, 0.4);
}

.submit__text {
  position: relative;
  z-index: 2;
}

/* 按钮上扫过的高光 */
.submit__glow {
  position: absolute;
  top: 0;
  left: -60%;
  width: 45%;
  height: 100%;
  background: linear-gradient(
    100deg,
    transparent,
    rgba(255, 255, 255, 0.75),
    transparent
  );
  transform: skewX(-18deg);
  z-index: 1;
}

.submit--ready:hover:not(:disabled) .submit__glow {
  animation: btn-sheen 1.1s ease-out infinite;
}

.submit--busy .submit__glow {
  left: 0;
  width: 100%;
  opacity: 0.25;
  animation: btn-sheen-fast 0.9s linear infinite;
}

@keyframes btn-sheen {
  0% {
    left: -60%;
  }
  60%,
  100% {
    left: 130%;
  }
}

@keyframes btn-sheen-fast {
  0% {
    transform: translateX(-100%) skewX(-18deg);
  }
  100% {
    transform: translateX(220%) skewX(-18deg);
  }
}

/* 蓄力光束（按钮内部） */
.submit__beam {
  position: absolute;
  inset: 0;
  opacity: 0;
  background: radial-gradient(
    circle at 50% 50%,
    rgba(255, 255, 255, 0.95),
    rgba(120, 230, 255, 0.4) 45%,
    transparent 75%
  );
  transition: opacity 0.3s;
}

.submit--busy .submit__beam {
  opacity: 1;
  animation: beam-pulse 0.55s ease-in-out infinite;
}

@keyframes beam-pulse {
  0%,
  100% {
    opacity: 0.4;
  }
  50% {
    opacity: 0.95;
  }
}

/* loading 点 */
.submit__spinner {
  position: relative;
  z-index: 2;
  display: inline-flex;
  gap: 4px;
}

.submit__spinner i {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #04121f;
  animation: dot-bounce 0.9s ease-in-out infinite;
}

.submit__spinner i:nth-child(2) {
  animation-delay: 0.14s;
}
.submit__spinner i:nth-child(3) {
  animation-delay: 0.28s;
}

@keyframes dot-bounce {
  0%,
  100% {
    transform: translateY(0);
    opacity: 0.5;
  }
  50% {
    transform: translateY(-4px);
    opacity: 1;
  }
}

/* ==================== 底部 ==================== */
.panel__footer {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-top: 18px;
  border-top: 1px dashed rgba(120, 190, 255, 0.18);
}

.footer__label {
  font-size: 11.5px;
  letter-spacing: 0.12em;
  color: var(--text-muted);
}

.footer__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 9px;
}

.chip {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  padding: 8px 13px;
  border-radius: var(--radius-sm);
  border: 1px solid rgba(120, 190, 255, 0.22);
  background: rgba(10, 22, 44, 0.6);
  color: var(--text-secondary);
  transition: all 0.22s var(--ease-out-soft);
}

.chip:hover:not(:disabled) {
  border-color: rgba(47, 224, 255, 0.7);
  background: rgba(47, 224, 255, 0.1);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 20, 50, 0.5);
}

.chip__name {
  font-size: 12.5px;
  color: var(--text-primary);
  letter-spacing: 0.06em;
}

.chip__cred {
  font-family: var(--font-num);
  font-size: 11px;
  letter-spacing: 0.04em;
}

.footer__reset {
  align-self: flex-start;
  border: none;
  background: none;
  padding: 0;
  font-size: 12.5px;
  color: var(--text-muted);
  text-decoration: underline;
  text-underline-offset: 3px;
  transition: color 0.2s;
}

.footer__reset:hover:not(:disabled) {
  color: var(--energy-cyan);
}

.panel__tip {
  margin-top: -8px;
  font-size: 11.5px;
  line-height: 1.6;
  color: var(--text-muted);
  text-align: center;
}

/* ==================== 屏幕抖动 ==================== */
.screen-shake {
  position: fixed;
  inset: 0;
  z-index: 80;
  pointer-events: none;
}

.screen-shake.is-firing {
  animation: screen-quake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97);
}

@keyframes screen-quake {
  0%,
  100% {
    backdrop-filter: none;
    transform: translate(0, 0);
  }
  20% {
    transform: translate(-5px, 3px);
  }
  40% {
    transform: translate(4px, -3px);
  }
  60% {
    transform: translate(-3px, 2px);
  }
  80% {
    transform: translate(2px, -1px);
  }
}

/* ==================== 过渡 ==================== */
.hint-enter-active,
.hint-leave-active {
  transition: opacity 0.28s, transform 0.28s;
}
.hint-enter-from,
.hint-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

/* ==================== 响应式 ==================== */
@media (max-width: 1080px) {
  .login {
    grid-template-columns: 1fr 1fr;
    padding: 32px 40px;
  }
  .stage__hero {
    width: min(38vh, 260px);
    height: min(50vh, 380px);
  }
}

@media (max-width: 860px) {
  .login {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
    align-content: start;
    gap: 18px;
    padding: 26px 20px 34px;
    overflow-y: auto;
  }
  .login__stage {
    gap: 4px;
  }
  .stage__hero {
    width: 190px;
    height: 250px;
  }
  .stage__badge {
    font-size: 10px;
    letter-spacing: 0.14em;
    padding: 6px 12px;
  }
  .stage__meter {
    display: none;
  }
  .login__panel {
    justify-self: stretch;
    max-width: none;
  }
}

@media (max-width: 480px) {
  .stage__hero {
    width: 140px;
    height: 190px;
  }
  .title__cn {
    font-size: 18px;
  }
  .panel__title {
    font-size: 21px;
  }
  .login__panel {
    padding: 22px 18px;
  }
}
</style>
