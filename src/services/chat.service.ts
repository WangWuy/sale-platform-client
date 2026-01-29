import apiServer from '@/lib/api';
import { ApiResponse } from '@/types/api-response.model';
import { User } from '@/types/chat';

// =====================================================
// Type Definitions
// =====================================================

export interface CreateConversationRequest {
    type: number;
    targetUserId?: number;
    title?: string;
    participantIds?: number[];
}

export interface CreateConversationResponse {
    id: number;
    type: number;
    title: string | null;
    avatarUrl: string | null;
    creatorId: number;
    createdAt: string;
}

export interface SearchUsersResponse {
    data: User[];
}

export interface GetAllUsersResponse {
    data: User[];
}

// =====================================================
// Chat API Service
// =====================================================

export const chatApi = {
    /**
     * GET /api/users?search={query}&limit={limit}
     * Search users for direct message
     */
    async searchUsers(query: string, limit: number = 20): Promise<User[]> {
        if (!query.trim()) {
            return [];
        }

        try {
            const response = await apiServer.get<ApiResponse<User[]>>(
                `/users?limit=${limit}&search=${encodeURIComponent(query)}`
            );
            return response.data.data || [];
        } catch (error) {
            console.error('Failed to search users:', error);
            return [];
        }
    },

    /**
     * GET /api/users?limit={limit}
     * Get all users for contacts list
     */
    async getAllUsers(limit: number = 100): Promise<User[]> {
        try {
            const response = await apiServer.get<ApiResponse<User[]>>(
                `/users?limit=${limit}`
            );
            return response.data.data || [];
        } catch (error) {
            console.error('Failed to fetch users:', error);
            return [];
        }
    },

    /**
     * POST /api/conversations
     * Create a new conversation (DM or Group)
     */
    async createConversation(data: CreateConversationRequest): Promise<CreateConversationResponse> {
        try {
            const response = await apiServer.post<ApiResponse<CreateConversationResponse>>(
                '/conversations',
                data
            );

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            throw new Error('Failed to create conversation');
        } catch (error) {
            console.error('Failed to create conversation:', error);
            throw error;
        }
    },

    /**
     * POST /api/conversations (type: 1 - DM)
     * Create a direct message conversation with a user
     */
    async startDirectMessage(targetUserId: number): Promise<CreateConversationResponse> {
        return this.createConversation({
            type: 1, // DM
            targetUserId
        });
    },

    /**
     * POST /api/conversations (type: 2 - GROUP)
     * Create a group conversation
     */
    async createGroupConversation(title: string, participantIds: number[]): Promise<CreateConversationResponse> {
        return this.createConversation({
            type: 2, // GROUP
            title,
            participantIds
        });
    },
};

// =====================================================
// Legacy Exports (for backward compatibility)
// =====================================================

/**
 * @deprecated Use chatApi.searchUsers() instead
 */
export const searchUsers = chatApi.searchUsers.bind(chatApi);

/**
 * @deprecated Use chatApi.getAllUsers() instead
 */
export const getAllUsers = chatApi.getAllUsers.bind(chatApi);

/**
 * @deprecated Use chatApi.createConversation() instead
 */
export const createConversation = chatApi.createConversation.bind(chatApi);

/**
 * @deprecated Use chatApi.startDirectMessage() instead
 */
export const startDirectMessage = chatApi.startDirectMessage.bind(chatApi);

/**
 * @deprecated Use chatApi.createGroupConversation() instead
 */
export const createGroupConversation = chatApi.createGroupConversation.bind(chatApi);

export default chatApi;
