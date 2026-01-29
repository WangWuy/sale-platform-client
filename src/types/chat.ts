export interface Message {
    id: number;
    conversationId: number;
    senderId: number;
    senderName: string;
    content: string;
    messageType: number;
    replyToId?: number | null;
    fileUrl?: string | null;
    fileName?: string | null;
    fileSize?: number | null;
    editedAt?: string | null;
    createdAt: string;
}

export interface Conversation {
    id: number;
    type: number; // 1=DM, 2=GROUP
    title: string | null;
    avatarUrl: string | null;
    creatorId: number;
    createdAt: string;
    unreadCount?: number;
    otherUser?: {
        id: number;
        fullName: string;
        email: string;
        avatarUrl?: string;
        role: number;
    };
    lastMessage?: {
        id: number;
        senderId: number;
        content: string;
        createdAt: string;
    };
}

export interface TypingUser {
    userId: number;
    userName: string;
}

export interface User {
    id: number;
    fullName: string;
    email: string;
    avatarUrl?: string;
    role: number;
}

export type ChatTab = 'messages' | 'contacts';

export interface ConversationTypeInfo {
    icon: string;
    label: string;
    color: string;
}
