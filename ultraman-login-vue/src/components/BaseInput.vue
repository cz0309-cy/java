<script setup>
/**
 * BaseInput —— 登录页通用输入框
 * 支持：前后置图标插槽、聚焦发光、错误态、密码显隐
 */
import { computed, ref } from 'vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  label: { type: String, default: '' },
  type: { type: String, default: 'text' },
  placeholder: { type: String, default: '' },
  autocomplete: { type: String, default: 'off' },
  error: { type: String, default: '' },
  disabled: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'enter'])

const focused = ref(false)
const reveal = ref(false)

const actualType = computed(() => {
  if (props.type !== 'password') return props.type
  return reveal.value ? 'text' : 'password'
})

const isPassword = computed(() => props.type === 'password')

function onInput(e) {
  emit('update:modelValue', e.target.value)
}
</script>

<template>
  <label class="field" :class="{ 'field--focus': focused, 'field--error': !!error, 'field--disabled': disabled }">
    <span v-if="label" class="field__label">{{ label }}</span>

    <span class="field__box">
      <span class="field__icon" aria-hidden="true">
        <slot name="icon" />
      </span>

      <input
        class="field__input"
        :type="actualType"
        :value="modelValue"
        :placeholder="placeholder"
        :autocomplete="autocomplete"
        :disabled="disabled"
        @input="onInput"
        @focus="focused = true"
        @blur="focused = false"
        @keyup.enter="emit('enter')"
      />

      <button
        v-if="isPassword"
        type="button"
        class="field__toggle"
        :aria-label="reveal ? '隐藏密码' : '显示密码'"
        tabindex="-1"
        @click="reveal = !reveal"
      >
        <svg v-if="!reveal" viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.7">
          <path d="M1.8 12S5.5 5.2 12 5.2 22.2 12 22.2 12 18.5 18.8 12 18.8 1.8 12 1.8 12Z" />
          <circle cx="12" cy="12" r="3.2" />
        </svg>
        <svg v-else viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.7">
          <path d="M3 3l18 18" />
          <path d="M10.6 6.1A9.6 9.6 0 0 1 12 6c6.5 0 10.2 6 10.2 6a17 17 0 0 1-3.3 3.9" />
          <path d="M6.4 7.9A16.7 16.7 0 0 0 1.8 12s3.7 6 10.2 6a10 10 0 0 0 3.6-.66" />
          <path d="M9.9 10.2a3.2 3.2 0 0 0 4.3 4.3" />
        </svg>
      </button>

      <span class="field__scan" aria-hidden="true" />
    </span>

    <Transition name="hint">
      <span v-if="error" class="field__error">{{ error }}</span>
    </Transition>
  </label>
</template>

<style scoped>
.field {
  display: block;
}

.field__label {
  display: block;
  margin-bottom: 8px;
  font-size: 12.5px;
  letter-spacing: 0.14em;
  color: var(--text-secondary);
  text-transform: uppercase;
}

.field__box {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  height: 52px;
  padding: 0 14px;
  border-radius: var(--radius-md);
  background: var(--field-bg);
  border: 1px solid var(--field-border);
  transition: border-color 0.28s var(--ease-out-soft),
    box-shadow 0.28s var(--ease-out-soft), background 0.28s var(--ease-out-soft);
  overflow: hidden;
}

.field--focus .field__box {
  border-color: var(--field-focus);
  background: rgba(8, 20, 40, 0.88);
  box-shadow: 0 0 0 3px rgba(47, 224, 255, 0.14),
    0 0 26px rgba(47, 224, 255, 0.28), inset 0 0 22px rgba(47, 224, 255, 0.08);
}

.field--error .field__box {
  border-color: rgba(255, 59, 78, 0.75);
  box-shadow: 0 0 0 3px rgba(255, 59, 78, 0.14),
    0 0 22px rgba(255, 59, 78, 0.28);
}

.field--disabled {
  opacity: 0.55;
  pointer-events: none;
}

.field__icon {
  display: grid;
  place-items: center;
  width: 20px;
  height: 20px;
  color: var(--text-muted);
  transition: color 0.28s var(--ease-out-soft);
  flex: none;
}

.field--focus .field__icon {
  color: var(--energy-cyan);
}

.field__input {
  flex: 1;
  min-width: 0;
  height: 100%;
  border: none;
  outline: none;
  background: transparent;
  color: var(--text-primary);
  font-size: 15px;
  letter-spacing: 0.02em;
}

.field__input::placeholder {
  color: var(--text-muted);
}

.field__input:-webkit-autofill {
  -webkit-text-fill-color: var(--text-primary);
  transition: background-color 9999s ease-out;
}

.field__toggle {
  flex: none;
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--text-muted);
  border-radius: 8px;
  transition: color 0.2s, background 0.2s;
}

.field__toggle:hover {
  color: var(--energy-cyan);
  background: rgba(47, 224, 255, 0.1);
}

/* 聚焦扫描光 */
.field__scan {
  position: absolute;
  left: 0;
  bottom: 0;
  height: 2px;
  width: 100%;
  transform: scaleX(0);
  transform-origin: left center;
  background: linear-gradient(
    90deg,
    transparent,
    var(--energy-cyan),
    var(--energy-violet),
    transparent
  );
  transition: transform 0.5s var(--ease-out-soft);
}

.field--focus .field__scan {
  transform: scaleX(1);
  animation: scan-slide 1.6s linear infinite;
}

@keyframes scan-slide {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.field__error {
  display: block;
  margin-top: 7px;
  font-size: 12.5px;
  color: #ff7f8d;
  letter-spacing: 0.02em;
}

.hint-enter-active,
.hint-leave-active {
  transition: opacity 0.22s, transform 0.22s;
}
.hint-enter-from,
.hint-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
