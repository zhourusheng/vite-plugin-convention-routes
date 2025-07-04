import type { Plugin, ResolvedConfig, ModuleNode } from 'vite'
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
  
  /**
   * 路由元数据配置文件路径
   * @default 'src/router/route-meta.js'
   */
  metaConfigPath?: string

  /**
   * 是否启用组件内定义元数据
   * @default true
   */
  enableInComponentMeta?: boolean
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
    layoutName = '_layout',
    metaConfigPath = 'src/router/route-meta.js',
    enableInComponentMeta = true
  } = options

  let config: ResolvedConfig
  let routesCode = ''
  let projectRoot = ''
  let needsUpdate = false
  // 存储组件元数据的Map
  const componentMeta = new Map<string, Record<string, any>>()
  // 存储元数据配置
  let metaConfig: Record<string, any> = {}

  /**
   * 从组件代码中提取元数据
   */
  function extractMetaFromComponent(code: string): Record<string, any> | null {
    // 查找特定格式的注释块
    const metaMatch = code.match(/\/\*\s*route-meta\s*({[^*]*})\s*\*\//)
    if (metaMatch && metaMatch[1]) {
      try {
        // 解析JSON格式的元数据
        return JSON.parse(metaMatch[1])
      } catch (e) {
        console.warn('[vite-plugin-convention-routes] 解析组件元数据JSON失败:', e)
      }
    }

    // 查找导出的路由元数据对象
    const exportMatch = code.match(/export\s+const\s+routeMeta\s*=\s*({[\s\S]*?});/)
    if (exportMatch && exportMatch[1]) {
      try {
        // 提取对象字面量
        const objectStr = exportMatch[1].trim()
        
        // 使用JSON.parse尝试解析，但首先需要将JS对象字面量转换为JSON格式
        const jsonLike = objectStr
          // 将属性名的单引号替换为双引号
          .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":')
          // 将字符串值的单引号替换为双引号
          .replace(/:\s*'([^']*)'/g, ':"$1"')
          // 处理布尔值和数字，确保它们不被引号包围
          .replace(/:\s*true\b/g, ':true')
          .replace(/:\s*false\b/g, ':false')
          // 处理数组
          .replace(/:\s*\[(.*?)\]/g, (_, p1) => {
            // 如果数组内容是字符串，确保使用双引号
            return ':' + JSON.stringify(
              p1.split(',')
                .map((item: string) => item.trim().replace(/^['"]|['"]$/g, ''))
            )
          })
        
        try {
          return JSON.parse(jsonLike)
        } catch (jsonError) {
          console.warn('[vite-plugin-convention-routes] JSON解析失败，使用简单解析:', jsonError)
          
          // 回退到简单解析
          const result: Record<string, any> = {}
          const props = objectStr.match(/(\w+)\s*:\s*([^,}\r\n]+)/g) || []
          
          for (const prop of props) {
            const [key, valueStr] = prop.split(':').map(p => p.trim())
            
            if (valueStr === 'true') {
              result[key] = true
            } else if (valueStr === 'false') {
              result[key] = false
            } else if (!isNaN(Number(valueStr))) {
              result[key] = Number(valueStr)
            } else if (valueStr.startsWith("'") && valueStr.endsWith("'")) {
              result[key] = valueStr.slice(1, -1)
            } else if (valueStr.startsWith('"') && valueStr.endsWith('"')) {
              result[key] = valueStr.slice(1, -1)
            } else {
              result[key] = valueStr
            }
          }
          
          return result
        }
      } catch (e) {
        console.warn('[vite-plugin-convention-routes] 解析导出的元数据对象失败:', e)
      }
    }

    return null
  }

  // 应用元数据到路由对象
  // @ts-ignore: 在模板字符串中使用，TypeScript无法检测
  const applyMetadata = (route: any, fullPath: string): void => {
    // 确保 meta 对象存在
    route.meta = route.meta || {}
    
    // 1. 从元数据配置文件应用元数据
    if (metaConfig && metaConfig[fullPath]) {
      route.meta = {
        ...route.meta,
        ...metaConfig[fullPath]
      }
      
      if (verbose) {
        console.log('[vite-plugin-convention-routes] 从配置文件应用元数据:', fullPath);
      }
    }
    
    // 2. 如果是懒加载组件，尝试从组件应用元数据
    if (route.component && typeof route.component === 'function') {
      // 获取组件路径
      const compStr = route.component.toString()
      const importMatch = compStr.match(/import\(['"]([^'"]+)['"]\)/)
      
      if (importMatch && importMatch[1]) {
        const componentPath = importMatch[1]
        
        // 在映射中查找相关元数据
        for (const [id, meta] of componentMeta.entries()) {
          if (id.includes(componentPath)) {
            route.meta = {
              ...route.meta,
              ...meta
            }
            
            if (verbose) {
              console.log('[vite-plugin-convention-routes] 从组件应用元数据:', fullPath);
            }
            break
          }
        }
      }
    }
  }

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
      
      // 尝试加载元数据配置文件
      try {
        const metaConfigFile = path.resolve(projectRoot, metaConfigPath)
        if (fs.existsSync(metaConfigFile)) {
          try {
            // 将路径转换为file:// URL格式
            const fileUrl = new URL(`file://${metaConfigFile.replace(/\\/g, '/')}`)
            
            // 使用import()动态导入，而不是require
            import(/* @vite-ignore */ fileUrl.href).then(module => {
              metaConfig = module.default || module
              
              if (verbose) {
                console.log('[vite-plugin-convention-routes] 加载元数据配置成功:', metaConfigFile)
              }
            }).catch(error => {
              console.warn('[vite-plugin-convention-routes] 导入元数据配置文件失败:', error)
            })
          } catch (error) {
            console.warn('[vite-plugin-convention-routes] 导入元数据配置文件失败:', error)
          }
        } else if (verbose) {
          console.log('[vite-plugin-convention-routes] 元数据配置文件不存在:', metaConfigFile)
        }
      } catch (error) {
        console.error('[vite-plugin-convention-routes] 加载元数据配置失败:', error)
      }
    },

    transform(code, id) {
      // 提取Vue组件中的元数据
      if (enableInComponentMeta && id.endsWith('.vue') && id.includes(routesDir)) {
        const meta = extractMetaFromComponent(code)
        if (meta) {
          // 存储提取到的元数据，后续在生成路由时使用
          componentMeta.set(id, meta)
          if (verbose) {
            console.log('[vite-plugin-convention-routes] 从组件提取到元数据:', id, meta)
          }
        }
      }

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

  // 定义应用元数据的函数
  const applyMetadata = (route, fullPath) => {
    // 确保meta对象存在
    route.meta = route.meta || {};
    
    // 应用元数据
    const metaConfig = ${JSON.stringify(metaConfig)};
    if (metaConfig && metaConfig[fullPath]) {
      route.meta = {
        ...route.meta,
        ...metaConfig[fullPath]
      };
    }
  };

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
      
      // 应用元数据到根路由
      applyMetadata(generatedRoutes[generatedRoutes.length - 1], '/');
      
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
            
            // 应用元数据
            applyMetadata(layoutRoute, layoutRoute.path);
            
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
          
          // 应用元数据
          const fullPath = layoutRoute.path === '/' ? '/' + route.path : layoutRoute.path + '/' + route.path;
          applyMetadata(route, fullPath);
          
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
      
      // 应用元数据到路由
      applyMetadata(route, route.path);
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

    // 监听路由文件变化，发送HMR更新而非重启服务器
    configureServer(server) {
      const routesGlob = `${routesDir}/**/*.vue`
      let hmrTimeout: NodeJS.Timeout | null = null

      // 监听路由目录中的Vue文件
      server.watcher.add(routesGlob)
      
      const handleRouteChange = (file: string) => {
        if (file.includes(routesDir) && extensions.some(ext => file.endsWith(ext))) {
          if (verbose) {
            console.log('[vite-plugin-convention-routes] 检测到路由文件变化:', file)
          }
          
          // 标记需要更新，但不重启服务器
          needsUpdate = true
          
          // 防抖处理，避免多个文件同时变化导致多次刷新
          if (hmrTimeout) {
            clearTimeout(hmrTimeout)
          }
          
          hmrTimeout = setTimeout(() => {
            // 找到所有可能需要更新的模块
            const routerFiles = ['router/index.js', 'router/index.ts', 'src/router/index.js', 'src/router/index.ts']
            const routerModules: ModuleNode[] = []
            
            // 收集所有路由相关模块
            routerFiles.forEach(file => {
              const mods = server.moduleGraph.getModulesByFile(file)
              if (mods) {
                routerModules.push(...Array.from(mods))
              }
            })
            
            // 获取虚拟模块
            const virtualMods = server.moduleGraph.getModulesByFile('\0virtual:convention-routes')
            if (virtualMods) {
              routerModules.push(...Array.from(virtualMods))
            }
            
            // 查找所有导入了路由模块的模块
            const modulesToInvalidate = new Set<ModuleNode>(routerModules)
            
            // 递归查找所有引用了路由模块的模块
            const addImporters = (mod: ModuleNode) => {
              if (!mod.importers) return
              for (const importer of mod.importers) {
                if (!modulesToInvalidate.has(importer)) {
                  modulesToInvalidate.add(importer)
                  addImporters(importer)
                }
              }
            }
            
            // 对所有路由模块应用递归查找
            routerModules.forEach(mod => {
              if (mod) {
                addImporters(mod)
              }
            })
            
            if (verbose) {
              console.log(`[vite-plugin-convention-routes] 找到 ${modulesToInvalidate.size} 个需要更新的模块`)
            }
            
            // 如果找到了需要更新的模块
            if (modulesToInvalidate.size > 0) {
              // 使模块失效
              modulesToInvalidate.forEach(mod => {
                server.moduleGraph.invalidateModule(mod)
              })
              
              // 发送HMR更新
              const timestamp = Date.now()
              const updates = Array.from(modulesToInvalidate).map(mod => ({
                type: 'js-update' as const,
                path: mod.url,
                acceptedPath: mod.url,
                timestamp
              }))
              
              if (verbose) {
                console.log('[vite-plugin-convention-routes] 发送HMR更新:', updates.length)
              }
              
              // 尝试发送模块更新
              server.ws.send({
                type: 'update',
                updates
              })
              
              // 如果模块更新不成功，则进行全页面刷新
              setTimeout(() => {
                if (verbose) {
                  console.log('[vite-plugin-convention-routes] 发送全页面刷新')
                }
                
                server.ws.send({
                  type: 'full-reload',
                  path: '*'
                })
              }, 100)
            } else {
              // 没有找到相关模块，直接进行全页面刷新
              if (verbose) {
                console.log('[vite-plugin-convention-routes] 未找到相关模块，发送全页面刷新')
              }
              
              server.ws.send({
                type: 'full-reload',
                path: '*'
              })
            }
          }, 100) // 延迟100ms，等待多个文件变化合并为一次更新
        }
      }

      // 监听文件添加
      server.watcher.on('add', file => {
        handleRouteChange(file)
      })

      // 监听文件删除
      server.watcher.on('unlink', file => {
        handleRouteChange(file)
      })
      
      // 监听文件更改
      server.watcher.on('change', file => {
        handleRouteChange(file)
      })
      
      // 添加中间件，确保虚拟模块的变化也能触发热更新
      server.middlewares.use((req, _res, next) => {
        if (needsUpdate && req.url && (
            req.url.includes('router/index') || 
            req.url.includes('virtual:convention-routes')
        )) {
          needsUpdate = false
          if (verbose) {
            console.log('[vite-plugin-convention-routes] 检测到路由请求，触发更新')
          }
          handleRouteChange('virtual-trigger')
        }
        next()
      })
    }
  }
}

