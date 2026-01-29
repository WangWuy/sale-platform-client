// =====================================================
// Supplier Types - Types cho Supplier API
// =====================================================

export interface Supplier {
    id: number;
    name: string;
    contact?: string | null;
    address?: string | null;
    phone?: string | null;
    email?: string | null;
    isDelete: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface SupplierStats {
    totalSuppliers: number;
}

export interface SupplierFilterParams {
    page?: number;
    limit?: number;
    search?: string;
    name?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface SuppliersResponse {
    suppliers: Supplier[];
    total: number;
    page: number;
    totalPages: number;
}

export interface CreateSupplierRequest {
    name: string;
    contact?: string;
    address?: string;
    phone?: string;
    email?: string;
}

export interface UpdateSupplierRequest {
    name?: string;
    contact?: string;
    address?: string;
    phone?: string;
    email?: string;
}
