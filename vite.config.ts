import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

const CHUNK_GROUPS = {
  react: ['/node_modules/react/', '/node_modules/react-dom/'],
  tanstack: [
    '/node_modules/@tanstack/react-query/',
    '/node_modules/@tanstack/react-router/',
    '/node_modules/@tanstack/react-virtual/',
  ],
} as const;

const resolveVendorChunk = (id: string): string | undefined => {
  if (!id.includes('/node_modules/')) {
    return undefined;
  }

  for (const [chunkName, patterns] of Object.entries(CHUNK_GROUPS)) {
    if (patterns.some((pattern) => id.includes(pattern))) {
      return chunkName;
    }
  }

  return undefined;
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: resolveVendorChunk,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
  },
});
