import { BaseModel } from "@/types/base.model";
import { BaseResponseModel } from "@/types/base.response.model";

// =====================================================
// ENUMS
// =====================================================

export enum ChatRoomType {
    GENERAL = 1,
    QUOTE = 2,
    PRODUCT = 3
}

// =====================================================
// RESPONSE MODEL
// =====================================================

export class ChatRoomResponseModel extends BaseResponseModel {
    name: string = "";
    type: number = ChatRoomType.GENERAL;
    referenceId?: number | null;
    referenceType?: string | null;
    createdBy: number = 0;
}

// =====================================================
// CLIENT MODEL
// =====================================================

export class ChatRoomModel extends BaseModel {
    name: string = "";
    type: number = ChatRoomType.GENERAL;
    referenceId: number | null = null;
    referenceType: string | null = null;
    createdBy: number = 0;

    constructor(resModel: ChatRoomResponseModel) {
        super(resModel);
        if (resModel) {
            this.name = resModel.name;
            this.type = resModel.type;
            this.referenceId = resModel.referenceId || null;
            this.referenceType = resModel.referenceType || null;
            this.createdBy = resModel.createdBy;
        }
    }

    /**
     * Kiểm tra có phải general room không
     */
    isGeneral(): boolean {
        return this.type === ChatRoomType.GENERAL;
    }

    /**
     * Kiểm tra có phải quote room không
     */
    isQuoteRoom(): boolean {
        return this.type === ChatRoomType.QUOTE;
    }

    /**
     * Kiểm tra có phải product room không
     */
    isProductRoom(): boolean {
        return this.type === ChatRoomType.PRODUCT;
    }

    /**
     * Lấy tên loại room
     */
    getRoomTypeName(): string {
        switch (this.type) {
            case ChatRoomType.GENERAL:
                return "General";
            case ChatRoomType.QUOTE:
                return "Quote";
            case ChatRoomType.PRODUCT:
                return "Product";
            default:
                return "Unknown";
        }
    }

    /**
     * Lấy icon cho room type
     */
    getRoomTypeIcon(): string {
        switch (this.type) {
            case ChatRoomType.GENERAL:
                return "💬";
            case ChatRoomType.QUOTE:
                return "📋";
            case ChatRoomType.PRODUCT:
                return "📦";
            default:
                return "❓";
        }
    }
}
