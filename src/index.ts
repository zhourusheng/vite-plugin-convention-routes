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

  /**
   * 布局文件名
   * @default '_layout'
   */
  layoutName?: string
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
    excludes = ['components'],
    layoutName = '_layout'
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
        console.log('[vite-plugin-convention-routes] 布局文件名:', layoutName)
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
[
  // 初始路由配置将在这里生成
].concat((() => {
  // 存储所有生成的路由
  const generatedRoutes = [];

  // 约定式路由导入
  const pages = import.meta.glob('/${routesDir}/**/*.vue', { ${isLazy ? '' : 'eager: true, '} });

  // 存储布局组件
  const layouts = {};

  // 存储路由路径与组件的映射
  const routeMap = {};

  // 检测根目录是否有index.vue文件
  let hasRootIndex = false;

  // 第一步：收集所有路由和布局组件
  Object.keys(pages).forEach((path) => {
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
    
    const routePath = path
      .replace(new RegExp(\`^/${routesDir}/\`), '')
      .replace(/\\.vue$/, '');
    
    // 检查是否为根目录的index.vue
    if (routePath === 'index') {
      hasRootIndex = true;
      generatedRoutes.push({
        path: '/',
        component: ${isLazy ? 'pages[path]' : 'pages[path].default'},
        name: 'home'
      });
      
      if (${verbose}) {
        console.log('[vite-plugin-convention-routes] 添加根路由: / 组件:', pages[path] ? '已加载' : '未加载');
      }
      return;
    }
      
    // 检查是否是布局组件
    if (routePath.endsWith(\`/${layoutName}\`)) {
      // 获取布局组件所在的目录路径
      const layoutDir = routePath.replace(new RegExp(\`/${layoutName}$\`), '');
      layouts[layoutDir] = {
        component: ${isLazy ? 'pages[path]' : 'pages[path].default'},
        path: layoutDir
      };
      
      if (${verbose}) {
        console.log('[vite-plugin-convention-routes] 检测到布局组件:', path, '目录:', layoutDir);
      }
      return;
    }
    
    // 处理路由路径，将文件路径转换为URL路径
    // 例如: users/[id]/index.vue -> users/:id
    const processedPath = routePath
      .replace(/index$/, '')
      .replace(/\\[(\\w+)\\]/g, ':$1')
      .replace(/\\/index$/, '')
      .replace(/\\//g, '/');
      
    // 忽略已经处理的首页路由
    if (processedPath === '') return;
    
    // 存储路由信息，保留原始路径以便后续处理
    routeMap[routePath] = {
      path: processedPath === '' ? '/' : \`/\${processedPath}\`,
      component: ${isLazy ? 'pages[path]' : 'pages[path].default'},
      name: processedPath.replace(/\\//g, '-').replace(/:/g, '').replace(/^-|-$/g, '') || 'home',
      rawPath: routePath, // 保存原始路径
      originalFilePath: path // 保存原始文件路径，用于确保组件引用正确
    };
  });

  // 如果没有检测到根目录的index.vue，则添加一个默认的根路由
  if (!hasRootIndex && Object.keys(layouts).length > 0) {
    generatedRoutes.push({
      path: '/',
      redirect: '/' + Object.keys(layouts)[0]
    });
  }

  // 第二步：处理布局组件和嵌套路由
  Object.keys(routeMap).forEach(routePath => {
    const route = {...routeMap[routePath]}; // 创建副本，避免修改原始对象
    
    // 检查路由是否应该嵌套在布局组件中
    let parentFound = false;
    
    // 从最长的布局路径开始匹配，确保最深层的布局优先
    Object.keys(layouts)
      .sort((a, b) => b.length - a.length)
      .forEach(layoutPath => {
        // 如果路由路径以布局路径开头，并且不是布局路径本身
        if (routePath.startsWith(layoutPath + '/') && routePath !== layoutPath && !parentFound) {
          parentFound = true;
          
          // 确保布局路由已添加到routes数组
          let layoutRoute = generatedRoutes.find(r => {
            return r.path === '/' + layoutPath || 
                  (layoutPath === '' && r.path === '/');
          });
          
          if (!layoutRoute) {
            // 创建布局路由
            layoutRoute = {
              path: layoutPath === '' ? '/' : '/' + layoutPath,
              component: layouts[layoutPath].component,
              children: []
            };
            
            // 添加到routes数组
            generatedRoutes.push(layoutRoute);
            
            if (${verbose}) {
              console.log('[vite-plugin-convention-routes] 创建布局路由:', layoutRoute.path, '组件:', layouts[layoutPath].component ? '已加载' : '未加载');
            }
          }
          
          // 确保布局路由有children属性
          if (!layoutRoute.children) {
            layoutRoute.children = [];
          }
          
          // 将当前路由添加为布局路由的子路由
          // 调整子路由的路径，移除父路由部分
          const childPath = routePath.substring(layoutPath.length + 1);
          
          // 处理子路由路径
          // 1. 将[param]转换为:param
          // 2. 移除末尾的index
          let processedChildPath = childPath
            .replace(/\\[(\\w+)\\]/g, ':$1')
            .replace(/\\/index$/, '')
            .replace(/index$/, '');
            
          // 确保动态参数路由正确处理
          if (processedChildPath.includes('[') && processedChildPath.includes(']')) {
            processedChildPath = processedChildPath.replace(/\\[(\\w+)\\]/g, ':$1');
          }
          
          // 子路由路径不应该以斜杠开头
          route.path = processedChildPath === '' ? '' : processedChildPath;
          
          // 确保组件信息被保留
          if (!route.component && routeMap[routePath].component) {
            route.component = routeMap[routePath].component;
          } else if (!route.component && routeMap[routePath].originalFilePath) {
            // 如果组件丢失，尝试使用原始文件路径重新获取
            route.component = ${isLazy ? 
              'pages[routeMap[routePath].originalFilePath]' : 
              'pages[routeMap[routePath].originalFilePath].default'};
          }
          
          // 更新路由名称，移除冒号
          if (route.name) {
            route.name = route.name.replace(/:/g, '');
          }
          
          // 删除rawPath属性，避免Vue Router警告
          delete route.rawPath;
          
          if (${verbose}) {
            console.log('[vite-plugin-convention-routes] 添加子路由:', route.path, '到布局:', layoutRoute.path, '组件:', route.component ? '已加载' : '未加载');
          }
          
          // 最后检查确保路由有组件
          if (!route.component) {
            console.warn(\`[vite-plugin-convention-routes] 警告: 路由 \${route.path} 没有组件\`);
          }
          
          layoutRoute.children.push(route);
        }
      });
    
    // 如果没有找到父布局，则添加到顶层路由
    if (!parentFound) {
      // 删除rawPath属性，避免Vue Router警告
      delete route.rawPath;
      generatedRoutes.push(route);
    }
  });

  // 最终检查，确保所有路由都有组件
  const checkRouteComponents = (routes) => {
    routes.forEach(route => {
      // 忽略重定向路由
      if (route.redirect) return;
      
      // 检查当前路由是否有组件
      if (!route.component) {
        console.warn(\`[vite-plugin-convention-routes] 警告: 路由 \${route.path} 没有组件\`);
      }
      
      // 递归检查子路由
      if (route.children && route.children.length > 0) {
        checkRouteComponents(route.children);
      }
    });
  };
  
  // 执行检查
  checkRouteComponents(generatedRoutes);

  // 输出生成的路由配置，方便调试
  if (${verbose}) {
    // 创建一个不包含函数的路由配置副本用于日志输出
    const routesForLog = JSON.parse(JSON.stringify(generatedRoutes, (key, value) => {
      // 将组件函数转换为标记，以便在日志中显示
      if (key === 'component' && typeof value === 'function') {
        return '() => Component'; // 用字符串替代函数
      }
      return value;
    }));
    console.log('[vite-plugin-convention-routes] 生成的路由配置:', JSON.stringify(routesForLog, null, 2));
  }

  return generatedRoutes;
})())
`;

        // 保存生成的路由代码，用于生成声明文件
        routesCode = routesImportCode

        // 在路由文件中注入自动生成的路由代码
        // 使用更精确的正则表达式，确保只替换声明部分，不影响后续代码
        const routesRegex = /(const\s+routes\s*(?::\s*RouteRecordRaw\[\])?\s*=\s*)\[\s*\]/;
        if (routesRegex.test(code)) {
          return code.replace(routesRegex, (_match, p1) => {
            return p1 + routesImportCode.trim().replace(/;$/, '');
          });
        }
        return null;
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

