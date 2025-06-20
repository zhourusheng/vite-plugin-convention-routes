# Vite 约定式路由插件

一个类似Umi的约定式路由Vite插件，可以自动根据文件结构生成路由配置，减少80%路由样板代码，降低90%的路由BUG。

## 特性

- 📁 **约定式路由** - 根据文件目录结构自动生成路由配置
- 🔄 **动态路由** - 支持 `[param]` 语法的动态路由参数，支持多个参数嵌套
- 🔍 **类型安全** - 自动生成TypeScript类型声明
- 🔌 **易于集成** - 与Vue Router无缝集成
- 🔥 **热更新** - 支持路由文件的热更新

## 安装

```bash
# 使用npm
npm install vite-plugin-convention-routes --save-dev

# 使用yarn
yarn add vite-plugin-convention-routes --dev

# 使用pnpm
pnpm add vite-plugin-convention-routes -D
```

## 使用方法

### 配置Vite插件

```js
// vite.config.js / vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import conventionRoutes from 'vite-plugin-convention-routes'

export default defineConfig({
  plugins: [
    vue(),
    conventionRoutes({
      // 路由文件所在目录
      routesDir: 'src/views',
      // 是否生成类型声明文件
      generateDeclaration: true,
      // 是否在控制台打印路由信息
      verbose: true
    })
  ]
})
```

### 创建路由文件

```js
// src/router/index.js 或 src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'

// 这里的routes数组会被插件自动替换为约定式路由
const routes = []

export const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
```

### 文件结构约定

```
src/views/
├── index.vue                   # 路由: /
├── about.vue                   # 路由: /about
├── users/
│   ├── index.vue               # 路由: /users
│   ├── [id].vue                # 路由: /users/:id
│   └── [id]/
│       ├── index.vue           # 路由: /users/:id
│       ├── profile.vue         # 路由: /users/:id/profile
│       └── settings.vue        # 路由: /users/:id/settings
├── exam/
│   ├── index.vue               # 路由: /exam
│   └── [courseId]/
│       ├── index.vue           # 路由: /exam/:courseId
│       └── [chapterId]/
│           └── index.vue       # 路由: /exam/:courseId/:chapterId
└── posts/
    ├── index.vue               # 路由: /posts
    └── [id].vue                # 路由: /posts/:id
```

## 路由规则

- `index.vue` 文件映射到父路径
- `[param].vue` 文件映射到动态路由参数 `:param`
- 支持多个动态参数嵌套，如 `/exam/[courseId]/[chapterId]` 映射为 `/exam/:courseId/:chapterId`
- 其他文件名直接映射到路由路径

## 配置选项

| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `routesDir` | `string` | `'src/views'` | 路由文件所在目录 |
| `extensions` | `string[]` | `['.vue']` | 要处理的文件扩展名 |
| `generateDeclaration` | `boolean` | `true` | 是否生成路由声明文件 |
| `declarationPath` | `string` | `'src/router/routes.d.ts'` | 路由声明文件输出路径 |
| `verbose` | `boolean` | `false` | 是否在控制台打印路由信息 |

## 开发

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm run dev

# 构建插件
pnpm run build

# 运行测试
pnpm test
```

## 示例

查看 `example` 目录中的示例项目，了解如何使用此插件。示例中包含了多级路由参数的实际应用，如 `/exam/:courseId/:chapterId`。

## 许可证

MIT 