import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  build: {
    target: 'esnext',
    cssCodeSplit: true,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('gsap') || id.includes('lenis')) {
              return 'animations';
            }
            if (id.includes('framer-motion')) {
              return 'framer-motion';
            }
            if (id.includes('lucide-react') || id.includes('react-icons')) {
              return 'icons';
            }
            // Three.js and its ecosystem were previously bundled into the single 1.19MB
            // `vendor` chunk together with React. That forced the browser to download and
            // parse the entire 3D stack before React could even boot. Splitting them lets the
            // browser fetch both in parallel and lets the React chunk execute as soon as it
            // arrives, without waiting on ~800KB of 3D code it does not need yet.
            // NOTE: order matters — three-stdlib / @react-three must be tested before the
            // bare 'three' check, since their paths also contain "three".
            if (
              id.includes('three-stdlib') ||
              id.includes('@react-three') ||
              id.includes('@monogrid') ||
              id.includes('/three/') ||
              id.includes('\\three\\')
            ) {
              return 'three';
            }
            return 'vendor';
          }
        },
      },
    },
  },
})
