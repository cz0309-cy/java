<script setup>
import { RouterView } from 'vue-router'
import EnergyField from '@/components/EnergyField.vue'
import { useEnergy } from '@/composables/useEnergy'

const { intensity } = useEnergy()
</script>

<template>
  <div class="app-shell">
    <!-- 全局能量场背景（能量强度由页面联动控制） -->
    <EnergyField :intensity="intensity" />

    <!-- 背景光晕 -->
    <div class="aurora aurora--cyan" aria-hidden="true" />
    <div class="aurora aurora--violet" aria-hidden="true" />

    <!-- 扫描线 -->
    <div class="scanlines" aria-hidden="true" />

    <main class="app-main">
      <RouterView v-slot="{ Component }">
        <Transition name="route-fade" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>
  </div>
</template>

<style scoped>
.app-shell {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: radial-gradient(
      120% 90% at 50% 0%,
      var(--bg-soft) 0%,
      var(--bg-mid) 45%,
      var(--bg-deep) 100%
    );
}

.app-main {
  position: relative;
  z-index: 5;
  width: 100%;
  height: 100%;
}

/* 极光光晕 */
.aurora {
  position: absolute;
  z-index: 1;
  border-radius: 50%;
  filter: blur(90px);
  pointer-events: none;
  will-change: transform, opacity;
}

.aurora--cyan {
  width: 46vw;
  height: 46vw;
  left: -12vw;
  top: -14vw;
  background: radial-gradient(
    circle,
    rgba(47, 224, 255, 0.34) 0%,
    rgba(47, 224, 255, 0) 68%
  );
  animation: drift-a 16s ease-in-out infinite alternate;
}

.aurora--violet {
  width: 40vw;
  height: 40vw;
  right: -10vw;
  bottom: -16vw;
  background: radial-gradient(
    circle,
    rgba(138, 92, 255, 0.32) 0%,
    rgba(138, 92, 255, 0) 70%
  );
  animation: drift-b 20s ease-in-out infinite alternate;
}

@keyframes drift-a {
  0% {
    transform: translate3d(0, 0, 0) scale(1);
    opacity: 0.85;
  }
  100% {
    transform: translate3d(6vw, 5vh, 0) scale(1.18);
    opacity: 1;
  }
}

@keyframes drift-b {
  0% {
    transform: translate3d(0, 0, 0) scale(1.1);
    opacity: 0.7;
  }
  100% {
    transform: translate3d(-5vw, -6vh, 0) scale(1);
    opacity: 1;
  }
}

/* 网格 + 扫描线 */
.scanlines {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  opacity: 0.5;
  background-image: linear-gradient(
      to right,
      rgba(120, 190, 255, 0.06) 1px,
      transparent 1px
    ),
    linear-gradient(to bottom, rgba(120, 190, 255, 0.05) 1px, transparent 1px);
  background-size: 64px 64px, 64px 64px;
  mask-image: radial-gradient(120% 90% at 50% 40%, #000 30%, transparent 88%);
  -webkit-mask-image: radial-gradient(
    120% 90% at 50% 40%,
    #000 30%,
    transparent 88%
  );
}
</style>
