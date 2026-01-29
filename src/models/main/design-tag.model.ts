import { BaseModel } from "@/types/base.model";
import { BaseResponseModel } from "@/types/base.response.model";

// =====================================================
// ENUMS
// =====================================================

export enum TagBehavior {
    AUTO_SURCHARGE = 1,
    MANUAL_QUOTE = 2,
    INFO_ONLY = 3
}

// =====================================================
// RESPONSE MODEL
// =====================================================

export class DesignTagResponseModel extends BaseResponseModel {
    code: string = "";
    name: string = "";
    behavior: TagBehavior = TagBehavior.INFO_ONLY;
    surchargeAmount?: number | null;
    surchargePercent?: number | null;
    appliesToProducts?: number[] | null;
    description?: string | null;
    isActive: boolean = true;
}

// =====================================================
// CLIENT MODEL
// =====================================================

export class DesignTagModel extends BaseModel {
    code: string = "";
    name: string = "";
    behavior: TagBehavior = TagBehavior.INFO_ONLY;
    surchargeAmount: number | null = null;
    surchargePercent: number | null = null;
    appliesToProducts: number[] | null = null;
    description: string | null = null;
    isActive: boolean = true;

    constructor(resModel: DesignTagResponseModel) {
        super(resModel);
        if (resModel) {
            this.code = resModel.code;
            this.name = resModel.name;
            this.behavior = resModel.behavior;
            this.surchargeAmount = resModel.surchargeAmount || null;
            this.surchargePercent = resModel.surchargePercent || null;
            this.appliesToProducts = resModel.appliesToProducts || null;
            this.description = resModel.description || null;
            this.isActive = resModel.isActive;
        }
    }

    /**
     * Lấy tên behavior
     */
    getBehaviorName(): string {
        const names: Record<TagBehavior, string> = {
            [TagBehavior.AUTO_SURCHARGE]: "Tự động phụ thu",
            [TagBehavior.MANUAL_QUOTE]: "Báo giá thủ công",
            [TagBehavior.INFO_ONLY]: "Chỉ hiển thị"
        };
        return names[this.behavior] || "Unknown";
    }

    /**
     * Lấy màu badge cho behavior
     */
    getBehaviorColor(): string {
        switch (this.behavior) {
            case TagBehavior.AUTO_SURCHARGE:
                return "error";
            case TagBehavior.MANUAL_QUOTE:
                return "warning";
            case TagBehavior.INFO_ONLY:
                return "default";
            default:
                return "default";
        }
    }

    /**
     * Kiểm tra có phụ thu không
     */
    hasSurcharge(): boolean {
        return this.behavior === TagBehavior.AUTO_SURCHARGE &&
            (!!this.surchargeAmount || !!this.surchargePercent);
    }

    /**
     * Tính phụ thu
     */
    calculateSurcharge(basePrice: number): number {
        if (!this.hasSurcharge()) return 0;

        let surcharge = 0;
        if (this.surchargeAmount) {
            surcharge += this.surchargeAmount;
        }
        if (this.surchargePercent) {
            surcharge += basePrice * (this.surchargePercent / 100);
        }
        return surcharge;
    }

    /**
     * Format surcharge description
     */
    getSurchargeDescription(): string {
        if (!this.hasSurcharge()) return "";

        const parts: string[] = [];
        if (this.surchargeAmount) {
            parts.push(`+${new Intl.NumberFormat("vi-VN").format(this.surchargeAmount)}đ`);
        }
        if (this.surchargePercent) {
            parts.push(`+${this.surchargePercent}%`);
        }
        return parts.join(" ");
    }
}
