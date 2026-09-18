<script setup>
/**
 * BeamOverlay —— 全屏光束 / 闪光转场
 * active 为 true 时播放：蓄能 → 白色 x 光柱横扫 → 全屏白闪 → 冲击波环
 */
defineProps({
  active: { type: Boolean, default: false }
})
</script>

<template>
  <Transition name="beam">
    <div v-if="active" class="beam" aria-hidden="true">
      <!-- 放射光柱 -->
      <div class="beam__rays" />
      <!-- 核心横向光束 -->
      <div class="beam__core" />
      <!-- 冲击波环 -->
      <div class="beam__shock" />
      <div class="beam__shock beam__shock--2" />
      <!-- 全屏白闪 -->
      <div class="beam__flash" />
      <!-- 噪点颗粒 -->
      <div class="beam__grain" />
    </div>
  </Transition>
</template>

<style scoped>
.beam {
  position: fixed;
  inset: 0;
  z-index: 90;
  pointer-events: none;
  overflow: hidden;
}

/* ---------- 放射光柱 ---------- */
.beam__rays {
  position: absolute;
  inset: -30%;
  background: conic-gradient(
    from 0deg,
    rgba(255, 255, 255, 0) 0deg,
    rgba(180, 245, 255, 0.55) 3deg,
    rgba(255, 255, 255, 0) 7deg,
    rgba(255, 255, 255, 0) 40deg,
    rgba(160, 210, 255, 0.4) 44deg,
    rgba(255, 255, 255, 0) 49deg,
    rgba(255, 255, 255, 0) 90deg,
    rgba(200, 250, 255, 0.5) 94deg,
    rgba(255, 255, 255, 0) 99deg,
    rgba(255, 255, 255, 0) 180deg,
    rgba(170, 220, 255, 0.45) 184deg,
    rgba(255, 255, 255, 0) 189deg,
    rgba(255, 255, 255, 0) 240deg,
    rgba(190, 245, 255, 0.5) 244deg,
    rgba(255, 255, 255, 0) 249deg,
    rgba(255, 255, 255, 0) 300deg,
    rgba(150, 205, 255, 0.4) 304deg,
    rgba(255, 255, 255, 0) 309deg,
    rgba(255, 255, 255, 0) 360deg
  );
  animation: rays-spin 0.9s linear 2, rays-fade 0.75s ease-out forwards;
  opacity: 0.9;
}

@keyframes rays-spin {
  to {
    transform: rotate(180deg);
  }
}

@keyframes rays-fade {
  0% {
    opacity: 0;
  }
  18% {
    opacity: 0.95;
  }
  100% {
    opacity: 0;
  }
}

/* ---------- 核心光束 ---------- */
.beam__core {
  position: absolute;
  top: 50%;
  left: -10%;
  width: 120%;
  height: 0;
  transform: translateY(-50%);
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(150, 240, 255, 0.85) 18%,
    #ffffff 45%,
    rgba(190, 245, 255, 0.9) 78%,
    rgba(255, 255, 255, 0) 100%
  );
  filter: blur(2px) drop-shadow(0 0 40px rgba(120, 230, 255, 0.95));
  border-radius: 999px;
  animation: core-fire 0.85s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes core-fire {
  0% {
    height: 0;
    opacity: 0;
  }
  22% {
    height: 6px;
    opacity: 1;
  }
  40% {
    height: 46px;
    opacity: 1;
  }
  70% {
    height: 26px;
    opacity: 0.9;
  }
  100% {
    height: 0;
    opacity: 0;
  }
}

/* ---------- 冲击波 ---------- */
.beam__shock {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 40vmax;
  height: 40vmax;
  margin: -20vmax 0 0 -20vmax;
  border-radius: 50%;
  border: 3px solid rgba(180, 245, 255, 0.9);
  box-shadow: 0 0 60px rgba(120, 220, 255, 0.7) inset,
    0 0 60px rgba(120, 220, 255, 0.6);
  animation: shock-out 1.05s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.beam__shock--2 {
  animation-delay: 0.14s;
  border-color: rgba(255, 255, 255, 0.85);
}

@keyframes shock-out {
  0% {
    opacity: 0.95;
    transform: scale(0.08);
  }
  60% {
    opacity: 0.6;
  }
  100% {
    opacity: 0;
    transform: scale(3.1);
  }
}

/* ---------- 白闪 ---------- */
.beam__flash {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    circle at 50% 50%,
    #ffffff 0%,
    #d8f6ff 35%,
    rgba(120, 200, 255, 0.4) 70%,
    rgba(10, 20, 40, 0) 100%
  );
  animation: flash-out 0.9s ease-out forwards;
}

@keyframes flash-out {
  0% {
    opacity: 0;
  }
  26% {
    opacity: 1;
  }
  55% {
    opacity: 0.75;
  }
  100% {
    opacity: 0;
  }
}

/* ---------- 颗粒 ---------- */
.beam__grain {
  position: absolute;
  inset: 0;
  opacity: 0.14;
  mix-blend-mode: overlay;
  animation: grain-move 0.24s steps(2, end) infinite;
  background-image: radial-gradient(rgba(255, 255, 255, 0.9) 0.6px, transparent 0.6px),
    radial-gradient(rgba(160, 220, 255, 0.8) 0.6px, transparent 0.6px);
  background-size: 5px 5px, 7px 7px;
  background-position: 0 0, 3px 4px;
}

@keyframes grain-move {
  0% {
    background-position: 0 0, 3px 4px;
  }
  50% {
    background-position: 2px 3px, 5px 1px;
  }
  100% {
    background-position: 4px 1px, 1px 6px;
  }
}

/* ---------- 进出场 ---------- */
.beam-enter-active,
.beam-leave-active {
  transition: opacity 0.4s ease;
}
.beam-enter-from,
.beam-leave-to {
  opacity: 0;
}
</style>
