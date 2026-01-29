import { BaseModel } from "@/types/base.model";
import { BaseResponseModel } from "@/types/base.response.model";

// =====================================================
// ENUMS
// =====================================================

export enum ConversationType {
    DM = 1,      // Direct Message (1-1)
    GROUP = 2    // Group chat
}

// =====================================================
// RESPONSE MODEL
// =====================================================

export class ConversationResponseModel extends BaseResponseModel {
    type: number = ConversationType.DM;
    title?: string | null;
    avatarUrl?: string | null;
    creatorId: number = 0;
}

// =====================================================
// CLIENT MODEL
// =====================================================

export class ConversationModel extends BaseModel {
    type: number = ConversationType.DM;
    title: string | null = null;
    avatarUrl: string | null = null;
    creatorId: number = 0;

    constructor(resModel: ConversationResponseModel) {
        super(resModel);
        if (resModel) {
            this.type = resModel.type;
            this.title = resModel.title || null;
            this.avatarUrl = resModel.avatarUrl || null;
            this.creatorId = resModel.creatorId;
        }
    }

    /**
     * Kiểm tra có phải DM không
     */
    isDM(): boolean {
        return this.type === ConversationType.DM;
    }

    /**
     * Kiểm tra có phải group không
     */
    isGroup(): boolean {
        return this.type === ConversationType.GROUP;
    }

    /**
     * Lấy display name
     */
    getDisplayName(): string {
        if (this.title) return this.title;
        return this.isDM() ? "Direct Message" : "Group Chat";
    }

    /**
     * Lấy tên loại conversation
     */
    getTypeName(): string {
        return this.isDM() ? "DM" : "Group";
    }
}
