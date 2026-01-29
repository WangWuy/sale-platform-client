import { BaseModel } from "@/types/base.model";
import { BaseResponseModel } from "@/types/base.response.model";

// =====================================================
// RESPONSE MODEL
// =====================================================

export class SupplierResponseModel extends BaseResponseModel {
    name: string = "";
    contact?: string | null;
    address?: string | null;
    phone?: string | null;
    email?: string | null;
}

// =====================================================
// CLIENT MODEL
// =====================================================

export class SupplierModel extends BaseModel {
    name: string = "";
    contact: string | null = null;
    address: string | null = null;
    phone: string | null = null;
    email: string | null = null;

    constructor(resModel: SupplierResponseModel) {
        super(resModel);
        if (resModel) {
            this.name = resModel.name;
            this.contact = resModel.contact || null;
            this.address = resModel.address || null;
            this.phone = resModel.phone || null;
            this.email = resModel.email || null;
        }
    }

    /**
     * Lấy thông tin liên hệ chính
     */
    getPrimaryContact(): string {
        return this.contact || this.phone || this.email || "Chưa có thông tin";
    }

    /**
     * Kiểm tra có thông tin liên hệ
     */
    hasContactInfo(): boolean {
        return !!(this.phone || this.email || this.contact);
    }

    /**
     * Kiểm tra có địa chỉ
     */
    hasAddress(): boolean {
        return !!this.address;
    }
}
