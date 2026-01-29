import { BaseModel } from "@/types/base.model";
import { BaseResponseModel } from "@/types/base.response.model";

// =====================================================
// ENUMS
// =====================================================

export enum MessageType {
    TEXT = 1,      // Tin nhắn văn bản
    IMAGE = 2,     // Tin nhắn hình ảnh
    FILE = 3,      // Tin nhắn file đính kèm
    SYSTEM = 4     // Tin nhắn hệ thống (join, leave, etc.)
}

// =====================================================
// RESPONSE MODEL
// =====================================================

export class MessageResponseModel extends BaseResponseModel {
    conversationId: number = 0;
    senderId: number = 0;
    content: string = "";
    messageType: number = MessageType.TEXT;
    replyToId?: number | null;
    fileUrl?: string | null;
    fileName?: string | null;
    fileSize?: number | null;
    editedAt?: Date | null;
}

// =====================================================
// CLIENT MODEL
// =====================================================

export class MessageModel extends BaseModel {
    conversationId: number = 0;
    senderId: number = 0;
    content: string = "";
    messageType: number = MessageType.TEXT;
    replyToId: number | null = null;
    fileUrl: string | null = null;
    fileName: string | null = null;
    fileSize: number | null = null;
    editedAt: Date | null = null;

    constructor(resModel: MessageResponseModel) {
        super(resModel);
        if (resModel) {
            this.conversationId = resModel.conversationId;
            this.senderId = resModel.senderId;
            this.content = resModel.content;
            this.messageType = resModel.messageType;
            this.replyToId = resModel.replyToId || null;
            this.fileUrl = resModel.fileUrl || null;
            this.fileName = resModel.fileName || null;
            this.fileSize = resModel.fileSize || null;
            this.editedAt = resModel.editedAt || null;
        }
    }

    /**
     * Kiểm tra có phải text message không
     */
    isTextMessage(): boolean {
        return this.messageType === MessageType.TEXT;
    }

    /**
     * Kiểm tra có phải system message không
     */
    isSystemMessage(): boolean {
        return this.messageType === MessageType.SYSTEM;
    }

    /**
     * Kiểm tra có phải image message không
     */
    isImageMessage(): boolean {
        return this.messageType === MessageType.IMAGE;
    }

    /**
     * Kiểm tra có phải file message không
     */
    isFileMessage(): boolean {
        return this.messageType === MessageType.FILE;
    }

    /**
     * Kiểm tra có attachment không
     */
    hasAttachment(): boolean {
        return this.messageType === MessageType.IMAGE || this.messageType === MessageType.FILE;
    }

    /**
     * Kiểm tra đã được edit chưa
     */
    isEdited(): boolean {
        return this.editedAt !== null && this.editedAt !== undefined;
    }

    /**
     * Kiểm tra có phải reply không
     */
    isReply(): boolean {
        return this.replyToId !== null && this.replyToId !== undefined;
    }

    /**
     * Format file size
     */
    getFormattedFileSize(): string {
        if (!this.fileSize) return "";
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(this.fileSize) / Math.log(1024));
        return `${(this.fileSize / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
    }

    /**
     * Lấy tên loại message
     */
    getMessageTypeName(): string {
        const names: Record<number, string> = {
            [MessageType.TEXT]: "Text",
            [MessageType.IMAGE]: "Image",
            [MessageType.FILE]: "File",
            [MessageType.SYSTEM]: "System"
        };
        return names[this.messageType] || "Unknown";
    }

    /**
     * Lấy icon cho message type
     */
    getMessageTypeIcon(): string {
        switch (this.messageType) {
            case MessageType.TEXT:
                return "💬";
            case MessageType.IMAGE:
                return "🖼️";
            case MessageType.FILE:
                return "📎";
            case MessageType.SYSTEM:
                return "ℹ️";
            default:
                return "❓";
        }
    }
}
