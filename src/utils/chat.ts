import { Conversation, ConversationTypeInfo, User } from '@/types/chat';
import { CONVERSATION_TYPE, USER_ROLE } from '@/constants/chat';

/**
 * Format time from ISO string to HH:MM format
 */
export const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
};

/**
 * Get conversation type information (icon, label, color)
 */
export const getConversationTypeInfo = (type: number): ConversationTypeInfo => {
    switch (type) {
        case CONVERSATION_TYPE.DM:
            return { icon: '👤', label: 'Direct Message', color: 'bg-blue-500' };
        case CONVERSATION_TYPE.GROUP:
            return { icon: '👥', label: 'Group Chat', color: 'bg-primary-500' };
        default:
            return { icon: '💭', label: 'Chat', color: 'bg-gray-500' };
    }
};

/**
 * Get role name from role number
 */
export const getRoleName = (role: number): string => {
    switch (role) {
        case USER_ROLE.ADMIN:
            return 'Admin';
        case USER_ROLE.MANAGER:
            return 'Manager';
        case USER_ROLE.SALES:
            return 'Sales';
        default:
            return 'User';
    }
};

/**
 * Get conversation subtitle (role for DM, type for group)
 */
export const getConversationSubtitle = (conversation: Conversation): string => {
    if (conversation.type === CONVERSATION_TYPE.DM && conversation.otherUser) {
        return getRoleName(conversation.otherUser.role);
    }
    return getConversationTypeInfo(conversation.type).label;
};

/**
 * Get last message preview
 */
export const getLastMessagePreview = (conversation: Conversation, currentUserId: number): string => {
    if (!conversation.lastMessage) {
        return 'Chưa có tin nhắn';
    }

    const isMe = conversation.lastMessage.senderId === currentUserId;
    const content = conversation.lastMessage.content;
    const truncated = content.length > 30 ? content.substring(0, 30) + '...' : content;

    return isMe ? `Bạn: ${truncated}` : truncated;
};

/**
 * Get conversation display name
 */
export const getConversationName = (conversation: Conversation): string => {
    // DM: show other user's name
    if (conversation.type === CONVERSATION_TYPE.DM && conversation.otherUser) {
        return conversation.otherUser.fullName || conversation.otherUser.email;
    }
    // Group: show title
    return conversation.title || `Conversation #${conversation.id}`;
};

/**
 * Get current user ID from JWT token
 */
export const getCurrentUserId = (): number => {
    try {
        // Only run in browser
        if (typeof window === 'undefined') return 0;

        const token = localStorage.getItem('accessToken');
        if (!token) return 0;

        // Decode JWT (simple base64 decode of payload)
        const parts = token.split('.');
        if (parts.length !== 3) return 0;

        const payload = parts[1];
        const decoded = JSON.parse(atob(payload));

        // JWT standard uses 'sub' (subject) for user ID
        return decoded.userId || decoded.id || parseInt(decoded.sub) || 0;
    } catch (error) {
        console.error('Failed to decode token:', error);
        return 0;
    }
};

/**
 * Get access token from localStorage
 */
export const getAccessToken = (): string => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('accessToken') || '';
    }
    return '';
};

/**
 * Get user initials for avatar
 */
export const getUserInitials = (user: User | { fullName?: string }): string => {
    return user.fullName?.substring(0, 1).toUpperCase() || 'U';
};
