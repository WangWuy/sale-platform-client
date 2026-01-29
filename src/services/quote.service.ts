import apiServer from "@/lib/api";
import { ApiResponse } from "@/types/api-response.model";
import {
    Quote,
    QuoteWithItems,
    CreateQuoteDTO,
    CreateQuoteItemDTO,
    PriceCalculationRequest,
    PriceCalculationResult,
    QuoteFilterParams,
    QuoteStats,
    QuotesResponse,
    QuoteItem,
} from "@/types/quote";

// =====================================================
// Quote Service - Quản lý Quotes API
// =====================================================

export const quoteService = {
    /**
     * GET /api/quotes/stats
     * Lấy thống kê báo giá
     */
    async getStats(): Promise<QuoteStats> {
        try {
            const response = await apiServer.get<ApiResponse<QuoteStats>>("/quotes/stats");

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            return {
                byStatus: [],
                totalRevenue: 0,
                recentQuotes: [],
            };
        } catch (error) {
            console.error("Get quote stats failed:", error);
            throw error;
        }
    },

    /**
     * GET /api/quotes
     * Lấy danh sách báo giá với pagination và filters
     */
    async getQuotes(params?: QuoteFilterParams): Promise<QuotesResponse> {
        try {
            const response = await apiServer.get<ApiResponse<QuotesResponse>>("/quotes", {
                params: {
                    page: params?.page || 1,
                    limit: params?.limit || 20,
                    search: params?.search,
                    code: params?.code,
                    customerName: params?.customerName,
                    customerPhone: params?.customerPhone,
                    status: params?.status,
                    createdBy: params?.createdBy,
                    minAmount: params?.minAmount,
                    maxAmount: params?.maxAmount,
                    createdFrom: params?.createdFrom,
                    createdTo: params?.createdTo,
                    sortBy: params?.sortBy || "createdAt",
                    sortOrder: params?.sortOrder || "desc",
                },
            });

            console.log('Quote API Response:', response.data);

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            return {
                quotes: [],
                total: 0,
                page: params?.page || 1,
                totalPages: 0,
            };
        } catch (error) {
            console.error("Get quotes failed:", error);
            throw error;
        }
    },

    /**
     * GET /api/quotes/:id
     * Lấy chi tiết báo giá
     */
    async getQuoteById(id: number): Promise<QuoteWithItems | null> {
        try {
            const response = await apiServer.get<ApiResponse<QuoteWithItems>>(`/quotes/${id}`);

            if (response.data.success && response.data.data) {
                return response.data.data;
            }
            return null;
        } catch (error) {
            console.error(`Get quote ${id} failed:`, error);
            throw error;
        }
    },

    /**
     * POST /api/quotes
     * Tạo báo giá mới
     */
    async createQuote(data: CreateQuoteDTO): Promise<Quote | null> {
        try {
            const response = await apiServer.post<ApiResponse<Quote>>("/quotes", data);

            if (response.data.success && response.data.data) {
                return response.data.data;
            }
            return null;
        } catch (error) {
            console.error("Create quote failed:", error);
            throw error;
        }
    },

    /**
     * PUT /api/quotes/:id
     * Cập nhật báo giá
     */
    async updateQuote(id: number, data: Partial<CreateQuoteDTO>): Promise<Quote | null> {
        try {
            const response = await apiServer.put<ApiResponse<Quote>>(`/quotes/${id}`, data);

            if (response.data.success && response.data.data) {
                return response.data.data;
            }
            return null;
        } catch (error) {
            console.error(`Update quote ${id} failed:`, error);
            throw error;
        }
    },

    /**
     * DELETE /api/quotes/:id
     * Xóa báo giá (soft delete)
     */
    async deleteQuote(id: number): Promise<boolean> {
        try {
            const response = await apiServer.delete<ApiResponse<void>>(`/quotes/${id}`);
            return response.data.success;
        } catch (error) {
            console.error(`Delete quote ${id} failed:`, error);
            throw error;
        }
    },

    /**
     * POST /api/quotes/:id/send
     * Gửi báo giá cho khách hàng
     */
    async sendQuote(id: number): Promise<Quote | null> {
        try {
            const response = await apiServer.post<ApiResponse<Quote>>(`/quotes/${id}/send`);

            if (response.data.success && response.data.data) {
                return response.data.data;
            }
            return null;
        } catch (error) {
            console.error(`Send quote ${id} failed:`, error);
            throw error;
        }
    },

    /**
     * POST /api/quotes/:id/accept
     * Chấp nhận báo giá
     */
    async acceptQuote(id: number): Promise<Quote | null> {
        try {
            const response = await apiServer.post<ApiResponse<Quote>>(`/quotes/${id}/accept`);

            if (response.data.success && response.data.data) {
                return response.data.data;
            }
            return null;
        } catch (error) {
            console.error(`Accept quote ${id} failed:`, error);
            throw error;
        }
    },

    /**
     * POST /api/quotes/:id/reject
     * Từ chối báo giá
     */
    async rejectQuote(id: number): Promise<Quote | null> {
        try {
            const response = await apiServer.post<ApiResponse<Quote>>(`/quotes/${id}/reject`);

            if (response.data.success && response.data.data) {
                return response.data.data;
            }
            return null;
        } catch (error) {
            console.error(`Reject quote ${id} failed:`, error);
            throw error;
        }
    },

    /**
     * POST /api/quotes/:id/duplicate
     * Sao chép báo giá
     */
    async duplicateQuote(id: number): Promise<Quote | null> {
        try {
            const response = await apiServer.post<ApiResponse<Quote>>(`/quotes/${id}/duplicate`);

            if (response.data.success && response.data.data) {
                return response.data.data;
            }
            return null;
        } catch (error) {
            console.error(`Duplicate quote ${id} failed:`, error);
            throw error;
        }
    },

    /**
     * POST /api/quotes/calculate-price
     * Tính giá tham khảo (pre-quote estimation)
     */
    async calculatePrice(data: PriceCalculationRequest): Promise<PriceCalculationResult | null> {
        try {
            const response = await apiServer.post<ApiResponse<PriceCalculationResult>>(
                "/quotes/calculate-price",
                data
            );

            if (response.data.success && response.data.data) {
                return response.data.data;
            }
            return null;
        } catch (error) {
            console.error("Calculate price failed:", error);
            throw error;
        }
    },

    /**
     * POST /api/quotes/:quoteId/items
     * Thêm sản phẩm vào báo giá
     */
    async addItem(quoteId: number, data: CreateQuoteItemDTO): Promise<QuoteItem | null> {
        try {
            const response = await apiServer.post<ApiResponse<QuoteItem>>(
                `/quotes/${quoteId}/items`,
                data
            );

            if (response.data.success && response.data.data) {
                return response.data.data;
            }
            return null;
        } catch (error) {
            console.error(`Add item to quote ${quoteId} failed:`, error);
            throw error;
        }
    },

    /**
     * POST /api/quotes/:quoteId/items/bulk
     * Thêm nhiều sản phẩm cùng lúc
     */
    async bulkAddItems(quoteId: number, items: CreateQuoteItemDTO[]): Promise<QuoteItem[] | null> {
        try {
            const response = await apiServer.post<ApiResponse<QuoteItem[]>>(
                `/quotes/${quoteId}/items/bulk`,
                { items }
            );

            if (response.data.success && response.data.data) {
                return response.data.data;
            }
            return null;
        } catch (error) {
            console.error(`Bulk add items to quote ${quoteId} failed:`, error);
            throw error;
        }
    },

    /**
     * PUT /api/quotes/:quoteId/items/:id
     * Cập nhật sản phẩm trong báo giá
     */
    async updateItem(
        quoteId: number,
        itemId: number,
        data: Partial<CreateQuoteItemDTO>
    ): Promise<QuoteItem | null> {
        try {
            const response = await apiServer.put<ApiResponse<QuoteItem>>(
                `/quotes/${quoteId}/items/${itemId}`,
                data
            );

            if (response.data.success && response.data.data) {
                return response.data.data;
            }
            return null;
        } catch (error) {
            console.error(`Update item ${itemId} in quote ${quoteId} failed:`, error);
            throw error;
        }
    },

    /**
     * DELETE /api/quotes/:quoteId/items/:id
     * Xóa sản phẩm khỏi báo giá
     */
    async deleteItem(quoteId: number, itemId: number): Promise<boolean> {
        try {
            const response = await apiServer.delete<ApiResponse<void>>(
                `/quotes/${quoteId}/items/${itemId}`
            );
            return response.data.success;
        } catch (error) {
            console.error(`Delete item ${itemId} from quote ${quoteId} failed:`, error);
            throw error;
        }
    },
};

export default quoteService;
