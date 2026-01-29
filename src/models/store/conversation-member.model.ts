import { BaseModel } from "@/types/base.model";
import { BaseResponseModel } from "@/types/base.response.model";

// =====================================================
// ENUMS
// =====================================================

export enum ConversationMemberRole {
    ADMIN = 1,   // Quản trị viên group
    MEMBER = 2   // Thành viên thường
}

// =====================================================
// RESPONSE MODEL
// =====================================================

export class ConversationMemberResponseModel extends BaseResponseModel {
    conversationId: number = 0;
    userId: number = 0;
    role: number = ConversationMemberRole.MEMBER;
    nickname?: string | null;
    joinedAt: Date = new Date();
    lastReadAt?: Date | null;
    isNotificationMuted: boolean = false;
}

// =====================================================
// CLIENT MODEL
// =====================================================

export class ConversationMemberModel extends BaseModel {
    conversationId: number = 0;
    userId: number = 0;
    role: number = ConversationMemberRole.MEMBER;
    nickname: string | null = null;
    joinedAt: Date = new Date();
    lastReadAt: Date | null = null;
    isNotificationMuted: boolean = false;

    constructor(resModel: ConversationMemberResponseModel) {
        super(resModel);
        if (resModel) {
            this.conversationId = resModel.conversationId;
            this.userId = resModel.userId;
            this.role = resModel.role;
            this.nickname = resModel.nickname || null;
            this.joinedAt = resModel.joinedAt;
            this.lastReadAt = resModel.lastReadAt || null;
            this.isNotificationMuted = resModel.isNotificationMuted;
        }
    }

    /**
     * Kiểm tra có phải admin không
     */
    isAdmin(): boolean {
        return this.role === ConversationMemberRole.ADMIN;
    }

    /**
     * Kiểm tra có phải member không
     */
    isMember(): boolean {
        return this.role === ConversationMemberRole.MEMBER;
    }

    /**
     * Kiểm tra có tin nhắn chưa đọc không
     */
    hasUnreadMessages(latestMessageTime: Date): boolean {
        if (!this.lastReadAt) return true;
        return new Date(this.lastReadAt) < new Date(latestMessageTime);
    }

    /**
     * Lấy tên role
     */
    getRoleName(): string {
        return this.isAdmin() ? "Admin" : "Member";
    }

    /**
     * Lấy display name (nickname hoặc role)
     */
    getDisplayName(userName?: string): string {
        if (this.nickname) return this.nickname;
        if (userName) return userName;
        return this.getRoleName();
    }
}
