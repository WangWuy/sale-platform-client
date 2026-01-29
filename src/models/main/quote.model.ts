import { BaseModel } from "@/types/base.model";
import { BaseResponseModel } from "@/types/base.response.model";

// =====================================================
// ENUMS
// =====================================================

export enum QuoteStatus {
    DRAFT = 1,
    SENT = 2,
    ACCEPTED = 3,
    REJECTED = 4,
    EXPIRED = 5
}

// =====================================================
// RESPONSE MODEL
// =====================================================

export class QuoteResponseModel extends BaseResponseModel {
    code: string = "";
    customerName?: string | null;
    customerPhone?: string | null;
    customerEmail?: string | null;
    totalAmount: number = 0;
    discount: number = 0;
    finalAmount: number = 0;
    status: number = QuoteStatus.DRAFT;
    validUntil?: Date | null;
    notes?: string | null;
    internalNotes?: string | null;
    createdBy: number = 0;
    updatedBy?: number | null;
    sentAt?: Date | null;
}

// =====================================================
// CLIENT MODEL
// =====================================================

export class QuoteModel extends BaseModel {
    code: string = "";
    customerName: string | null = null;
    customerPhone: string | null = null;
    customerEmail: string | null = null;
    totalAmount: number = 0;
    discount: number = 0;
    finalAmount: number = 0;
    status: number = QuoteStatus.DRAFT;
    validUntil: Date | null = null;
    notes: string | null = null;
    internalNotes: string | null = null;
    createdBy: number = 0;
    updatedBy: number | null = null;
    sentAt: Date | null = null;

    constructor(resModel: QuoteResponseModel) {
        super(resModel);
        if (resModel) {
            this.code = resModel.code;
            this.customerName = resModel.customerName || null;
            this.customerPhone = resModel.customerPhone || null;
            this.customerEmail = resModel.customerEmail || null;
            this.totalAmount = resModel.totalAmount;
            this.discount = resModel.discount;
            this.finalAmount = resModel.finalAmount;
            this.status = resModel.status;
            this.validUntil = resModel.validUntil || null;
            this.notes = resModel.notes || null;
            this.internalNotes = resModel.internalNotes || null;
            this.createdBy = resModel.createdBy;
            this.updatedBy = resModel.updatedBy || null;
            this.sentAt = resModel.sentAt || null;
        }
    }

    /**
     * Kiểm tra có phải draft không
     */
    isDraft(): boolean {
        return this.status === QuoteStatus.DRAFT;
    }

    /**
     * Kiểm tra đã gửi chưa
     */
    isSent(): boolean {
        return this.status === QuoteStatus.SENT;
    }

    /**
     * Kiểm tra đã chấp nhận chưa
     */
    isAccepted(): boolean {
        return this.status === QuoteStatus.ACCEPTED;
    }

    /**
     * Kiểm tra đã từ chối chưa
     */
    isRejected(): boolean {
        return this.status === QuoteStatus.REJECTED;
    }

    /**
     * Kiểm tra đã hết hạn chưa
     */
    isExpired(): boolean {
        if (this.status === QuoteStatus.EXPIRED) return true;
        if (!this.validUntil) return false;
        return new Date() > new Date(this.validUntil);
    }

    /**
     * Lấy tên status
     */
    getStatusName(): string {
        const names: Record<number, string> = {
            [QuoteStatus.DRAFT]: "Nháp",
            [QuoteStatus.SENT]: "Đã gửi",
            [QuoteStatus.ACCEPTED]: "Chấp nhận",
            [QuoteStatus.REJECTED]: "Từ chối",
            [QuoteStatus.EXPIRED]: "Hết hạn"
        };
        return names[this.status] || "Unknown";
    }

    /**
     * Lấy màu badge cho status
     */
    getStatusColor(): string {
        switch (this.status) {
            case QuoteStatus.DRAFT:
                return "default";
            case QuoteStatus.SENT:
                return "info";
            case QuoteStatus.ACCEPTED:
                return "success";
            case QuoteStatus.REJECTED:
                return "error";
            case QuoteStatus.EXPIRED:
                return "warning";
            default:
                return "default";
        }
    }

    /**
     * Format giá tiền
     */
    formatPrice(price: number): string {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND"
        }).format(price);
    }

    /**
     * Lấy tên khách hàng hoặc email
     */
    getCustomerDisplay(): string {
        return this.customerName || this.customerEmail || this.customerPhone || "N/A";
    }

    /**
     * Tính % discount
     */
    getDiscountPercentage(): number {
        if (this.totalAmount === 0) return 0;
        return Math.round((this.discount / this.totalAmount) * 100);
    }

    /**
     * Kiểm tra còn bao nhiêu ngày hết hạn
     */
    getDaysUntilExpiry(): number | null {
        if (!this.validUntil) return null;
        const now = new Date();
        const expiry = new Date(this.validUntil);
        const diffTime = expiry.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }
}
