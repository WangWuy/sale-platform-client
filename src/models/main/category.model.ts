import { BaseModel } from "@/types/base.model";
import { BaseResponseModel } from "@/types/base.response.model";

// =====================================================
// RESPONSE MODEL
// =====================================================

export class CategoryResponseModel extends BaseResponseModel {
    name: string = "";
    description?: string | null;
    parentId?: number | null;
    isActive: boolean = true;
    isDelete: boolean = false;
}

// =====================================================
// CLIENT MODEL
// =====================================================

export class CategoryModel extends BaseModel {
    name: string = "";
    description: string | null = null;
    parentId: number | null = null;
    isActive: boolean = true;
    isDelete: boolean = false;

    constructor(resModel: CategoryResponseModel) {
        super(resModel);
        if (resModel) {
            this.name = resModel.name;
            this.description = resModel.description || null;
            this.parentId = resModel.parentId || null;
            this.isActive = resModel.isActive;
            this.isDelete = resModel.isDelete;
        }
    }

    /**
     * Kiểm tra là category con
     */
    isChild(): boolean {
        return this.parentId !== null;
    }

    /**
     * Kiểm tra là category gốc
     */
    isRoot(): boolean {
        return this.parentId === null;
    }

    /**
     * Lấy trạng thái hiển thị
     */
    getStatusName(): string {
        return this.isActive ? "Đang hoạt động" : "Đã tắt";
    }

    /**
     * Lấy màu trạng thái
     */
    getStatusColor(): string {
        return this.isActive ? "success" : "default";
    }
}
