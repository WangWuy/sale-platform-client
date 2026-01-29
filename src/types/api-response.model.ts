/**
 * ApiResponse - Wrapper cho response từ API
 * Khớp với cấu trúc response của Server
 */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/**
 * ApiPaginatedResponse - Response với pagination
 */
export interface ApiPaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * ApiErrorResponse - Error response từ API
 */
export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: any;
}