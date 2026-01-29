/**
 * Centralized error handling utilities
 */

// API Error interface
export interface ApiError {
    response?: {
        status: number;
        data?: {
            message?: string;
            error?: string;
            errors?: Record<string, string[]>;
        };
    };
    message?: string;
    code?: string;
}

/**
 * Extract a readable error message from various error types
 */
export const getErrorMessage = (err: unknown, defaultMessage = 'An error occurred'): string => {
    // Handle null/undefined
    if (!err) return defaultMessage;

    // Handle Error instance
    if (err instanceof Error) {
        return err.message || defaultMessage;
    }

    // Handle API error object
    if (typeof err === 'object') {
        const apiErr = err as ApiError;

        // Try to get message from response data
        if (apiErr.response?.data?.message) {
            return apiErr.response.data.message;
        }

        // Try to get error from response data
        if (apiErr.response?.data?.error) {
            return apiErr.response.data.error;
        }

        // Try to get validation errors
        if (apiErr.response?.data?.errors) {
            const errors = apiErr.response.data.errors;
            const firstError = Object.values(errors)[0];
            if (firstError && firstError.length > 0) {
                return firstError[0];
            }
        }

        // Try to get message from error object directly
        if (apiErr.message) {
            return apiErr.message;
        }
    }

    // Handle string error
    if (typeof err === 'string') {
        return err;
    }

    return defaultMessage;
};

/**
 * Check if error is an authentication error (401)
 */
export const isAuthError = (err: unknown): boolean => {
    if (!err || typeof err !== 'object') return false;
    const apiErr = err as ApiError;
    return apiErr.response?.status === 401;
};

/**
 * Check if error is a forbidden error (403)
 */
export const isForbiddenError = (err: unknown): boolean => {
    if (!err || typeof err !== 'object') return false;
    const apiErr = err as ApiError;
    return apiErr.response?.status === 403;
};

/**
 * Check if error is a not found error (404)
 */
export const isNotFoundError = (err: unknown): boolean => {
    if (!err || typeof err !== 'object') return false;
    const apiErr = err as ApiError;
    return apiErr.response?.status === 404;
};

/**
 * Check if error is a validation error (400)
 */
export const isValidationError = (err: unknown): boolean => {
    if (!err || typeof err !== 'object') return false;
    const apiErr = err as ApiError;
    return apiErr.response?.status === 400;
};

/**
 * Check if error is a server error (5xx)
 */
export const isServerError = (err: unknown): boolean => {
    if (!err || typeof err !== 'object') return false;
    const apiErr = err as ApiError;
    const status = apiErr.response?.status;
    return status !== undefined && status >= 500 && status < 600;
};

/**
 * Log error with consistent format
 */
export const logError = (context: string, err: unknown): void => {
    console.error(`[${context}]`, {
        message: getErrorMessage(err),
        error: err
    });
};
