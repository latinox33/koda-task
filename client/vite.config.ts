import { type ConfigEnv, defineConfig, loadEnv, type UserConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import UnoCSS from 'unocss/vite';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }: ConfigEnv): UserConfig => {
    const env: Record<string, string> = loadEnv(mode, path.resolve(__dirname, '../'), 'VITE_');
    const HOST = env.VITE_HOST || 'localhost';
    const PORT = parseInt(env.VITE_PORT, 10) || 5173;

    return {
        plugins: [vue(), UnoCSS()],
        define: {
            __APP_ENV__: env,
        },
        server: { host: HOST, port: PORT },
    };
});
