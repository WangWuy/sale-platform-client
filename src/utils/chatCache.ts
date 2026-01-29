import { Message, User } from '@/types/chat';

const CACHE_KEYS = {
    MESSAGES: 'chat_messages_cache',
    USERS: 'chat_users_cache',
    USERS_TIMESTAMP: 'chat_users_timestamp',
} as const;

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Cache for conversation messages
 * Stored in memory (React state) for current session
 */
export class MessagesCache {
    private static cache = new Map<number, Message[]>();

    static get(conversationId: number): Message[] | null {
        return this.cache.get(conversationId) || null;
    }

    static set(conversationId: number, messages: Message[]): void {
        this.cache.set(conversationId, messages);
    }

    static add(conversationId: number, message: Message): void {
        const existing = this.cache.get(conversationId) || [];
        this.cache.set(conversationId, [...existing, message]);
    }

    static clear(conversationId?: number): void {
        if (conversationId) {
            this.cache.delete(conversationId);
        } else {
            this.cache.clear();
        }
    }

    static has(conversationId: number): boolean {
        return this.cache.has(conversationId);
    }
}

/**
 * Cache for users list
 * Stored in localStorage with timestamp
 */
export class UsersCache {
    static get(): User[] | null {
        try {
            const timestamp = localStorage.getItem(CACHE_KEYS.USERS_TIMESTAMP);
            if (!timestamp) return null;

            const age = Date.now() - parseInt(timestamp);
            if (age > CACHE_DURATION) {
                this.clear();
                return null;
            }

            const cached = localStorage.getItem(CACHE_KEYS.USERS);
            if (!cached) return null;

            return JSON.parse(cached);
        } catch (error) {
            console.error('Failed to get users from cache:', error);
            return null;
        }
    }

    static set(users: User[]): void {
        try {
            localStorage.setItem(CACHE_KEYS.USERS, JSON.stringify(users));
            localStorage.setItem(CACHE_KEYS.USERS_TIMESTAMP, Date.now().toString());
        } catch (error) {
            console.error('Failed to cache users:', error);
        }
    }

    static clear(): void {
        localStorage.removeItem(CACHE_KEYS.USERS);
        localStorage.removeItem(CACHE_KEYS.USERS_TIMESTAMP);
    }

    static isValid(): boolean {
        const timestamp = localStorage.getItem(CACHE_KEYS.USERS_TIMESTAMP);
        if (!timestamp) return false;

        const age = Date.now() - parseInt(timestamp);
        return age <= CACHE_DURATION;
    }
}

/**
 * Clear all chat caches
 */
export function clearAllChatCache(): void {
    MessagesCache.clear();
    UsersCache.clear();
}
