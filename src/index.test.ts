import { describe, it, expect, vi } from 'vitest'
import vitePluginConventionRoutes from './index'

describe('vitePluginConventionRoutes', () => {
  it('should return a plugin with the correct name', () => {
    const plugin = vitePluginConventionRoutes()
    expect(plugin.name).toBe('vite-plugin-convention-routes')
  })

  it('should use default options when not provided', () => {
    const plugin = vitePluginConventionRoutes()
    // 实现测试逻辑
    expect(plugin).toBeDefined()
  })

  it('should use provided options', () => {
    const options = { 
      routesDir: 'src/pages',
      extensions: ['.vue', '.tsx'],
      verbose: true
    }
    const plugin = vitePluginConventionRoutes(options)
    // 实现测试逻辑
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
    const result = plugin.transform?.(mockCode, id)
    
    expect(result).toBeDefined()
    expect(typeof result).toBe('string')
    expect(result).toContain('import.meta.glob')
    expect(result).toContain('const routes = [')
  })

  it('should not transform non-router files', () => {
    const plugin = vitePluginConventionRoutes()
    const mockCode = `const routes = []`
    const id = '/src/other/file.ts'
    const result = plugin.transform?.(mockCode, id)
    
    expect(result).toBeNull()
  })

  it('should provide virtual module', () => {
    const plugin = vitePluginConventionRoutes()
    const resolvedId = plugin.resolveId?.('virtual:convention-routes')
    
    expect(resolvedId).toBe('\0virtual:convention-routes')
    
    const loadResult = plugin.load?.(resolvedId as string)
    expect(loadResult).toBeDefined()
  })
}) 