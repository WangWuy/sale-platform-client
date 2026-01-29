import { config } from '@/config/env';

export const SOCKET_URL = config.socketUrl;

export const CONVERSATION_TYPE = {
    DM: 1,
    GROUP: 2,
} as const;

export const MESSAGE_TYPE = {
    TEXT: 1,
    FILE: 2,
} as const;

export const USER_ROLE = {
    ADMIN: 1,
    MANAGER: 2,
    SALES: 3,
} as const;

export const TYPING_TIMEOUT = 2000; // 2 seconds
export const SEARCH_DEBOUNCE_DELAY = 300; // 300ms
