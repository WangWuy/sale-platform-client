import apiServer from '@/lib/api';
import { ApiResponse } from '@/types/api-response.model';
import { User, UserRole, UserStatus } from '@/types/auth';

// =====================================================
// User Service - Quản lý User Profile, Settings & Admin
// =====================================================

export interface UpdateProfileRequest {
    fullName?: string;
    phone?: string;
    avatarUrl?: string;
}

export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export interface UserPreferences {
    notifications: {
        email: boolean;
        push: boolean;
        sms: boolean;
    };
    theme: 'light' | 'dark' | 'auto';
    language: 'vi' | 'en';
}

export interface UserStatistics {
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    bannedUsers: number;
    usersByRole: { role: UserRole; count: number }[];
}

export interface UserListParams {
    page?: number;
    limit?: number;
    search?: string;
    role?: UserRole;
    status?: UserStatus;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface UserListResponse {
    users: User[];
    total: number;
    page: number;
    totalPages: number;
}

export interface CreateUserRequest {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
    role: UserRole;
    status?: UserStatus;
}

export interface UpdateUserRequest {
    email?: string;
    fullName?: string;
    phone?: string;
    role?: UserRole;
    status?: UserStatus;
    avatarUrl?: string;
}

export interface BulkUpdateStatusRequest {
    userIds: number[];
    status: UserStatus;
}

export const userService = {
    /**
     * GET /api/users/me
     * Lấy thông tin user hiện tại
     */
    async getCurrentUser(): Promise<User | null> {
        try {
            const response = await apiServer.get<ApiResponse<User>>('/users/me');

            if (response.data.success && response.data.data) {
                return response.data.data;
            }
            return null;
        } catch (error) {
            console.error('Get current user failed:', error);
            throw error;
        }
    },

    /**
     * PUT /api/users/me
     * Cập nhật profile user hiện tại
     */
    async updateProfile(data: UpdateProfileRequest): Promise<User | null> {
        try {
            const response = await apiServer.put<ApiResponse<User>>('/users/me', data);

            if (response.data.success && response.data.data) {
                // Update localStorage
                if (typeof window !== 'undefined') {
                    localStorage.setItem('user', JSON.stringify(response.data.data));
                }
                return response.data.data;
            }
            return null;
        } catch (error) {
            console.error('Update profile failed:', error);
            throw error;
        }
    },

    /**
     * POST /api/users/change-password
     * Đổi mật khẩu
     */
    async changePassword(data: ChangePasswordRequest): Promise<boolean> {
        try {
            // Validate passwords match
            if (data.newPassword !== data.confirmPassword) {
                throw new Error('Mật khẩu xác nhận không khớp');
            }

            const response = await apiServer.post<ApiResponse<void>>('/users/change-password', {
                currentPassword: data.currentPassword,
                newPassword: data.newPassword
            });

            return response.data.success;
        } catch (error) {
            console.error('Change password failed:', error);
            throw error;
        }
    },

    /**
     * GET /api/users/preferences
     * Lấy preferences của user
     */
    async getPreferences(): Promise<UserPreferences | null> {
        try {
            const response = await apiServer.get<ApiResponse<UserPreferences>>('/users/preferences');

            if (response.data.success && response.data.data) {
                return response.data.data;
            }
            return null;
        } catch (error) {
            console.error('Get preferences failed:', error);
            // Return default if API fails
            return {
                notifications: {
                    email: true,
                    push: true,
                    sms: false
                },
                theme: 'light',
                language: 'vi'
            };
        }
    },

    /**
     * PUT /api/users/preferences
     * Cập nhật preferences
     */
    async updatePreferences(data: Partial<UserPreferences>): Promise<UserPreferences | null> {
        try {
            const response = await apiServer.put<ApiResponse<UserPreferences>>('/users/preferences', data);

            if (response.data.success && response.data.data) {
                return response.data.data;
            }
            return null;
        } catch (error) {
            console.error('Update preferences failed:', error);
            throw error;
        }
    },

    /**
     * POST /api/users/upload-avatar
     * Upload avatar
     */
    async uploadAvatar(file: File): Promise<string | null> {
        try {
            const formData = new FormData();
            formData.append('avatar', file);

            const response = await apiServer.post<ApiResponse<{ avatarUrl: string }>>('/users/upload-avatar', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success && response.data.data) {
                return response.data.data.avatarUrl;
            }
            return null;
        } catch (error) {
            console.error('Upload avatar failed:', error);
            throw error;
        }
    },

    // ==================== Admin APIs ====================

    /**
     * GET /api/users/statistics
     * Lấy thống kê users (Admin)
     */
    async getStatistics(): Promise<UserStatistics | null> {
        try {
            const response = await apiServer.get<ApiResponse<UserStatistics>>('/users/statistics');

            if (response.data.success && response.data.data) {
                return response.data.data;
            }
            return null;
        } catch (error) {
            console.error('Get user statistics failed:', error);
            throw error;
        }
    },

    /**
     * GET /api/users/paginated
     * Lấy danh sách users với pagination (Admin)
     */
    async getUsersPaginated(params?: UserListParams): Promise<UserListResponse> {
        try {
            // Backend returns: { success: true, data: User[], pagination: {...} }
            const response = await apiServer.get<{
                success: boolean;
                data: User[];
                pagination: {
                    page: number;
                    limit: number;
                    total: number;
                    totalPages: number;
                };
            }>('/users/paginated', {
                params: {
                    page: params?.page || 1,
                    limit: params?.limit || 20,
                    search: params?.search,
                    role: params?.role,
                    status: params?.status,
                    sortBy: params?.sortBy || 'createdAt',
                    sortOrder: params?.sortOrder || 'desc',
                },
            });

            console.log('📊 getUsersPaginated response:', response.data);

            if (response.data.success && response.data.data) {
                return {
                    users: response.data.data,
                    total: response.data.pagination.total,
                    page: response.data.pagination.page,
                    totalPages: response.data.pagination.totalPages,
                };
            }

            return {
                users: [],
                total: 0,
                page: params?.page || 1,
                totalPages: 0,
            };
        } catch (error) {
            console.error('Get users paginated failed:', error);
            throw error;
        }
    },

    /**
     * GET /api/users
     * Lấy tất cả users (Admin)
     */
    async getAllUsers(): Promise<User[]> {
        try {
            const response = await apiServer.get<ApiResponse<User[]>>('/users');

            if (response.data.success && response.data.data) {
                return response.data.data;
            }
            return [];
        } catch (error) {
            console.error('Get all users failed:', error);
            throw error;
        }
    },

    /**
     * GET /api/users/:id
     * Lấy chi tiết user (Admin)
     */
    async getUserById(id: number): Promise<User | null> {
        try {
            const response = await apiServer.get<ApiResponse<User>>(`/users/${id}`);

            if (response.data.success && response.data.data) {
                return response.data.data;
            }
            return null;
        } catch (error) {
            console.error(`Get user ${id} failed:`, error);
            throw error;
        }
    },

    /**
     * POST /api/users
     * Tạo user mới (Admin)
     */
    async createUser(data: CreateUserRequest): Promise<User | null> {
        try {
            const response = await apiServer.post<ApiResponse<User>>('/users', data);

            if (response.data.success && response.data.data) {
                return response.data.data;
            }
            return null;
        } catch (error) {
            console.error('Create user failed:', error);
            throw error;
        }
    },

    /**
     * PUT /api/users/:id
     * Cập nhật user (Admin)
     */
    async updateUser(id: number, data: UpdateUserRequest): Promise<User | null> {
        try {
            const response = await apiServer.put<ApiResponse<User>>(`/users/${id}`, data);

            if (response.data.success && response.data.data) {
                return response.data.data;
            }
            return null;
        } catch (error) {
            console.error(`Update user ${id} failed:`, error);
            throw error;
        }
    },

    /**
     * DELETE /api/users/:id
     * Xóa user (Admin)
     */
    async deleteUser(id: number): Promise<boolean> {
        try {
            const response = await apiServer.delete<ApiResponse<void>>(`/users/${id}`);
            return response.data.success;
        } catch (error) {
            console.error(`Delete user ${id} failed:`, error);
            throw error;
        }
    },

    /**
     * POST /api/users/bulk-update-status
     * Bulk update trạng thái users (Admin)
     */
    async bulkUpdateStatus(data: BulkUpdateStatusRequest): Promise<boolean> {
        try {
            const response = await apiServer.post<ApiResponse<void>>('/users/bulk-update-status', data);
            return response.data.success;
        } catch (error) {
            console.error('Bulk update status failed:', error);
            throw error;
        }
    },

    /**
     * POST /api/users/bulk-delete
     * Bulk delete users (Admin)
     */
    async bulkDelete(userIds: number[]): Promise<boolean> {
        try {
            const response = await apiServer.post<ApiResponse<void>>('/users/bulk-delete', { userIds });
            return response.data.success;
        } catch (error) {
            console.error('Bulk delete users failed:', error);
            throw error;
        }
    },

    /**
     * GET /api/users/export
     * Export users to Excel (Admin)
     */
    async exportUsers(params?: UserListParams): Promise<Blob> {
        try {
            const response = await apiServer.get('/users/export', {
                params,
                responseType: 'blob',
            });
            return response.data;
        } catch (error) {
            console.error('Export users failed:', error);
            throw error;
        }
    },

    /**
     * GET /api/users/import-template
     * Download import template (Admin)
     */
    async downloadImportTemplate(): Promise<Blob> {
        try {
            const response = await apiServer.get('/users/import-template', {
                responseType: 'blob',
            });
            return response.data;
        } catch (error) {
            console.error('Download import template failed:', error);
            throw error;
        }
    },

    /**
     * POST /api/users/import/preview
     * Preview import data (Admin)
     */
    async previewImport(file: File): Promise<any> {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await apiServer.post<ApiResponse<any>>('/users/import/preview', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success && response.data.data) {
                return response.data.data;
            }
            return null;
        } catch (error) {
            console.error('Preview import failed:', error);
            throw error;
        }
    },

    /**
     * POST /api/users/import
     * Import users from Excel (Admin)
     */
    async importUsers(file: File): Promise<any> {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await apiServer.post<ApiResponse<any>>('/users/import', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success && response.data.data) {
                return response.data.data;
            }
            return null;
        } catch (error) {
            console.error('Import users failed:', error);
            throw error;
        }
    },
};

export default userService;
