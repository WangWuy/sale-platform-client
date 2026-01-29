// =====================================================
// Customer Types - Types cho Customer API
// =====================================================


export interface Customer {
    id: number;
    name: string;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
    customerType?: string | null;
    notes?: string | null;
    isDelete: boolean;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null;
}

export interface CustomerStats {
    totalCustomers: number;
    countByType: { customerType: string | null; count: number }[];
    customerTypes: string[];
}

export interface CustomerFilterParams {
    page?: number;
    limit?: number;
    search?: string;
    name?: string;
    phone?: string;
    email?: string;
    customerType?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface CustomersResponse {
    customers: Customer[];
    total: number;
    page: number;
    totalPages: number;
}

export interface CreateCustomerRequest {
    name: string;
    phone?: string;
    email?: string;
    address?: string;
    customerType?: string;
    notes?: string;
}

export interface UpdateCustomerRequest {
    name?: string;
    phone?: string;
    email?: string;
    address?: string;
    customerType?: string;
    notes?: string;
}

// Customer Types for dropdown
export const CUSTOMER_TYPES = [
    "Quán cà phê",
    "Nhà hàng",
    "Văn phòng",
    "Khách sạn",
    "Cửa hàng nội thất",
    "Căn hộ",
    "Biệt thự",
    "Showroom",
    "Khác"
] as const;

export type CustomerType = typeof CUSTOMER_TYPES[number];
