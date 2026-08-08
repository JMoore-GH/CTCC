import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react-swc';
import { resolve } from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiUrl = env.VITE_RAYFIN_API_URL;

  // When the API URL points at a remote Fabric backend, proxy all Rayfin
  // paths through the Vite dev server to avoid CORS. The Rayfin client's
  // useProxy mode converts the absolute base URL to relative paths, so Vite
  // must forward /graphql, /api/, and /.well-known/ to the Fabric host.
  const proxyEntries: Record<string, object> = {};
  if (apiUrl) {
    try {
      const parsed = new URL(apiUrl);
      if (parsed.hostname !== 'localhost' && parsed.hostname !== '127.0.0.1') {
        const target = parsed.origin;
        // pathPrefix ends with '/', e.g. '/webapi/.../appbackends/<id>/'
        const pathPrefix = parsed.pathname.replace(/\/$/, '');
        const rewrite = (path: string) => `${pathPrefix}${path}`;
        for (const route of ['/graphql', '/api', '/.well-known']) {
          proxyEntries[route] = { target, changeOrigin: true, rewrite };
        }
      }
    } catch {
      // invalid URL — skip proxy setup
    }
  }

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': resolve(import.meta.dirname, 'src'),
      },
    },
    build: {
      target: 'es2022',
    },
    esbuild: {
      target: 'es2022',
    },
    optimizeDeps: {
      esbuildOptions: {
        target: 'es2022',
      },
    },
    server: {
      proxy: proxyEntries,
    },
  };
});
