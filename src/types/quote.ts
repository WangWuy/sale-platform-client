// Quote Status Enum
export enum QuoteStatus {
    DRAFT = 1,
    SENT = 2,
    ACCEPTED = 3,
    REJECTED = 4,
    EXPIRED = 5,
}

// Quote Status Labels
export const QuoteStatusLabels: Record<QuoteStatus, string> = {
    [QuoteStatus.DRAFT]: "Nháp",
    [QuoteStatus.SENT]: "Đã gửi",
    [QuoteStatus.ACCEPTED]: "Chấp nhận",
    [QuoteStatus.REJECTED]: "Từ chối",
    [QuoteStatus.EXPIRED]: "Hết hạn",
};

// Quote Status Colors
export const QuoteStatusColors: Record<QuoteStatus, string> = {
    [QuoteStatus.DRAFT]: "gray",
    [QuoteStatus.SENT]: "blue",
    [QuoteStatus.ACCEPTED]: "green",
    [QuoteStatus.REJECTED]: "red",
    [QuoteStatus.EXPIRED]: "orange",
};

// Quote Interface
export interface Quote {
    id: number;
    code: string;
    customerId?: number;
    customerName?: string;
    customerPhone?: string;
    customerEmail?: string;
    totalAmount: number;
    discount: number;
    shippingFee: number;
    finalAmount: number;
    status: QuoteStatus;
    validUntil?: string;
    notes?: string;
    internalNotes?: string;
    createdBy: number;
    updatedBy?: number;
    sentAt?: string;
    createdAt: string;
    updatedAt: string;
}

// Quote Item Interface
export interface QuoteItem {
    id: number;
    quoteId: number;
    productId?: number;
    variantId?: number;
    productName: string;
    productCode?: string;
    category: string;
    material: string;
    dimensions?: {
        length?: number;
        width?: number;
        height?: number;
        unit: string;
    };
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    basePrice: number;
    adjustmentPercent: number;
    adjustmentReason?: string;
    customOptions?: Record<string, any>;
    uploadedImageId?: string;
    uploadedImageUrl?: string;
    notes?: string;
}

// Quote with Items
export interface QuoteWithItems extends Quote {
    items: QuoteItem[];
}

// Create Quote DTO
export interface CreateQuoteDTO {
    customerId?: number;
    customerName?: string;
    customerPhone?: string;
    customerEmail?: string;
    items: CreateQuoteItemDTO[];
    discount?: number;
    notes?: string;
    internalNotes?: string;
    validUntil?: string;
}

// Create Quote Item DTO
export interface CreateQuoteItemDTO {
    productId?: number;
    variantId?: number;
    productName: string;
    productCode?: string;
    category: string;
    material: string;
    dimensions?: {
        length?: number;
        width?: number;
        height?: number;
        unit?: string;
    };
    quantity: number;
    unitPrice: number;
    basePrice?: number;
    adjustmentPercent?: number;
    adjustmentReason?: string;
    customOptions?: Record<string, any>;
    uploadedImageId?: string;
    uploadedImageUrl?: string;
    notes?: string;
}

// Price Calculation Request
export interface PriceCalculationRequest {
    items: {
        productId: number;
        quantity: number;
        dimensions?: {
            length?: number;
            width?: number;
            height?: number;
        };
        material?: string;
    }[];
}

// Price Calculation Result
export interface PriceCalculationResult {
    estimatedPrice: number;
    breakdown: {
        basePrice: number;
        sizeAdjustment: number;
        materialSurcharge: number;
        subtotal: number;
        shippingFee: number;
    };
    warnings: string[];
}

// Quote Filter Params
export interface QuoteFilterParams {
    page?: number;
    limit?: number;
    search?: string;
    code?: string;
    customerName?: string;
    customerPhone?: string;
    status?: QuoteStatus;
    createdBy?: number;
    minAmount?: number;
    maxAmount?: number;
    createdFrom?: string;
    createdTo?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}

// Quote Stats
export interface QuoteStats {
    byStatus: Array<{
        status: QuoteStatus;
        count: number;
    }>;
    totalRevenue: number;
    recentQuotes: Quote[];
}

// API Response Types
export interface QuotesResponse {
    quotes: Quote[];
    total: number;
    page: number;
    totalPages: number;
}
