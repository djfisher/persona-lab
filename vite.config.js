import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import obfuscator from 'vite-plugin-javascript-obfuscator'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    obfuscator({
      include: [/\.jsx?$/, /\.tsx?$/],
      exclude: [/node_modules/],
      apply: 'build', // Only obfuscate on build
      options: {
        compact: true,
        controlFlowFlattening: false, // Disabling this massively speeds up builds
        deadCodeInjection: false,     // Disabling this massively speeds up builds
        debugProtection: false,       // Disabling this prevents infinite spinning/freezing in React
        debugProtectionInterval: 0,
        disableConsoleOutput: false,
        identifierNamesGenerator: 'hexadecimal',
        log: false,
        renameGlobals: false,
        rotateStringArray: true,
        selfDefending: false,         // Disabling this speeds up builds and prevents some infinite loops
        shuffleStringArray: true,
        splitStrings: false,          // Disabling this prevents huge performance hits on large strings
        stringArray: true,
        stringArrayEncoding: ['base64'],
        stringArrayIndexShift: true,
        stringArrayRotate: true,
        stringArrayShuffle: true,
        stringArrayWrappersCount: 1,
        stringArrayWrappersChainedCalls: false, // Disabling this prevents infinite loops in React
        stringArrayWrappersParametersMaxCount: 2,
        stringArrayWrappersType: 'variable',
        stringArrayThreshold: 0.8,
        transformObjectKeys: false,   // Disabling this prevents React/Vite chunking errors
        unicodeEscapeSequence: false
      }
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@react-pdf')) {
              return 'pdf-vendor';
            }
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            return 'vendor'; // all other node_modules
          }
        }
      }
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
})
