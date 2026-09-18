<script setup>
/**
 * UltramanHero —— 纯 SVG + CSS 动画的光之战士
 *
 * 通过 phase 驱动 6 个状态：
 *   idle     待机：悬浮、眼灯呼吸、胸口计时器蓝光脉动
 *   charging 蓄力：双臂交叉成十字、计时器转红急闪、能量环扩散
 *   firing   发射：十字架姿态 + 全身强光
 *   success  成功：计时器转绿、光晕放亮
 *   error    失败：眼灯转暗红、躯干失去光泽、抖动
 *   dim      休眠：整体半透明降饱和
 */
import { computed } from 'vue'

const props = defineProps({
  phase: {
    type: String,
    default: 'idle',
    validator: (v) => ['idle', 'charging', 'firing', 'success', 'error', 'dim'].includes(v)
  },
  /** 整体缩放 */
  scale: { type: Number, default: 1 }
})

const isIdle = computed(() => props.phase === 'idle')
const isArmed = computed(() => ['charging', 'firing', 'success'].includes(props.phase))
</script>

<template>
  <div
    class="hero"
    :class="[`hero--${phase}`]"
    :style="{ '--hero-scale': scale }"
  >
    <svg
      class="hero__svg"
      viewBox="0 0 260 410"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="光之战士"
    >
      <defs>
        <!-- ========== 渐变 ========== -->
        <linearGradient id="uh-body" x1="0.15" y1="0" x2="0.85" y2="1">
          <stop offset="0%" stop-color="#ffffff" />
          <stop offset="34%" stop-color="#e2eaf5" />
          <stop offset="66%" stop-color="#a8b8cd" />
          <stop offset="100%" stop-color="#5f6f88" />
        </linearGradient>

        <linearGradient id="uh-head" x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stop-color="#ffffff" />
          <stop offset="45%" stop-color="#d6e0ee" />
          <stop offset="100%" stop-color="#7686a0" />
        </linearGradient>

        <linearGradient id="uh-arm" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#dfe8f4" />
          <stop offset="60%" stop-color="#9dadc4" />
          <stop offset="100%" stop-color="#62718a" />
        </linearGradient>

        <linearGradient id="uh-leg" x1="0" y1="0" x2="0.9" y2="1">
          <stop offset="0%" stop-color="#cdd9e8" />
          <stop offset="100%" stop-color="#5b6a82" />
        </linearGradient>

        <linearGradient id="uh-fin" x1="0" y1="0" x2="0.2" y2="1">
          <stop offset="0%" stop-color="#ff6b6b" />
          <stop offset="55%" stop-color="#e11d2e" />
          <stop offset="100%" stop-color="#8f0f1d" />
        </linearGradient>

        <linearGradient id="uh-red" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#ff5a6a" />
          <stop offset="100%" stop-color="#b3121f" />
        </linearGradient>

        <radialGradient id="uh-eye">
          <stop offset="0%" stop-color="#ffffff" />
          <stop offset="42%" stop-color="#fff6c2" />
          <stop offset="100%" stop-color="#ffd21f" />
        </radialGradient>

        <radialGradient id="uh-aura">
          <stop offset="0%" style="stop-color: var(--aura-inner, #63e6ff); stop-opacity: 0.55" />
          <stop offset="55%" style="stop-color: var(--aura-mid, #2f7cff); stop-opacity: 0.2" />
          <stop offset="100%" style="stop-color: var(--aura-mid, #2f7cff); stop-opacity: 0" />
        </radialGradient>

        <radialGradient id="uh-timer-idle">
          <stop offset="0%" stop-color="#ffffff" />
          <stop offset="45%" stop-color="#7ff0ff" />
          <stop offset="100%" stop-color="#12a8e0" />
        </radialGradient>

        <!-- ========== 滤镜 ========== -->
        <filter id="uh-glow" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="3.2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter id="uh-softglow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="9" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <!-- 身体高光 -->
        <linearGradient id="uh-sheen" x1="0" y1="0" x2="1" y2="0.4">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.55" />
          <stop offset="38%" stop-color="#ffffff" stop-opacity="0.05" />
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
        </linearGradient>
      </defs>

      <!-- ================= 背部光环 ================= -->
      <g class="hero__aura">
        <circle class="aura-ring aura-ring--1" cx="130" cy="200" r="108" fill="url(#uh-aura)" />
        <circle class="aura-ring aura-ring--2" cx="130" cy="200" r="80" fill="none" style="stroke: var(--aura-inner, #63e6ff)" stroke-width="1.1" stroke-dasharray="5 11" />
        <circle class="aura-ring aura-ring--3" cx="130" cy="200" r="126" fill="none" style="stroke: var(--aura-inner, #63e6ff)" stroke-width="0.8" stroke-dasharray="2 16" />
      </g>

      <!-- ================= 角色本体 ================= -->
      <g class="hero__body">
        <!-- ==== 腿 ==== -->
        <g class="hero__legs">
          <path d="M102 250 L 98 374 L 95 388 Q 95 396 106 396 L 129 396 L 129 370 L 128 250 Z" fill="url(#uh-leg)" />
          <path d="M158 250 L 162 374 L 165 388 Q 165 396 154 396 L 131 396 L 131 370 L 132 250 Z" fill="url(#uh-leg)" />
          <!-- 大腿红色装饰 -->
          <path d="M125 254 L 127 298 L 110 298 L 108 254 Z" fill="url(#uh-red)" opacity="0.9" />
          <path d="M135 254 L 133 298 L 150 298 L 152 254 Z" fill="url(#uh-red)" opacity="0.9" />
          <!-- 小腿高光 -->
          <ellipse cx="111" cy="336" rx="4.6" ry="9" fill="#ffffff" opacity="0.2" />
          <ellipse cx="149" cy="336" rx="4.6" ry="9" fill="#ffffff" opacity="0.2" />
        </g>

        <!-- ==== 髋部 ==== -->
        <path d="M100 236 L 160 236 L 158 262 L 102 262 Z" fill="#8b9bb2" />

        <!-- ==== 躯干 ==== -->
        <g class="hero__torso">
          <path
            d="M130 144
               C 109 144, 96 152, 90 167
               L 83 200 L 94 213
               L 102 262 L 158 262
               L 166 213 L 177 200
               L 170 167
               C 164 152, 151 144, 130 144 Z"
            fill="url(#uh-body)"
          />
          <!-- 躯干高光 -->
          <path
            d="M130 144 C 109 144, 96 152, 90 167 L 83 200 L 94 213 L 102 262 L 126 262 L 121 154 Z"
            fill="url(#uh-sheen)"
            opacity="0.5"
          />
          <!-- 胸甲分割线 -->
          <path d="M130 155 L 112 186 L 118 208" fill="none" stroke="#7c8ca4" stroke-width="1.6" stroke-linecap="round" opacity="0.75" />
          <path d="M130 155 L 148 186 L 142 208" fill="none" stroke="#7c8ca4" stroke-width="1.6" stroke-linecap="round" opacity="0.75" />
          <!-- 侧腰红条 -->
          <path d="M93 184 L 86 224 L 94 228 L 100 188 Z" fill="url(#uh-red)" opacity="0.85" />
          <path d="M167 184 L 174 224 L 166 228 L 160 188 Z" fill="url(#uh-red)" opacity="0.85" />
          <!-- 腰带 -->
          <rect x="102" y="234" width="56" height="10" rx="4" fill="#6f7f97" opacity="0.9" />
        </g>

        <!-- ==== 颈部 ==== -->
        <path d="M119 128 L 141 128 L 143 152 L 117 152 Z" fill="#93a3ba" />

        <!-- ==== 头部 ==== -->
        <g class="hero__head">
          <!-- 头冠 -->
          <path class="head__fin" d="M130 18 C 136 34, 141 50, 141 64 L 119 64 C 119 50, 124 34, 130 18 Z" fill="url(#uh-fin)" />
          <!-- 头型 -->
          <path
            d="M130 58
               C 110 58, 99 74, 99 96
               C 99 120, 112 136, 130 136
               C 148 136, 161 120, 161 96
               C 161 74, 150 58, 130 58 Z"
            fill="url(#uh-head)"
          />
          <!-- 面部中脊 -->
          <path d="M130 60 L 130 132" stroke="#8e9eb6" stroke-width="2" stroke-linecap="round" opacity="0.5" />
          <!-- 眼睛 -->
          <g class="head__eyes">
            <path class="eye eye--left" d="M103 92 C 110 81, 125 81, 130 94 C 125 107, 110 107, 103 96 Z" fill="url(#uh-eye)" filter="url(#uh-glow)" />
            <path class="eye eye--right" d="M157 92 C 150 81, 135 81, 130 94 C 135 107, 150 107, 157 96 Z" fill="url(#uh-eye)" filter="url(#uh-glow)" />
            <path class="eye eye--left" d="M103 92 C 110 81, 125 81, 130 94 C 125 107, 110 107, 103 96 Z" fill="url(#uh-eye)" />
            <path class="eye eye--right" d="M157 92 C 150 81, 135 81, 130 94 C 135 107, 150 107, 157 96 Z" fill="url(#uh-eye)" />
          </g>
          <!-- 嘴部 -->
          <path d="M122 116 Q 130 122 138 116" fill="none" stroke="#7b8ba3" stroke-width="1.8" stroke-linecap="round" />
          <!-- 下巴腮红 -->
          <ellipse cx="110" cy="110" rx="3.6" ry="2.2" fill="#ff7a7a" opacity="0.45" />
          <ellipse cx="150" cy="110" rx="3.6" ry="2.2" fill="#ff7a7a" opacity="0.45" />
        </g>

        <!-- ==== 手臂（可动） ==== -->
        <g class="hero__arms">
          <!-- 英雄右臂（画面左侧） -->
          <g class="arm arm--right">
            <path d="M100 152 C 87 159, 80 171, 75 192 L 69 240 Q 68 247 75 248 L 84 249 Q 90 249 91 243 L 97 195 L 108 162 Z" fill="url(#uh-arm)" />
            <path d="M75 201 L 70 237 Q 69 243 75 244 L 83 245 Q 88 245 89 240 L 92 205 Z" fill="url(#uh-red)" opacity="0.85" />
            <circle cx="79" cy="254" r="9" fill="#c3cfdf" />
            <circle cx="76.5" cy="251.5" r="3" fill="#ffffff" opacity="0.55" />
          </g>
          <!-- 英雄左臂（画面右侧） -->
          <g class="arm arm--left">
            <path d="M160 152 C 173 159, 180 171, 185 192 L 191 240 Q 192 247 185 248 L 176 249 Q 170 249 169 243 L 163 195 L 152 162 Z" fill="url(#uh-arm)" />
            <path d="M185 201 L 190 237 Q 191 243 185 244 L 177 245 Q 172 245 171 240 L 168 205 Z" fill="url(#uh-red)" opacity="0.85" />
            <circle cx="181" cy="254" r="9" fill="#c3cfdf" />
            <circle cx="178.5" cy="251.5" r="3" fill="#ffffff" opacity="0.55" />
          </g>
        </g>

        <!-- ==== 胸口计时器 ==== -->
        <g class="hero__timer">
          <circle class="timer-glow" cx="130" cy="198" r="27" style="fill: var(--timer-color, #2fe0ff)" opacity="0.28" filter="url(#uh-softglow)" />
          <circle cx="130" cy="198" r="15.5" style="fill: var(--timer-color, #2fe0ff)" opacity="0.24" />
          <circle cx="130" cy="198" r="11" style="fill: var(--timer-color, #2fe0ff)" filter="url(#uh-glow)" />
          <circle cx="130" cy="198" r="11" fill="url(#uh-timer-idle)" class="timer-core" />
          <circle cx="130" cy="198" r="15.5" fill="none" stroke="#e8f2ff" stroke-width="1.5" opacity="0.85" />
          <circle cx="126" cy="194" r="3" fill="#ffffff" opacity="0.9" />
        </g>

        <!-- ==== 能量环（蓄力/发射） ==== -->
        <g class="hero__rings" fill="none" style="stroke: var(--timer-color, #2fe0ff)" stroke-width="2">
          <ellipse class="ring ring--1" cx="130" cy="198" rx="18" ry="18" />
          <ellipse class="ring ring--2" cx="130" cy="198" rx="18" ry="18" />
          <ellipse class="ring ring--3" cx="130" cy="198" rx="18" ry="18" />
        </g>
      </g>
    </svg>

    <!-- 地面投影 -->
    <div class="hero__shadow" aria-hidden="true" />
  </div>
</template>

<style scoped>
.hero {
  position: relative;
  display: grid;
  place-items: center;
  transform: scale(var(--hero-scale, 1));
  transform-origin: center center;
  transition: transform 0.9s var(--ease-spring, cubic-bezier(0.34, 1.56, 0.64, 1));
  --aura-inner: #63e6ff;
  --aura-mid: #2f7cff;
  --timer-color: #2fe0ff;
}

.hero__svg {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  overflow: visible;
  filter: drop-shadow(0 18px 34px rgba(0, 10, 30, 0.6));
}

/* ==================== 待机 ==================== */
.hero__body {
  transform-box: view-box;
  transform-origin: 130px 396px;
  animation: hero-float 4.6s ease-in-out infinite;
}

@keyframes hero-float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-11px);
  }
}

.hero__aura {
  transform-box: view-box;
  transform-origin: 130px 198px;
  animation: aura-breathe 5.4s ease-in-out infinite;
}

@keyframes aura-breathe {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.06);
    opacity: 1;
  }
}

.aura-ring--2 {
  transform-box: view-box;
  transform-origin: 130px 198px;
  animation: spin-slow 26s linear infinite;
}
.aura-ring--3 {
  transform-box: view-box;
  transform-origin: 130px 198px;
  animation: spin-slow 40s linear infinite reverse;
}
@keyframes spin-slow {
  to {
    transform: rotate(360deg);
  }
}

/* 眼睛呼吸 */
.eye {
  animation: eye-breathe 2.6s ease-in-out infinite;
  transform-box: view-box;
  transform-origin: 130px 94px;
}
.eye--right {
  animation-delay: 0.1s;
}

@keyframes eye-breathe {
  0%,
  100% {
    opacity: 0.92;
  }
  50% {
    opacity: 1;
  }
}

/* 计时器脉动 */
.timer-core {
  transform-box: view-box;
  transform-origin: 130px 198px;
  animation: timer-pulse 1.65s ease-in-out infinite;
}
.timer-glow {
  transform-box: view-box;
  transform-origin: 130px 198px;
  animation: timer-halo 1.65s ease-in-out infinite;
}

@keyframes timer-pulse {
  0%,
  100% {
    transform: scale(1);
  }
  45% {
    transform: scale(1.16);
  }
}

@keyframes timer-halo {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.22;
  }
  45% {
    transform: scale(1.3);
    opacity: 0.55;
  }
}

/* 手臂默认待机微摆 */
.arm {
  transform-box: view-box;
  transition: transform 0.75s var(--ease-spring, cubic-bezier(0.34, 1.56, 0.64, 1));
}
.arm--right {
  transform-origin: 100px 156px;
}
.arm--left {
  transform-origin: 160px 156px;
}

.hero--idle .arm--right,
.hero--dim .arm--right {
  animation: arm-sway-r 4.6s ease-in-out infinite;
}
.hero--idle .arm--left,
.hero--dim .arm--left {
  animation: arm-sway-l 4.6s ease-in-out infinite;
}

@keyframes arm-sway-r {
  0%,
  100% {
    transform: rotate(0deg);
  }
  50% {
    transform: rotate(-2.5deg);
  }
}
@keyframes arm-sway-l {
  0%,
  100% {
    transform: rotate(0deg);
  }
  50% {
    transform: rotate(2.5deg);
  }
}

/* 能量环默认隐藏 */
.hero__rings .ring {
  opacity: 0;
  transform-box: view-box;
  transform-origin: 130px 198px;
}

/* ==================== 蓄力 charging ==================== */
.hero--charging .arm--right {
  transform: rotate(-95deg);
}
.hero--charging .arm--left {
  transform: rotate(-172deg);
}
.hero--charging .hero__body {
  animation: hero-float 4.6s ease-in-out infinite, charge-tremble 0.16s linear infinite;
}
.hero--charging {
  --timer-color: #ff3b4e;
  --aura-inner: #ff7a8a;
  --aura-mid: #ff2d55;
}
.hero--charging .timer-core {
  animation: timer-flash 0.24s steps(1, end) infinite;
}
.hero--charging .eye {
  animation: none;
  opacity: 1;
}
.hero--charging .hero__rings .ring {
  animation: ring-burst 1.1s ease-out infinite;
}
.hero--charging .ring--2 {
  animation-delay: 0.36s;
}
.hero--charging .ring--3 {
  animation-delay: 0.72s;
}

@keyframes timer-flash {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.35;
  }
}

@keyframes charge-tremble {
  0%,
  100% {
    translate: 0 0;
  }
  25% {
    translate: -1.2px 0.6px;
  }
  75% {
    translate: 1.2px -0.6px;
  }
}

@keyframes ring-burst {
  0% {
    opacity: 0.9;
    transform: scale(0.7);
  }
  100% {
    opacity: 0;
    transform: scale(4.2);
  }
}

/* ==================== 发射 firing ==================== */
.hero--firing {
  --aura-inner: #ffffff;
  --aura-mid: #9fe8ff;
  --timer-color: #ffffff;
}
.hero--firing .arm--right {
  transform: rotate(-95deg) translateX(4px);
}
.hero--firing .arm--left {
  transform: rotate(-172deg) translateY(-3px);
}
.hero--firing .hero__svg {
  filter: drop-shadow(0 0 28px rgba(180, 240, 255, 0.95))
    drop-shadow(0 0 60px rgba(90, 200, 255, 0.7));
}
.hero--firing .hero__body {
  animation: hero-float 4.6s ease-in-out infinite, fire-thrust 0.5s ease-out;
}
.hero--firing .eye {
  animation: none;
  opacity: 1;
}
.hero--firing .hero__rings .ring {
  animation: ring-burst 0.6s ease-out infinite;
}
.hero--firing .ring--2 {
  animation-delay: 0.2s;
}
.hero--firing .ring--3 {
  animation-delay: 0.4s;
}

@keyframes fire-thrust {
  0% {
    transform: scale(1);
  }
  35% {
    transform: scale(1.07);
  }
  100% {
    transform: scale(1.02);
  }
}

/* ==================== 成功 success ==================== */
.hero--success {
  --aura-inner: #9dffd0;
  --aura-mid: #2fe0a0;
  --timer-color: #34e39b;
}
.hero--success .arm--right {
  transform: rotate(-30deg);
}
.hero--success .arm--left {
  transform: rotate(30deg);
}
.hero--success .hero__rings .ring {
  animation: ring-burst 1.4s ease-out infinite;
}
.hero--success .ring--2 {
  animation-delay: 0.46s;
}

/* ==================== 失败 error ==================== */
.hero--error {
  --aura-inner: #ff5566;
  --aura-mid: #7a0b18;
  --timer-color: #ff2b3d;
}
.hero--error .hero__svg {
  filter: grayscale(0.45) brightness(0.72) drop-shadow(0 14px 26px rgba(0, 0, 0, 0.6));
}
.hero--error .hero__body {
  animation: hero-float 4.6s ease-in-out infinite, hero-shake 0.42s ease-in-out;
}
.hero--error .arm--right {
  transform: rotate(-14deg);
}
.hero--error .arm--left {
  transform: rotate(14deg);
}
.hero--error .eye {
  animation: none;
  opacity: 0.45;
  filter: hue-rotate(-46deg) saturate(2.4) brightness(0.8);
}
.hero--error .timer-core {
  animation: timer-flash 0.3s steps(1, end) infinite;
}

@keyframes hero-shake {
  0%,
  100% {
    translate: 0 0;
  }
  15% {
    translate: -9px 0;
  }
  30% {
    translate: 8px 0;
  }
  45% {
    translate: -6px 0;
  }
  60% {
    translate: 5px 0;
  }
  80% {
    translate: -3px 0;
  }
}

/* ==================== 休眠 dim ==================== */
.hero--dim .hero__svg {
  filter: grayscale(0.7) brightness(0.6);
}
.hero--dim .hero__aura {
  opacity: 0.25;
}
.hero--dim .eye {
  animation: none;
  opacity: 0.4;
}

/* ==================== 地面投影 ==================== */
.hero__shadow {
  position: absolute;
  bottom: 2%;
  left: 50%;
  width: 46%;
  height: 16px;
  transform: translateX(-50%);
  border-radius: 50%;
  background: radial-gradient(
    ellipse at center,
    rgba(47, 224, 255, 0.42) 0%,
    rgba(47, 224, 255, 0) 72%
  );
  filter: blur(6px);
  animation: shadow-breathe 4.6s ease-in-out infinite;
}

@keyframes shadow-breathe {
  0%,
  100% {
    transform: translateX(-50%) scaleX(1);
    opacity: 0.75;
  }
  50% {
    transform: translateX(-50%) scaleX(0.84);
    opacity: 0.45;
  }
}

.hero--charging .hero__shadow,
.hero--firing .hero__shadow {
  background: radial-gradient(
    ellipse at center,
    rgba(255, 90, 110, 0.6) 0%,
    rgba(255, 90, 110, 0) 72%
  );
}
.hero--success .hero__shadow {
  background: radial-gradient(
    ellipse at center,
    rgba(52, 227, 155, 0.6) 0%,
    rgba(52, 227, 155, 0) 72%
  );
}
</style>
