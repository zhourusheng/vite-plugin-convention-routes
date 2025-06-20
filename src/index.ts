import type { Plugin, ResolvedConfig } from 'vite'
import path from 'path'
import fs from 'fs'

export interface RouteOptions {
  /**
   * 路由文件所在目录
   * @default 'src/views'
   */
  routesDir?: string

  /**
   * 路由文件扩展名
   * @default ['.vue']
   */
  extensions?: string[]

  /**
   * 是否生成路由声明文件
   * @default true
   */
  generateDeclaration?: boolean

  /**
   * 路由声明文件输出路径
   * @default 'src/router/routes.d.ts'
   */
  declarationPath?: string

  /**
   * 是否在控制台打印路由信息
   * @default false
   */
  verbose?: boolean

  /**
   * 是否开启路由懒加载
   * @default true
   */
  isLazy?: boolean

  /**
   * 需要排除的目录
   * @default ['components']
   */
  excludes?: string[]
}

/**
 * 约定式路由Vite插件
 * 自动根据文件结构生成路由配置
 */
export default function vitePluginConventionRoutes(
  options: RouteOptions = {}
): Plugin {
  const {
    routesDir = 'src/views',
    extensions = ['.vue'],
    generateDeclaration = true,
    declarationPath = 'src/router/routes.d.ts',
    verbose = false,
    isLazy = true,
    excludes = ['components']
  } = options

  let config: ResolvedConfig
  let routesCode = ''
  let projectRoot = ''

  return {
    name: 'vite-plugin-convention-routes',

    configResolved(resolvedConfig) {
      config = resolvedConfig
      projectRoot = config.root

      if (verbose) {
        console.log('[vite-plugin-convention-routes] 项目根目录:', projectRoot)
        console.log('[vite-plugin-convention-routes] 路由目录:', routesDir)
        console.log('[vite-plugin-convention-routes] 排除目录:', excludes)
      }
    },

    transform(code, id) {
      // 只处理路由注册文件
      if (
        id.includes('router/index') &&
        (id.endsWith('.js') || id.endsWith('.ts'))
      ) {
        if (verbose) {
          console.log('[vite-plugin-convention-routes] 检测到路由文件:', id)
        }

        // 生成路由代码
        const routesImportCode = `
// 自动生成的路由配置
const routes = [
  {
    path: '/',
    component: ${isLazy 
      ? '() => import(\'/' + routesDir + '/index.vue\')' 
      : 'import(\'/' + routesDir + '/index.vue\').default'
    },
    children: []
  }
];

// 约定式路由导入
const pages = import.meta.glob('/${routesDir}/**/*.vue', { ${isLazy ? '' : 'eager: true, '} });

// 处理路由路径
Object.keys(pages).forEach((path) => {
  const routePath = path
    .replace(new RegExp(\`^/${routesDir}/\`), '')
    .replace(/\\.vue$/, '')
    .replace(/index$/, '')
    // 支持多个动态路由参数
    .replace(/\\[(\\w+)\\]/g, ':$1')
    .replace(/\\/index$/, '')
    .replace(/\\//g, '/');
    
  // 忽略已经处理的首页路由
  if (routePath === '') return;
  
  // 排除指定目录下的文件
  const shouldExclude = ${JSON.stringify(excludes)}.some(excludeDir => 
    path.includes(\`/${routesDir}/\${excludeDir}/\`) || 
    path.startsWith(\`/${routesDir}/\${excludeDir}.\`)
  );
  
  if (shouldExclude) {
    if (${verbose}) {
      console.log('[vite-plugin-convention-routes] 排除路由:', path);
    }
    return;
  }
  
  // 创建路由对象
  const route = {
    path: routePath === '' ? '/' : \`/\${routePath}\`,
    component: ${isLazy ? 'pages[path]' : 'pages[path].default'},
    name: routePath.replace(/\\//g, '-') || 'home'
  };
  
  // 添加到路由数组
  routes.push(route);
});

`

        // 保存生成的路由代码，用于生成声明文件
        routesCode = routesImportCode

        // 在路由文件中注入自动生成的路由代码
        return code.replace(/const\s+routes\s*=\s*\[\s*\]/, routesImportCode)
      }
      return null
    },

    async closeBundle() {
      if (generateDeclaration && routesCode) {
        // 生成路由声明文件
        const declarationContent = `// 自动生成的路由类型声明
import { RouteRecordRaw } from 'vue-router';

declare const routes: RouteRecordRaw[];
export default routes;
`

        if (verbose) {
          console.log(
            '[vite-plugin-convention-routes] 生成路由声明文件:',
            declarationPath
          )
        }

        // 使用Node.js的fs模块写入文件
        try {
          const fullPath = path.resolve(projectRoot, declarationPath)
          const dirPath = path.dirname(fullPath)

          // 确保目录存在
          if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true })
          }

          // 写入声明文件
          fs.writeFileSync(fullPath, declarationContent, 'utf-8')

          if (verbose) {
            console.log(
              '[vite-plugin-convention-routes] 路由声明文件已生成:',
              fullPath
            )
          }
        } catch (error) {
          console.error(
            '[vite-plugin-convention-routes] 生成声明文件失败:',
            error
          )
        }
      }
    },

    // 提供虚拟模块，可以通过import导入生成的路由
    resolveId(id) {
      if (id === 'virtual:convention-routes') {
        return '\0virtual:convention-routes'
      }
      return null
    },

    load(id) {
      if (id === '\0virtual:convention-routes') {
        return routesCode || 'export default [];'
      }
      return null
    },

    // 监听路由文件变化，触发重新编译
    configureServer(server) {
      const routesGlob = `${routesDir}/**/*.vue`

      server.watcher.add(routesGlob)

      server.watcher.on('add', file => {
        if (
          file.includes(routesDir) &&
          extensions.some(ext => file.endsWith(ext))
        ) {
          if (verbose) {
            console.log(
              '[vite-plugin-convention-routes] 检测到新路由文件:',
              file
            )
          }
          // 触发重新编译
          server.restart()
        }
      })

      server.watcher.on('unlink', file => {
        if (
          file.includes(routesDir) &&
          extensions.some(ext => file.endsWith(ext))
        ) {
          if (verbose) {
            console.log(
              '[vite-plugin-convention-routes] 检测到路由文件删除:',
              file
            )
          }
          // 触发重新编译
          server.restart()
        }
      })
    }
  }
}

