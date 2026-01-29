import { BaseModel } from "@/types/base.model";
import { BaseResponseModel } from "@/types/base.response.model";

// =====================================================
// ENUMS
// =====================================================

export enum MessageType {
    TEXT = 1,
    IMAGE = 2,
    FILE = 3
}

// =====================================================
// RESPONSE MODEL
// =====================================================

export class ChatMessageResponseModel extends BaseResponseModel {
    roomId: number = 0;
    senderId: number = 0;
    message: string = "";
    messageType: number = MessageType.TEXT;
    attachmentId?: string | null;
    attachmentUrl?: string | null;
    isRead: boolean = false;
    readBy?: any | null;
}

// =====================================================
// CLIENT MODEL
// =====================================================

export class ChatMessageModel extends BaseModel {
    roomId: number = 0;
    senderId: number = 0;
    message: string = "";
    messageType: number = MessageType.TEXT;
    attachmentId: string | null = null;
    attachmentUrl: string | null = null;
    isRead: boolean = false;
    readBy: any | null = null;

    constructor(resModel: ChatMessageResponseModel) {
        super(resModel);
        if (resModel) {
            this.roomId = resModel.roomId;
            this.senderId = resModel.senderId;
            this.message = resModel.message;
            this.messageType = resModel.messageType;
            this.attachmentId = resModel.attachmentId || null;
            this.attachmentUrl = resModel.attachmentUrl || null;
            this.isRead = resModel.isRead;
            this.readBy = resModel.readBy || null;
        }
    }

    /**
     * Kiểm tra có attachment không
     */
    hasAttachment(): boolean {
        return !!this.attachmentId || !!this.attachmentUrl;
    }

    /**
     * Kiểm tra có phải text message không
     */
    isTextMessage(): boolean {
        return this.messageType === MessageType.TEXT;
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
     * Lấy tên loại message
     */
    getMessageTypeName(): string {
        switch (this.messageType) {
            case MessageType.TEXT:
                return "Text";
            case MessageType.IMAGE:
                return "Image";
            case MessageType.FILE:
                return "File";
            default:
                return "Unknown";
        }
    }
}
