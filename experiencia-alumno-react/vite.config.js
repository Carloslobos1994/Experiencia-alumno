import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { playwright } from '@vitest/browser-playwright'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    include: ['src/**/*.test.{js,jsx}'],
    clearMocks: true,
    browser: {
      enabled: false,
      name: 'chromium',
      provider: playwright(),
      headless: true,
    },
    // Cobertura de codigo (npm run coverage): sentencias, ramas, funciones y lineas.
    // Reporte HTML en coverage/index.html
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json-summary'],
      include: ['src/**/*.{js,jsx}'],
      exclude: ['src/main.jsx', 'src/test/**', 'src/**/*.test.{js,jsx}', 'src/data/**'],
      // Umbrales minimos para la logica critica (sesion, permisos, validaciones, API)
      thresholds: {
        'src/utils/**': { statements: 90, branches: 75, functions: 90, lines: 90 },
        'src/routes/**': { statements: 90, branches: 75, functions: 90, lines: 90 },
      },
    },
  },
})
