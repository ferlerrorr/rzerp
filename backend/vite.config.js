import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import tailwindcss from '@tailwindcss/vite';

// Environment configuration
// Local frontend: http://localhost:5173
// Staging frontend: https://rz-erp.socia-dev.com
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.js'],
            refresh: true,
        }),
        tailwindcss(),
    ],
    server: {
        // Configure CORS for the frontend URL
        cors: {
            origin: FRONTEND_URL,
            credentials: true,
        },
    },
});
