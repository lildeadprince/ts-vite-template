import path from 'node:path';
import { defineConfig } from 'vite';
import viteBasicSslPlugin from '@vitejs/plugin-basic-ssl';
import { VitePWA } from 'vite-plugin-pwa';

import packageJson from './package.json';
import tsconfigJson from './tsconfig.json';

export default defineConfig({
  server: {
    https: true,
    open: false,
    proxy: {
      // '/api': {
      //   target: 'http://localhost:8000/api',
      //   changeOrigin: true,
      //   secure: false,
      //   xfwd: true,
      // }
    },
  },

  preview: {
    https: true,
  },

  plugins: [
    viteBasicSslPlugin(),
    VitePWA({
      strategies: 'injectManifest',
      filename: './service-worker.js',
      includeAssets: [],
      injectManifest: {
        globPatterns: ['index.html', 'assets/*.js', 'assets/*.css'],
      },
      manifest: {
        name: packageJson.name,
        short_name: packageJson.name,
        id: packageJson.name,
        background_color: '#ffffff',
        dir: 'ltr',
        theme_color: '#000000',
      },
    }),
  ],

  resolve: {
    alias: resolveTsconfigPaths(tsconfigJson.compilerOptions.paths),
  },
});

function resolveTsconfigPaths(tsconfigJsonPaths) {
  return Object.fromEntries(
    Object.entries(tsconfigJsonPaths).map(([pathAlias, paths]) => {
      if (paths.length !== 1) {
        throw new Error(
          'Should have one path entry per alias in tsconfig.json for proper matching into VIte.js/Rollup',
        );
      } else {
        return [pathAlias, path.resolve(__dirname, paths[0])];
      }
    }),
  );
}
