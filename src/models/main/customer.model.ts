import { BaseModel } from "@/types/base.model";
import { BaseResponseModel } from "@/types/base.response.model";

// =====================================================
// ENUMS
// =====================================================

export enum CustomerType {
    RETAIL = 1,       // Khách lẻ
    WHOLESALE = 2,    // Khách sỉ
    VIP = 3,          // VIP
    PARTNER = 4       // Đối tác
}

// =====================================================
// RESPONSE MODEL
// =====================================================

export class CustomerResponseModel extends BaseResponseModel {
    code: string = "";
    name: string = "";
    phone?: string | null;
    email?: string | null;
    address?: string | null;
    customerType: CustomerType = CustomerType.RETAIL;
    taxCode?: string | null;
    contactPerson?: string | null;
    notes?: string | null;
    creditLimit?: number | null;
    currentDebt?: number | null;
    totalPurchases: number = 0;
    totalOrders: number = 0;
    isActive: boolean = true;
}

// =====================================================
// CLIENT MODEL
// =====================================================

export class CustomerModel extends BaseModel {
    code: string = "";
    name: string = "";
    phone: string | null = null;
    email: string | null = null;
    address: string | null = null;
    customerType: CustomerType = CustomerType.RETAIL;
    taxCode: string | null = null;
    contactPerson: string | null = null;
    notes: string | null = null;
    creditLimit: number | null = null;
    currentDebt: number | null = null;
    totalPurchases: number = 0;
    totalOrders: number = 0;
    isActive: boolean = true;

    constructor(resModel: CustomerResponseModel) {
        super(resModel);
        if (resModel) {
            this.code = resModel.code;
            this.name = resModel.name;
            this.phone = resModel.phone || null;
            this.email = resModel.email || null;
            this.address = resModel.address || null;
            this.customerType = resModel.customerType;
            this.taxCode = resModel.taxCode || null;
            this.contactPerson = resModel.contactPerson || null;
            this.notes = resModel.notes || null;
            this.creditLimit = resModel.creditLimit || null;
            this.currentDebt = resModel.currentDebt || null;
            this.totalPurchases = resModel.totalPurchases || 0;
            this.totalOrders = resModel.totalOrders || 0;
            this.isActive = resModel.isActive;
        }
    }

    /**
     * Lấy tên loại khách hàng
     */
    getTypeName(): string {
        const names: Record<CustomerType, string> = {
            [CustomerType.RETAIL]: "Khách lẻ",
            [CustomerType.WHOLESALE]: "Khách sỉ",
            [CustomerType.VIP]: "VIP",
            [CustomerType.PARTNER]: "Đối tác"
        };
        return names[this.customerType] || "Unknown";
    }

    /**
     * Lấy màu badge cho loại khách hàng
     */
    getTypeColor(): string {
        switch (this.customerType) {
            case CustomerType.RETAIL:
                return "default";
            case CustomerType.WHOLESALE:
                return "primary";
            case CustomerType.VIP:
                return "warning";
            case CustomerType.PARTNER:
                return "success";
            default:
                return "default";
        }
    }

    /**
     * Format số tiền
     */
    formatCurrency(amount: number): string {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND"
        }).format(amount);
    }

    /**
     * Kiểm tra có debt không
     */
    hasDebt(): boolean {
        return (this.currentDebt || 0) > 0;
    }

    /**
     * Kiểm tra còn hạn mức tín dụng
     */
    hasAvailableCredit(): boolean {
        if (!this.creditLimit) return true;
        return (this.currentDebt || 0) < this.creditLimit;
    }

    /**
     * Lấy hạn mức tín dụng còn lại
     */
    getAvailableCredit(): number {
        if (!this.creditLimit) return Infinity;
        return Math.max(0, this.creditLimit - (this.currentDebt || 0));
    }
}
