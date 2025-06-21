# Vite 约定式路由插件

一个类似Umi的约定式路由Vite插件，可以自动根据文件结构生成路由配置，减少80%路由样板代码，降低90%的路由BUG。

## 特性

- 📁 **约定式路由** - 根据文件目录结构自动生成路由配置
- 🔄 **动态路由** - 支持 `[param]` 语法的动态路由参数，支持多个参数嵌套
- 🚀 **懒加载** - 默认支持路由组件懒加载，提升应用性能
- 🔍 **类型安全** - 自动生成TypeScript类型声明
- 🔌 **易于集成** - 与Vue Router无缝集成
- 🔥 **热更新** - 支持路由文件的热更新
- 🧩 **排除目录** - 支持排除特定目录，如组件库目录不生成路由
- 📋 **布局组件** - 支持 `_layout.vue` 作为父路由的布局组件，实现嵌套路由
- 📋 **路由元数据** - 支持路由元数据配置（通过配置文件或组件内定义）

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
      verbose: true,
      // 是否开启路由懒加载
      isLazy: true,
      // 需要排除的目录
      excludes: ['components', 'common'],
      // 布局文件名
      layoutName: '_layout'
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
│   ├── _layout.vue             # 布局组件: /users 的布局
│   ├── index.vue               # 路由: /users
│   ├── [id].vue                # 路由: /users/:id
│   └── [id]/
│       ├── index.vue           # 路由: /users/:id
│       ├── profile.vue         # 路由: /users/:id/profile
│       └── settings.vue        # 路由: /users/:id/settings
├── exam/
│   ├── _layout.vue             # 布局组件: /exam 的布局
│   ├── index.vue               # 路由: /exam
│   └── [courseId]/
│       ├── index.vue           # 路由: /exam/:courseId
│       └── [chapterId]/
│           └── index.vue       # 路由: /exam/:courseId/:chapterId
├── posts/
│   ├── index.vue               # 路由: /posts
│   └── [id].vue                # 路由: /posts/:id
└── components/                 # 默认被排除，不生成路由
    ├── Header.vue              # 不会生成路由
    └── Footer.vue              # 不会生成路由
```

### 生成的路由配置示例

以上文件结构将生成如下路由配置：

```js
[
  {
    "path": "/",
    "component": "() => Component",
    "name": "home"
  },
  {
    "path": "/about",
    "component": "() => Component",
    "name": "about",
    "originalFilePath": "/src/views/about.vue"
  },
  {
    "path": "/exam",
    "component": "() => Component",
    "children": [
      {
        "path": ":courseId/:chapterId",
        "component": "() => Component",
        "name": "exam-courseId-chapterId",
        "originalFilePath": "/src/views/exam/[courseId]/[chapterId]/index.vue"
      },
      {
        "path": ":courseId",
        "component": "() => Component",
        "name": "exam-courseId",
        "originalFilePath": "/src/views/exam/[courseId]/index.vue"
      },
      {
        "path": "",
        "component": "() => Component",
        "name": "exam",
        "originalFilePath": "/src/views/exam/index.vue"
      }
    ]
  },
  {
    "path": "/users",
    "component": "() => Component",
    "children": [
      {
        "path": ":id",
        "component": "() => Component",
        "name": "users-id",
        "originalFilePath": "/src/views/users/[id].vue"
      },
      {
        "path": "",
        "component": "() => Component",
        "name": "users",
        "originalFilePath": "/src/views/users/index.vue"
      }
    ]
  }
]
```

注意：实际生成的路由配置中，`"() => Component"` 是真实的组件引用函数，这里只是为了展示而简化。

## 布局组件

布局组件是一种特殊的组件，用于为特定目录下的所有路由提供共享布局。布局组件命名为 `_layout.vue`，放置在需要应用布局的目录中。

例如，`src/views/users/_layout.vue` 将作为 `/users` 路径下所有路由的布局组件，所有 `/users/` 开头的路由都将嵌套在这个布局组件内。布局组件需要包含 `<router-view></router-view>` 标签来显示子路由内容。

```vue
<!-- src/views/users/_layout.vue -->
<template>
  <div class="users-layout">
    <h1>用户模块</h1>
    <nav>
      <router-link to="/users">用户列表</router-link>
      <!-- 其他导航链接 -->
    </nav>
    
    <!-- 子路由内容将在这里渲染 -->
    <router-view></router-view>
  </div>
</template>
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
| `isLazy` | `boolean` | `true` | 是否开启路由懒加载 |
| `excludes` | `string[]` | `['components']` | 需要排除的目录，这些目录下的文件不会被添加到路由配置中 |
| `layoutName` | `string` | `'_layout'` | 布局文件名，用于识别布局组件 |
| `metaConfigPath` | `string` | `'src/router/route-meta.js'` | 路由元数据配置文件路径 |
| `enableInComponentMeta` | `boolean` | `true` | 是否启用组件内定义元数据 |

## 路由元数据配置

### 1. 通过配置文件定义元数据

可以创建专门的配置文件来定义路由元数据：

```js
// src/router/route-meta.js
export default {
  '/': {
    title: '首页',
    icon: 'home',
    keepAlive: true
  },
  '/users': {
    title: '用户管理',
    permissions: ['admin'],
    icon: 'user-group'
  },
  '/users/:id': {
    title: '用户详情',
    parentPath: '/users',
    breadcrumb: true
  }
}
```

### 2. 在组件内定义元数据

可以使用两种方式在组件内定义元数据：

#### 方式一：注释块

使用特定格式的注释块来定义元数据：

```vue
<template>
  <div>用户列表页面</div>
</template>

<script>
/* route-meta
{
  "title": "用户管理",
  "icon": "user-group",
  "permissions": ["admin"],
  "keepAlive": true
}
*/
export default {
  name: 'UserList'
}
</script>
```

#### 方式二：导出变量

通过导出 `routeMeta` 变量来定义元数据：

```vue
<template>
  <div>关于页面</div>
</template>

<script>
// 使用导出变量的方式定义路由元数据
export const routeMeta = {
  title: '关于我们',
  icon: 'info-circle',
  isPublic: true,
  noCache: true
}

export default {
  name: 'AboutPage'
}
</script>
```

### 元数据优先级

如果同一个路由在多个地方定义了元数据，优先级如下：

1. 组件内定义的元数据（最高优先级）
2. 配置文件中定义的元数据
3. 默认元数据（如果有）

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