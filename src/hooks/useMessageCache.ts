import { useState, useCallback } from 'react';
import { Message } from '@/types/chat';

/**
 * Custom hook to manage message caching for conversations
 * Stores messages in memory for the current session
 */
export function useMessageCache() {
    const [cache, setCache] = useState<Map<number, Message[]>>(new Map());

    const getCachedMessages = useCallback((conversationId: number): Message[] | null => {
        return cache.get(conversationId) || null;
    }, [cache]);

    const setCachedMessages = useCallback((conversationId: number, messages: Message[]) => {
        setCache(prev => {
            const newCache = new Map(prev);
            newCache.set(conversationId, messages);
            return newCache;
        });
    }, []);

    const addMessage = useCallback((conversationId: number, message: Message) => {
        setCache(prev => {
            const newCache = new Map(prev);
            const existing = newCache.get(conversationId) || [];
            newCache.set(conversationId, [...existing, message]);
            return newCache;
        });
    }, []);

    const clearCache = useCallback((conversationId?: number) => {
        if (conversationId) {
            setCache(prev => {
                const newCache = new Map(prev);
                newCache.delete(conversationId);
                return newCache;
            });
        } else {
            setCache(new Map());
        }
    }, []);

    const hasCache = useCallback((conversationId: number): boolean => {
        return cache.has(conversationId);
    }, [cache]);

    return {
        getCachedMessages,
        setCachedMessages,
        addMessage,
        clearCache,
        hasCache
    };
}
