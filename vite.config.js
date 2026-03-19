import { defineConfig } from 'vite';

export default defineConfig({
  // Geolonia Maps / GeonicDB SDK は外部CDNから読み込むため、
  // Vite のビルド対象外とする
  build: {
    rollupOptions: {
      external: ['geolonia', 'GeonicDB'],
    },
  },
});
