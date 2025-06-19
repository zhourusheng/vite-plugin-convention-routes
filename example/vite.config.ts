import { defineConfig, PluginOption } from 'vite'
import vue from '@vitejs/plugin-vue'
import conventionRoutes from '../src'

export default defineConfig({
  plugins: [
    vue(),
    conventionRoutes({
      routesDir: 'src/views',
      verbose: true
    }) as PluginOption
  ]
})
