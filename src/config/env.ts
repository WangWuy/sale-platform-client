/**
 * Environment Configuration
 * Centralized configuration for environment variables
 */

export const config = {
    /**
     * API Base URL
     * Points to the main backend server
     */
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',

    /**
     * Socket URL
     * WebSocket connection for real-time features
     */
    socketUrl: process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000',

    /**
     * File Server URL
     * Points to the file storage server
     */
    fileServerUrl: process.env.NEXT_PUBLIC_FILE_SERVER_URL || 'http://localhost:3005',

    /**
     * File API URL (Legacy)
     * Legacy file API endpoint for backward compatibility
     */
    fileApiUrl: process.env.NEXT_PUBLIC_FILE_API_URL || 'http://localhost:3005/api',

    /**
     * Application Name
     */
    appName: process.env.NEXT_PUBLIC_APP_NAME || 'OvalBlueEz',

    /**
     * Application URL
     */
    appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5200',

    /**
     * Application Environment
     */
    env: process.env.NODE_ENV || 'development',

    /**
     * Enable debug mode
     */
    debug: process.env.NEXT_PUBLIC_DEBUG === 'true',
} as const;

/**
 * API endpoints helper
 */
export const endpoints = {
    auth: {
        login: `${config.apiUrl}/api/auth/login`,
        logout: `${config.apiUrl}/api/auth/logout`,
        refresh: `${config.apiUrl}/api/auth/refresh`,
        me: `${config.apiUrl}/api/users/me`,
    },
    users: {
        list: `${config.apiUrl}/api/users`,
        create: `${config.apiUrl}/api/users`,
        update: (id: number) => `${config.apiUrl}/api/users/${id}`,
        delete: (id: number) => `${config.apiUrl}/api/users/${id}`,
    },
    products: {
        list: `${config.apiUrl}/api/products`,
        create: `${config.apiUrl}/api/products`,
        update: (id: number) => `${config.apiUrl}/api/products/${id}`,
        delete: (id: number) => `${config.apiUrl}/api/products/${id}`,
    },
    files: {
        upload: `${config.fileServerUrl}/api/upload`,
    },
} as const;

/**
 * Type-safe environment variable validation
 */
export function validateEnv() {
    const required = ['NEXT_PUBLIC_API_URL'];
    const missing = required.filter(key => !process.env[key]);

    if (missing.length > 0 && config.env === 'production') {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
}
