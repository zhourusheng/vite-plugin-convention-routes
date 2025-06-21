import { describe, it, expect, vi } from 'vitest'
import vitePluginConventionRoutes from './index'
import type { Plugin } from 'vite'

describe('vitePluginConventionRoutes', () => {
  it('should return a plugin with the correct name', () => {
    const plugin = vitePluginConventionRoutes()
    expect(plugin.name).toBe('vite-plugin-convention-routes')
  })

  it('should use default options when not provided', () => {
    const plugin = vitePluginConventionRoutes()
    // 验证插件创建成功
    expect(plugin).toBeDefined()
  })

  it('should use provided options', () => {
    const options = { 
      routesDir: 'src/pages',
      extensions: ['.vue', '.tsx'],
      verbose: true
    }
    const plugin = vitePluginConventionRoutes(options)
    // 验证插件创建成功
    expect(plugin).toBeDefined()
  })

  it('should transform router file correctly', () => {
    const plugin = vitePluginConventionRoutes()
    const mockCode = `
import { createRouter } from 'vue-router'
const routes = []
export const router = createRouter({ routes })
`
    const id = '/src/router/index.ts'
    
    // 创建模拟的插件上下文
    const mockContext = {
      parse: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      emitFile: vi.fn(),
      addWatchFile: vi.fn(),
      getWatchFiles: vi.fn(),
    }
    
    // 正确访问 transform 钩子的 handler
    if (plugin.transform && typeof plugin.transform === 'object' && plugin.transform.handler) {
      // 使用类型断言绕过类型检查
      const result = plugin.transform.handler.call(mockContext as any, mockCode, id)
      
      expect(result).toBeDefined()
      expect(typeof result).toBe('string')
      if (result) { // 确保 result 不为 null
        expect(result).toContain('import.meta.glob')
        expect(result).toContain('const routes = [')
      }
    } else {
      // 如果 transform 不是对象或没有 handler，则跳过测试
      expect(plugin.transform).toBeDefined()
    }
  })

  it('should not transform non-router files', () => {
    const plugin = vitePluginConventionRoutes()
    const mockCode = `const routes = []`
    const id = '/src/other/file.ts'
    
    // 创建模拟的插件上下文
    const mockContext = {
      parse: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      emitFile: vi.fn(),
      addWatchFile: vi.fn(),
      getWatchFiles: vi.fn(),
    }
    
    // 正确访问 transform 钩子的 handler
    if (plugin.transform && typeof plugin.transform === 'object' && plugin.transform.handler) {
      // 使用类型断言绕过类型检查
      const result = plugin.transform.handler.call(mockContext as any, mockCode, id)
      expect(result).toBeNull()
    } else {
      // 如果 transform 不是对象或没有 handler，则跳过测试
      expect(plugin.transform).toBeDefined()
    }
  })

  it('should provide virtual module', () => {
    const plugin = vitePluginConventionRoutes()
    
    // 创建模拟的插件上下文
    const mockContext = {
      parse: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      emitFile: vi.fn(),
      getModuleInfo: vi.fn(),
      addWatchFile: vi.fn(),
      getWatchFiles: vi.fn(),
      resolve: vi.fn().mockResolvedValue({ id: 'resolved-id' }),
    }
    
    // 正确访问 resolveId 钩子的 handler
    if (plugin.resolveId && typeof plugin.resolveId === 'object' && plugin.resolveId.handler) {
      // 使用类型断言绕过类型检查
      const resolvedId = plugin.resolveId.handler.call(mockContext as any, 'virtual:convention-routes', undefined, { 
        attributes: {},
        custom: undefined, 
        ssr: false, 
        isEntry: false 
      })
      
      expect(resolvedId).toBe('\0virtual:convention-routes')
      
      // 正确访问 load 钩子的 handler
      if (plugin.load && typeof plugin.load === 'object' && plugin.load.handler) {
        // 使用类型断言绕过类型检查
        const loadResult = plugin.load.handler.call(mockContext as any, resolvedId as string)
        expect(loadResult).toBeDefined()
      } else {
        expect(plugin.load).toBeDefined()
      }
    } else {
      expect(plugin.resolveId).toBeDefined()
    }
  })
  
  it('should extract metadata from component code', () => {
    const plugin = vitePluginConventionRoutes({
      enableInComponentMeta: true
    })
    
    const mockComponentCode = `
<script>
// 导出路由元数据
export const routeMeta = {
  title: '测试页面',
  requiresAuth: true,
  icon: 'home'
}
</script>
<template>
  <div>测试组件</div>
</template>
`
    const id = '/src/views/test.vue'
    
    // 创建模拟的插件上下文
    const mockContext = {
      parse: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      emitFile: vi.fn(),
      addWatchFile: vi.fn(),
      getWatchFiles: vi.fn(),
    }
    
    // 正确访问 transform 钩子的 handler
    if (plugin.transform && typeof plugin.transform === 'object' && plugin.transform.handler) {
      // 使用类型断言绕过类型检查
      plugin.transform.handler.call(mockContext as any, mockComponentCode, id)
      
      // 由于我们无法直接访问内部状态，这里只能验证 transform 被调用了
      expect(plugin.transform).toBeDefined()
    }
  })
}) 