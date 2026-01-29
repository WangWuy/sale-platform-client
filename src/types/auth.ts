import { User, UserRole, UserStatus } from './user';

// =====================================================
// Request Types - Gửi lên Server
// =====================================================

/**
 * POST /api/auth/login
 */
export interface LoginRequest {
    identifier: string;  // Email hoặc số điện thoại
    password: string;
}

/**
 * POST /api/auth/register
 */
export interface RegisterRequest {
    email: string;
    password: string;
    username?: string;
    fullName?: string;
    phone?: string;
}

/**
 * POST /api/auth/refresh
 */
export interface RefreshTokenRequest {
    refreshToken: string;
}

// =====================================================
// Response Types - Nhận từ Server
// =====================================================

/**
 * Tokens structure trong response
 */
export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresIn: string;
}

/**
 * Response từ POST /api/auth/login
 * Response từ POST /api/auth/register
 */
export interface AuthResult {
    user: User;
    tokens: AuthTokens;
}

/**
 * Response từ POST /api/auth/refresh
 */
export interface RefreshTokenResponse {
    accessToken: string;
    refreshToken: string;
    expiresIn: string;
}

/**
 * Response từ POST /api/auth/logout
 */
export interface LogoutResponse {
    success: true;
}

// Re-export User and related types for convenience
export type { User, UserRole, UserStatus };
