/**
 * 极简的登录状态管理（基于 localStorage）。
 * 真实项目里请替换为接口调用 + token 校验。
 */
import { ref, computed } from 'vue'

const STORAGE_KEY = 'ultraman.session'

/** 演示账号 */
const DEMO_ACCOUNTS = [
  { username: 'admin', password: 'ultraman', name: '光之国指挥官', role: '指挥官' },
  { username: 'tiga', password: '123456', name: '迪迦', role: '战士' }
]

function readSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const session = ref(readSession())

export function isLoggedIn() {
  return !!session.value
}

export function useAuth() {
  const user = computed(() => session.value)

  /**
   * 模拟异步登录
   * @returns {Promise<{ok: boolean, message?: string, user?: object}>}
   */
  function login(username, password) {
    return new Promise((resolve) => {
      // 模拟网络延迟
      setTimeout(() => {
        const matched = DEMO_ACCOUNTS.find(
          (acc) => acc.username === username.trim() && acc.password === password
        )

        if (!matched) {
          resolve({ ok: false, message: '身份认证失败：光之能量不匹配' })
          return
        }

        const payload = {
          username: matched.username,
          name: matched.name,
          role: matched.role,
          loginAt: new Date().toISOString()
        }
        session.value = payload
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
        } catch {
          /* 隐私模式下忽略 */
        }
        resolve({ ok: true, user: payload })
      }, 700)
    })
  }

  function logout() {
    session.value = null
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      /* ignore */
    }
  }

  return { user, login, logout, isLoggedIn }
}

export { DEMO_ACCOUNTS }
