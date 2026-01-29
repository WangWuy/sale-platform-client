// =====================================================
// Design Tag Types - Types cho Design Tags API
// =====================================================

export enum TagBehavior {
    AUTO_SURCHARGE = 1,
    MANUAL_QUOTE = 2,
    INFO_ONLY = 3,
}

export const TAG_BEHAVIOR_NAMES: Record<TagBehavior, string> = {
    [TagBehavior.AUTO_SURCHARGE]: "Tự động phụ thu",
    [TagBehavior.MANUAL_QUOTE]: "Báo giá thủ công",
    [TagBehavior.INFO_ONLY]: "Chỉ hiển thị",
};

export interface DesignTag {
    id: number;
    code: string;
    name: string;
    behavior: TagBehavior;
    surchargeAmount?: string | null;
    surchargePercent?: string | null;
    appliesToProducts?: number[] | null;
    description?: string | null;
    isActive: boolean;
    isDelete: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface DesignTagStats {
    countByBehavior: {
        behavior: TagBehavior;
        behaviorName: string;
        count: number;
    }[];
}

export interface TagBehaviorInfo {
    id: TagBehavior;
    name: string;
    code: string;
}

export interface TagFilterParams {
    page?: number;
    limit?: number;
    search?: string;
    behavior?: TagBehavior;
    isActive?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface TagsResponse {
    tags: DesignTag[];
    total: number;
    page: number;
    totalPages: number;
}

export interface CreateTagRequest {
    code: string;
    name: string;
    behavior: TagBehavior;
    surchargeAmount?: number;
    surchargePercent?: number;
    appliesToProducts?: number[];
    description?: string;
}

export interface UpdateTagRequest {
    code?: string;
    name?: string;
    behavior?: TagBehavior;
    surchargeAmount?: number;
    surchargePercent?: number;
    appliesToProducts?: number[];
    description?: string;
    isActive?: boolean;
}
