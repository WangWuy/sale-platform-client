export interface Category {
    id: number;
    name: string;
    description?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreateCategoryRequest {
    name: string;
    description?: string;
}

export interface UpdateCategoryRequest {
    name?: string;
    description?: string;
}

export interface CategoryListResponse {
    categories: Category[];
    total: number;
    page: number;
    totalPages: number;
}
