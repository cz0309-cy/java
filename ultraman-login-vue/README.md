# java2 · 光之战士登录页（Vue 3 + Vite）

> 用于学习记录 java
> 本仓库当前内容：奥特曼主题动态登录页（Vue 3 + Vite 项目，根目录即项目本体）

一个纯前端的**动态登录页**：左侧是纯 SVG + CSS 绘制的"光之战士"角色动画，右侧是玻璃拟态登录面板。登录时会触发完整的 **能量注入 → 十字交叉蓄力 → 光之射线发射 → 全屏白闪转场** 动画。

> 角色为**原创矢量插画**（几何装甲 + 发光眼灯 + 胸口计时器），未使用任何第三方版权素材。

---

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器（默认 http://localhost:5173）
npm run dev

# 生产构建，产物在 dist/
npm run build

# 本地预览构建产物
npm run preview
```

### 演示账号

| 光之代号 | 能量密钥   | 角色         |
| -------- | ---------- | ------------ |
| `admin`  | `ultraman` | 光之国指挥官 |
| `tiga`   | `123456`   | 迪迦         |

输入错误的账号密码会触发**认证失败动画**（角色抖动、眼灯转暗红、计时器急闪）。

---

## 目录结构

```
ultraman-login-vue/
├── index.html                      # HTML 入口
├── vite.config.js                  # Vite 配置（含 @ → src 别名）
├── jsconfig.json                   # IDE 路径提示
├── package.json
├── public/
│   └── favicon.svg                 # 页面图标（英雄头像）
└── src/
    ├── main.js                     # 应用入口
    ├── App.vue                     # 全局外壳：能量场背景 + 极光 + 路由出口
    ├── router/
    │   └── index.js                # 路由 + 登录守卫
    ├── composables/
    │   ├── useAuth.js              # 登录状态（localStorage，演示用）
    │   └── useEnergy.js            # 全局能量强度，驱动背景粒子活跃度
    ├── styles/
    │   ├── variables.css           # 设计令牌（颜色 / 尺寸 / 缓动曲线）
    │   └── global.css              # 全局重置 + 通用玻璃面板 + 路由过渡
    ├── components/
    │   ├── UltramanHero.vue        # ★ 核心：SVG 英雄 + 6 态动画
    │   ├── EnergyField.vue         # canvas 粒子能量场背景
    │   ├── BeamOverlay.vue         # 全屏光束 / 白闪 / 冲击波转场
    │   └── BaseInput.vue           # 通用输入框（聚焦发光、密码显隐、错误态）
    └── views/
        ├── LoginView.vue           # ★ 登录页（状态机 + 表单）
        └── HomeView.vue            # 变身成功后的作战指挥舱
```

---

## 动画状态机

`UltramanHero.vue` 由 `phase` 属性驱动，共 6 个状态：

| phase      | 表现                                                         |
| ---------- | ------------------------------------------------------------ |
| `idle`     | 悬浮呼吸、眼灯明暗、计时器蓝光脉动、光环绕轴旋转、手臂轻摆   |
| `charging` | 双臂旋成十字交叉、计时器转红急闪、三道能量环向外扩散、身体微颤 |
| `firing`   | 保持十字姿态、全身强光、屏幕抖动、配合 `BeamOverlay` 全屏射线 |
| `success`  | 计时器转绿、双臂张开、绿色冲击波扩散                         |
| `error`    | 去色降亮、眼灯暗红、计时器红闪、角色左右剧烈抖动             |
| `dim`      | 整体半透明降饱和（休眠态，可复用为"离线"表现）               |

登录页的完整时序（`LoginView.vue` → `handleSubmit`）：

```
点击登录
  └─ charging  1150ms   （背景能量场同步拉满至 0.9）
      └─ 调用 useAuth().login()
          ├─ 成功 → firing  520ms → BeamOverlay 白闪 → success → 跳转 /home
          └─ 失败 → error  2600ms → 自动回到 idle
```

---

## 自定义

### 换主题色

只改 `src/styles/variables.css` 里的能量色即可，组件与 SVG 均通过 CSS 变量继承：

```css
:root {
  --energy-cyan: #2fe0ff;    /* 主色：眼灯、聚焦边框、进度条 */
  --energy-blue: #2f7cff;
  --energy-violet: #8a5cff;
  --energy-gold: #ffd447;
  --energy-red: #ff3b4e;     /* 失败态 / 蓄力计时器 */
}
```

角色身上的光环与计时器颜色由 `UltramanHero.vue` 顶部的 `--aura-inner / --aura-mid / --timer-color` 局部变量控制，切换 phase 时会自动过渡。

### 接真实接口

编辑 `src/composables/useAuth.js`，把 `login()` 里的 `setTimeout` 模拟逻辑换成真实请求即可，返回值保持 `{ ok, message?, user? }` 格式，登录页无需改动：

```js
async function login(username, password) {
  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  })
  const data = await res.json()
  if (!res.ok) return { ok: false, message: data.message }
  session.value = data.user
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data.user))
  return { ok: true, user: data.user }
}
```

### 调整动画速度

- 蓄力/发射时长：`LoginView.vue` 中 `handleSubmit` 里的 `1150`、`520`、`1250` 三个毫秒值
- 角色底层动画：`UltramanHero.vue` 里的 `hero-float`（4.6s 悬浮）、`timer-pulse`（1.65s 心跳）
- 全局降级：已在 `global.css` 中处理 `prefers-reduced-motion`，系统开启"减少动态效果"时动画自动关闭

### 只用角色组件

`UltramanHero.vue` 无外部依赖（除 Vue 本身），可单独复制到任意 Vue 项目：

```vue
<UltramanHero :phase="phase" :scale="1" />
```

---

## 技术要点

- **零动画库**：全部动效用 CSS `@keyframes` + SVG `transform-box: view-box` 精确控制关节点旋转（肩关节坐标作为 `transform-origin`）
- **canvas 粒子场**：`EnergyField.vue` 自行处理 DPR 缩放，能量值 > 0.55 时自动开启粒子连线
- **性能**：动画只使用 `transform` / `opacity` / `filter`，粒子数按屏幕面积自适应（上限 160，连线仅在蓄力阶段开启）
- **响应式**：1080px / 860px / 480px 三档断点，窄屏自动上下堆叠
- **无障碍**：SVG 带 `role="img"` + `aria-label`，密码显隐按钮有 `aria-label`，装饰元素统一 `aria-hidden`

---

## 说明

演示数据（统计数字、任务列表）仅用于界面展示，不涉及任何真实业务。登录状态存于 `localStorage`，键名 `ultraman.session`，点击右上角"解除变身"即可清除。
