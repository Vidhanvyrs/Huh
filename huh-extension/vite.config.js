import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
    plugins: [react()],
    root: 'public',
    build: {
        outDir: resolve(__dirname, 'dist'),
        emptyOutDir: true,
        rollupOptions: {
            input: {
                popup: resolve(__dirname, 'public/popup.html'),
            },
            output: {
                entryFileNames: '[name].js',
                chunkFileNames: '[name].js',
                assetFileNames: '[name].[ext]',
            },
        },
        // Chrome extensions need relative paths, not absolute
        base: './',
        target: 'esnext',
        minify: false,
    },
    // Resolve source files relative to project root, not public
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'),
        },
    },
});
