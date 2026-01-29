import apiServer from '@/lib/api';
import { ApiResponse } from '@/types/api-response.model';
import {
    LoginRequest,
    RegisterRequest,
    AuthResult,
    RefreshTokenResponse,
    User,
    RefreshTokenRequest
} from '@/types/auth';

// =====================================================
// Token Storage Keys
// =====================================================
const STORAGE_KEYS = {
    ACCESS_TOKEN: 'accessToken',
    REFRESH_TOKEN: 'refreshToken',
    USER: 'user',
    REMEMBERED_IDENTIFIER: 'rememberedIdentifier',
    REMEMBERED_PASSWORD: 'rememberedPassword',
} as const;

// =====================================================
// Auth Service - Quản lý Authentication
// =====================================================

export const authService = {
    // ==================== Token Management ====================

    /**
     * Lưu access token (vào cả localStorage và cookie)
     */
    saveToken(token: string): void {
        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
            // Lưu vào cookie để middleware server-side có thể đọc
            document.cookie = `accessToken=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
        }
    },

    /**
     * Lấy access token
     */
    getToken(): string | null {
        if (typeof window !== 'undefined') {
            return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        }
        return null;
    },

    /**
     * Lưu refresh token
     */
    saveRefreshToken(token: string): void {
        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
        }
    },

    /**
     * Lấy refresh token
     */
    getRefreshToken(): string | null {
        if (typeof window !== 'undefined') {
            return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
        }
        return null;
    },

    /**
     * Kiểm tra có token không
     */
    hasToken(): boolean {
        return !!this.getToken();
    },

    /**
     * Xóa tất cả tokens (localStorage và cookie)
     */
    removeTokens(): void {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
            localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
            localStorage.removeItem(STORAGE_KEYS.USER);
            // Xóa cookie
            document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        }
    },

    // ==================== User Management ====================

    /**
     * Lưu user vào localStorage
     */
    saveUser(user: User): void {
        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
        }
    },

    /**
     * Lấy user từ localStorage (dạng raw object)
     */
    getStoredUser(): User | null {
        if (typeof window !== 'undefined') {
            const userStr = localStorage.getItem(STORAGE_KEYS.USER);
            if (userStr) {
                try {
                    return JSON.parse(userStr);
                } catch {
                    return null;
                }
            }
        }
        return null;
    },

    /**
     * Kiểm tra đã đăng nhập chưa
     */
    isAuthenticated(): boolean {
        return this.hasToken() && !!this.getStoredUser();
    },

    // ==================== API Calls ====================

    /**
     * POST /api/auth/login
     * Đăng nhập với email và password
     */
    async login(credentials: LoginRequest): Promise<AuthResult | null> {
        try {
            const response = await apiServer.post<ApiResponse<AuthResult>>('/auth/login', credentials);

            if (response.data.success && response.data.data) {
                const authData = response.data.data;

                // Lưu tokens
                this.saveToken(authData.tokens.accessToken);
                this.saveRefreshToken(authData.tokens.refreshToken);

                // Lưu user
                this.saveUser(authData.user);

                return authData;
            }
            return null;
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    },

    /**
     * POST /api/auth/register
     * Đăng ký tài khoản mới
     */
    async register(data: RegisterRequest): Promise<AuthResult | null> {
        try {
            const response = await apiServer.post<ApiResponse<AuthResult>>('/auth/register', {
                email: data.email,
                password: data.password,
                username: data.username,
                fullName: data.fullName,
                phone: data.phone,
            });

            if (response.data.success && response.data.data) {
                const authData = response.data.data;

                // Lưu tokens
                this.saveToken(authData.tokens.accessToken);
                this.saveRefreshToken(authData.tokens.refreshToken);

                // Lưu user
                this.saveUser(authData.user);

                return authData;
            }
            return null;
        } catch (error) {
            console.error('Register failed:', error);
            throw error;
        }
    },

    /**
     * POST /api/auth/logout
     * Đăng xuất - Yêu cầu Bearer token
     */
    async logout(): Promise<void> {
        try {
            await apiServer.post('/auth/logout');
        } catch (error) {
            console.error('Logout API failed:', error);
        } finally {
            // Xóa data local dù API thất bại
            this.removeTokens();
        }
    },

    /**
     * POST /api/auth/refresh
     * Refresh access token sử dụng refresh token
     */
    async refreshToken(): Promise<RefreshTokenResponse | null> {
        const refreshToken = this.getRefreshToken();
        if (!refreshToken) {
            console.error('No refresh token available');
            return null;
        }

        try {
            const requestData: RefreshTokenRequest = { refreshToken };
            const response = await apiServer.post<ApiResponse<RefreshTokenResponse>>(
                '/auth/refresh',
                requestData
            );

            if (response.data.success && response.data.data) {
                const tokenData = response.data.data;
                this.saveToken(tokenData.accessToken);
                this.saveRefreshToken(tokenData.refreshToken);
                return tokenData;
            }
            return null;
        } catch (error) {
            console.error('Refresh token failed:', error);
            this.removeTokens();
            throw error;
        }
    },

    /**
     * GET /api/auth/me
     * Lấy thông tin user hiện tại - Yêu cầu Bearer token
     */
    async getCurrentUser(): Promise<User | null> {
        try {
            const response = await apiServer.get<ApiResponse<User>>('/auth/me');

            if (response.data.success && response.data.data) {
                const user = response.data.data;
                this.saveUser(user);
                return user;
            }
            return null;
        } catch (error) {
            console.error('Get current user failed:', error);
            return null;
        }
    },

    /**
     * Lấy user hiện tại (từ localStorage hoặc fetch từ server)
     */
    async getOrFetchCurrentUser(): Promise<User | null> {
        // Thử lấy từ localStorage trước
        const storedUser = this.getStoredUser();
        if (storedUser) {
            return storedUser;
        }

        // Nếu có token, fetch từ server
        if (this.hasToken()) {
            return await this.getCurrentUser();
        }

        return null;
    },

    // ==================== Auth Data Helpers ====================

    /**
     * Lưu toàn bộ auth data
     */
    saveAuthData(accessToken: string, refreshToken: string, user: User): void {
        this.saveToken(accessToken);
        this.saveRefreshToken(refreshToken);
        this.saveUser(user);
    },

    /**
     * Xóa toàn bộ auth data và redirect về login
     */
    clearAuthAndRedirect(): void {
        this.removeTokens();
        if (typeof window !== 'undefined') {
            window.location.href = '/login';
        }
    },

    // ==================== Remember Me ====================

    /**
     * Lưu identifier (email/phone) để ghi nhớ đăng nhập
     */
    saveRememberedIdentifier(identifier: string): void {
        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEYS.REMEMBERED_IDENTIFIER, identifier);
        }
    },

    /**
     * Lấy identifier đã ghi nhớ
     */
    getRememberedIdentifier(): string | null {
        if (typeof window !== 'undefined') {
            return localStorage.getItem(STORAGE_KEYS.REMEMBERED_IDENTIFIER);
        }
        return null;
    },

    /**
     * Lưu mật khẩu để ghi nhớ đăng nhập
     */
    saveRememberedPassword(password: string): void {
        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEYS.REMEMBERED_PASSWORD, password);
        }
    },

    /**
     * Lấy mật khẩu đã ghi nhớ
     */
    getRememberedPassword(): string | null {
        if (typeof window !== 'undefined') {
            return localStorage.getItem(STORAGE_KEYS.REMEMBERED_PASSWORD);
        }
        return null;
    },

    /**
     * Xóa identifier đã ghi nhớ
     */
    clearRememberedIdentifier(): void {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(STORAGE_KEYS.REMEMBERED_IDENTIFIER);
        }
    },

    /**
     * Xóa tất cả thông tin đăng nhập đã ghi nhớ (identifier và password)
     */
    clearRememberedCredentials(): void {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(STORAGE_KEYS.REMEMBERED_IDENTIFIER);
            localStorage.removeItem(STORAGE_KEYS.REMEMBERED_PASSWORD);
        }
    },
};

export default authService;
